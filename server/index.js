require("dotenv").config();
const WebSocket = require("ws");
const http = require("http");
const fs = require('fs');
const path = require("path");
const uuidv4 = require("uuid/v4");
const { Client } = require("pg");

const port = process.env.PORT || 5000;
const connectionString = process.env.DB_URL;

// Database connection
const client = new Client({
  connectionString,
});
client.connect();

const savemessage = ({ sender, receiver, message }) => {
  const id = uuidv4();

  const insertQuery = {
    text:
      "INSERT INTO chat(id, sender, receiver, message) VALUES($1, $2, $3, $4)",
    values: [id, sender, receiver, message],
  };

  return client.query(insertQuery);
  // .then((res) => console.log(res.rows[0]))
  // .catch((e) => console.error(e.stack));
};


const staticBasePath = './client/build/';

const server = http.createServer(function (req, res) {
  const resolvedBase = path.resolve(staticBasePath);
  if (req.url === '/') req.url = '/index.html'
  const safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const fileLoc = path.join(resolvedBase, safeSuffix);
  
  fs.readFile(fileLoc, function(err, data) {
    if (err) {
        res.writeHead(404, 'Not Found');
        res.write('404: File Not Found!');
        return res.end();
    }
    
    res.statusCode = 200;

    res.write(data);
    return res.end();
  });
});

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let users = {};

const sendTo = (connection, message) => {
  connection.send(JSON.stringify(message));
};

const sendToAll = (clients, type, { id, name: userName }) => {
  Object.values(clients).forEach((client) => {
    if (client.name !== userName) {
      client.send(
        JSON.stringify({
          type,
          user: { id, userName },
        })
      );
    }
  });
};

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    console.log("Received message: %s", msg);
    let data;

    //accepting only JSON messages
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }
    const { type, name, offer, answer, candidate } = data;
    switch (type) {
      //when a user tries to login
      case "login":
        //Check if username is available
        if (users[name]) {
          sendTo(ws, {
            type: "login",
            success: false,
            message: "Username is unavailable",
          });
        } else {
          const id = uuidv4();
          const loggedIn = Object.values(
            users
          ).map(({ id, name: userName }) => ({ id, userName }));
          // const loggedIn = Object.keys(users).map(user => ({ userName: user }));
          users[name] = ws;
          ws.name = name;
          ws.id = id;

          sendTo(ws, {
            type: "login",
            success: true,
            users: loggedIn,
          });
          sendToAll(users, "updateUsers", ws);

          savemessage({ sender: name, receiver: null, message: ws.message })
            .then((res) => console.log(res.rows[0]))
            .catch((e) => console.error(e.stack));
        }
        break;
      case "offer":
        //if UserBexists then send him offer details
        const offerRecipient = users[name];

        if (!!offerRecipient) {
          //setting that sender connected with cecipient
          ws.otherName = name;
          sendTo(offerRecipient, {
            type: "offer",
            offer,
            // name: ws.name,
          });
        }
        break;
      case "answer":
        //for ex. UserB answers UserA
        const answerRecipient = users[name];

        if (!!answerRecipient) {
          ws.otherName = name;
          sendTo(answerRecipient, {
            type: "answer",
            answer,
          });

          let sender = null;
          Object.keys(users).forEach(function (key) {
            if (users[key] == ws.id) sender = key;
          });

          sender = ws.id;
          savemessage({ sender, receiver: name, message: answer })
            .then((res) => console.log(res.rows[0]))
            .catch((e) => console.error(e.stack));
        }
        break;
      case "candidate":
        const candidateRecipient = users[name];

        if (!!candidateRecipient) {
          sendTo(candidateRecipient, {
            type: "candidate",
            candidate,
          });
        }
        break;
      case "leave":
        recipient = users[name];

        //notify the other user so he can disconnect his peer connection
        if (!!recipient) {
          recipient.otherName = null;
          sendTo(recipient, {
            type: "leave",
          });
        }
        break;
      default:
        sendTo(ws, {
          type: "error",
          message: "Command not found: " + type,
        });
        break;
    }
  });

  ws.on("close", function () {
    if (ws.name) {
      delete users[ws.name];
      if (ws.otherName) {
        console.log("Disconnecting from ", ws.otherName);
        const recipient = users[ws.otherName];
        if (!!recipient) {
          recipient.otherName = null;
        }
      }
      sendToAll(users, "removeUser", ws);
    }
  });
  //send immediatly a feedback to the incoming connection
  ws.send(
    JSON.stringify({
      type: "connect",
      message: "Well hello there, I am a WebSocket server",
    })
  );
});

//start our server
server.listen(port, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
