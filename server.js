const mongoose = require("mongoose");
const dotenv = require("dotenv");
//only needs to happen once to use globally and before app
// console.log(process.env);
dotenv.config({path: "./config.env"});

const app = require("./app");

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

//Takes the connection string and some options
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then((connectionOBJ) => console.log("DB connection successful"));

//starting file, listen to our server from this file
//starting a server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});