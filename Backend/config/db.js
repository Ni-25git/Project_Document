const mongoose = require('mongoose');

const connectDb= async ()=>{
try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('db is connected')
} catch (error) {
    console.log('errror in connecting db')
}
}

module.exports = connectDb;