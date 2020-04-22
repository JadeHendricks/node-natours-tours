const app = require("./app");
//starting file, listen to our server from this file
//starting a server
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});