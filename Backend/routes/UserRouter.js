const express = require('express');
const UserModel = require('../models/UserModel');
const user = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/Auth');
const sendMail = require('../utils/sendMail');

user.get("/", verifyToken, (req,res)=>{
    res.json({"msg":'Welcome in user route'})
});

user.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please give all credentials' });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const saltRounds = parseInt(process.env.SALT_ROUND) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User Registered successfully', newUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error in user registration', error: error.message });
    }
});

user.post('/login' , async(req,res)=>{
    try {
        const {email , password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:'Please give registered email and password'});
        }

        const loginUser = await UserModel.findOne({email});
        if(!loginUser){
            return res.status(400).json({message:'User not found'});
        }
        
        const isValidPassword = await bcrypt.compare(password , loginUser.password);
        if(!isValidPassword){
            return res.status(400).json({message:'Invalid Password'});
        }
        
        const token = jwt.sign({id:loginUser._id},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.status(201).json({
            message:'User logged in successfully',
            token, 
            loginUser: {
                _id: loginUser._id,
                username: loginUser.username,
                email: loginUser.email
            }
        });

    } catch (error) {
        res.status(500).json({message:'Error in logging',error});
    }
});

user.post("/forgot-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Please provide email and new password.' });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password.', error });
    }
});

// Verify email
user.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await UserModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiration = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Error verifying email.', error });
    }
});

// Resend verification email
user.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address.' });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        // Generate new verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpiration = Date.now() + 3600000; // 1 hour

        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpiration = emailVerificationExpiration;
        await user.save();

        // Send verification email (implement nodemailer here)
        const verificationLink = `http://localhost:5173/verify-email/${emailVerificationToken}`;
        
        res.status(200).json({ 
            message: 'Verification email sent successfully.',
            verificationLink // Remove this in production
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Error sending verification email.', error });
    }
});

// Change password (for logged-in users)
user.post('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password.' });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password.', error });
  }
});

// Get user notifications
// GET /notifications/:userId
user.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const UserModel = require('../models/UserModel');
    const userDoc = await UserModel.findById(userId).populate('notifications.document', 'title');
    if (!userDoc) return res.status(404).json({ message: 'User not found' });
    res.json({ notifications: userDoc.notifications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err });
  }
});

// List documents shared with the user
// GET /shared-docs/:userId
user.get('/shared-docs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const UserModel = require('../models/UserModel');
    const userDoc = await UserModel.findById(userId).populate('sharedDocuments.document');
    if (!userDoc) return res.status(404).json({ message: 'User not found' });
    res.json({ sharedDocuments: userDoc.sharedDocuments });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shared documents', error: err });
  }
});


module.exports = user;