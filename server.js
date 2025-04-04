const express = require('express');
const cors = require('cors');
const router = express.Router();
const dotenv = require('dotenv');
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  



app.listen(5000, () => console.log('Server running on port 5000'));