require("dotenv").config();
const { Client } = require("pg");

const connectionString = process.env.DB_URL;

const client = new Client({
  connectionString,
});

client.connect();

const uuidv4 = require("uuid/v4");
const id = uuidv4();

// const insertQuery = {
//   text:
//     "INSERT INTO chat(id, sender, receiver, message) VALUES($1, $2, $3, $4)",
//   values: [id, "jo", "ti", "Hello again"],
// };

// client
//   .query(insertQuery)
//   .then((res) => console.log(res.rows[0]))
//   .catch((e) => console.error(e.stack));

const selectQuery = "SELECT * FROM chat";
client
  .query(selectQuery)
  .then((res) => console.log(res.rows))
  .catch((e) => console.error(e.stack));

// client.query(selectQuery, (err, res) => {
//   console.log(err, res);
//   client.end();
// });
