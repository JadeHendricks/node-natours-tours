const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
//only needs to happen once to use globally and before app
// console.log(process.env);
const app = require("./app");

//starting file, listen to our server from this file
//starting a server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});