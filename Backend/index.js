const express = require('express');
require('dotenv').config();
const connectDb = require('./config/db');
const user = require('./routes/UserRouter');
const cors = require('cors');
const document = require('./routes/DocumentRouter');
const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/user' , user);
app.use('/api/doc',document)


app.get('/' , (req,res)=>{
    res.send('Welcome to server');
})



app.listen(PORT , async ()=>{
    try {
        await connectDb();
        console.log(`server is listening on PORT ${PORT} and db is connected with server`)
    } catch (error) {
        console.log('error in connecting db with server', error)
    }
})