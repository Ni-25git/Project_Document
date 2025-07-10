const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{type:String , required:true},
    email:{type: String , required:true , unique:true},
    password:{type:String , required:true},
    resetToken:{type:String},
    resetTokenExpiration:{type:Date},
    notifications: [{
        message: String,
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    sharedDocuments: [{
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        permission: { type: String, enum: ['view', 'edit'], default: 'view' }
    }]
},
{versionKey:false});

const UserModel = mongoose.model('User' , UserSchema);

module.exports = UserModel
