const express = require('express');
const DocumentModel = require('../models/DocumentModel');
const document = express.Router();

document.get("/",(req,res)=>{
    res.send('Welcome in doc route')
});4


// Specific routes first
document.get('/list', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("userId",userId);
    let docs;
    if (userId) {
      docs = await DocumentModel.find({
        $or: [
          { author: userId },
          { visibilityStatus: 'public' },
          { 'sharedWith.user': userId }
        ]
      }).populate('author', 'username email').select('-content');
    } else {
      docs = await DocumentModel.find({ visibilityStatus: 'public' }).populate('author', 'username email').select('-content');
    }
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error listing documents', error: err });
  }
});

document.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const docs = await DocumentModel.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    }).populate('author', 'username email');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error searching documents', error: err });
  }
});

document.post("/create", async (req, res) => {
  try {
    const { title, author, content, visibilityStatus } = req.body;

    // Validate required fields
    if (!title || !author || !content || !visibilityStatus) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if document with the same title exists
    const existingDocument = await DocumentModel.findOne({ title });
    if (existingDocument) {
      return res.status(409).json({ message: 'Document with this title already exists.' });
    }

    // Create new document
    const newDocument = new DocumentModel({
      title,
      author,
      content,
      visibilityStatus
    });

    await newDocument.save();

    res.status(201).json({ message: 'Document created successfully', document: newDocument });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit document (with auto-save)
// PATCH /edit/:id
// Body: { title, content, visibilityStatus, userId }
document.patch('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, visibilityStatus, userId } = req.body;
    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    
    // Save version if content changed
    if (content && content !== doc.content) {
      doc.versions.push({ content: doc.content, modifiedBy: userId });
    }
    
    // Update fields
    if (title) doc.title = title;
    if (content) doc.content = content;
    if (visibilityStatus) doc.visibilityStatus = visibilityStatus;
    doc.lastModified = Date.now();
    
    await doc.save();
    res.json({ message: 'Document updated successfully', doc });
  } catch (err) {
    res.status(500).json({ message: 'Error editing document', error: err });
  }
});

// Manage sharing (add/remove user, set permission)
// POST /share/:id
// Body: { userId, permission }
document.post('/share/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, permission } = req.body;
    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    // Add or update sharing
    const idx = doc.sharedWith.findIndex(s => s.user.toString() === userId);
    if (idx > -1) {
      doc.sharedWith[idx].permission = permission;
    } else {
      doc.sharedWith.push({ user: userId, permission });
    }
    await doc.save();
    res.json({ message: 'Sharing updated', sharedWith: doc.sharedWith });
  } catch (err) {
    res.status(500).json({ message: 'Error updating sharing', error: err });
  }
});

// Remove user from sharing
// DELETE /share/:id/:userId
document.delete('/share/:id/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.sharedWith = doc.sharedWith.filter(s => s.user.toString() !== userId);
    await doc.save();
    res.json({ message: 'User removed from sharing', sharedWith: doc.sharedWith });
  } catch (err) {
    res.status(500).json({ message: 'Error removing user from sharing', error: err });
  }
});

// Get version history
// GET /versions/:id
document.get('/versions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id).populate('versions.modifiedBy', 'username email');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ versions: doc.versions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching version history', error: err });
  }
});

// Mention user in document (auto-share and notify)
// POST /mention/:id
// Body: { mentionedUserId, byUserId }
document.post('/mention/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mentionedUserId, byUserId } = req.body;
    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    // Add to mentions
    if (!doc.mentions.includes(mentionedUserId)) {
      doc.mentions.push(mentionedUserId);
      // Auto-share (read access)
      if (!doc.sharedWith.some(s => s.user.toString() === mentionedUserId)) {
        doc.sharedWith.push({ user: mentionedUserId, permission: 'view' });
      }
      await doc.save();
    }
    // Add notification to mentioned user
    const UserModel = require('../models/UserModel');
    const mentionedUser = await UserModel.findById(mentionedUserId);
    if (mentionedUser) {
      mentionedUser.notifications.push({
        message: `You were mentioned in document '${doc.title}'`,
        document: doc._id
      });
      await mentionedUser.save();
    }
    res.json({ message: 'User mentioned, notified, and given read access.' });
  } catch (err) {
    res.status(500).json({ message: 'Error mentioning user', error: err });
  }
});

// Catch-all route LAST
document.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id).populate('author', 'username email');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching document', error: err });
  }
});


module.exports = document