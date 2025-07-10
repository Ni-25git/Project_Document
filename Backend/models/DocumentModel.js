const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title:{type:String,required:true , unique:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'User' , required:true},
    content:{type:String , required:true},
    lastModified:{type:Date, default:Date.now()},
    visibilityStatus:{type:String , enum:['public', 'private', 'restricted'],required:true , default:'private'},
    sharedWith: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: { type: String, enum: ['view', 'edit'], default: 'view' }
    }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    versions: [{
        content: String,
        modifiedAt: { type: Date, default: Date.now },
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
},{versionKey:false});

DocumentSchema.pre('save', function (next) {
  this.lastModified = Date.now();
  next();
});


const DocumentModel = mongoose.model('Document',DocumentSchema);

module.exports = DocumentModel;