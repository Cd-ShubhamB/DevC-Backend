const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
 
 mongoose.connect(process.env.MONGO_URI)
   .then(() => console.log('MongoDB Connected'))
   .catch(err => console.log(err));
 
 const UserSchema = new mongoose.Schema({
   name: String,
   email: String,
   password: String
 });
//  const User = mongoose.model('User', UserSchema);

 module.exports = mongoose.model("User", UserSchema);