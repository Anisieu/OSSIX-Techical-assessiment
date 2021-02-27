/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import "./App.css";
import UsersList from "./UsersList";
import MessageBox from "./MessageBox";

// Use for remote connections
const configuration = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

// Use for local connections
// const configuration = null;

const Chat = ({ connection, updateConnection, channel, updateChannel }) => {
  const [socketOpen, setSocketOpen] = useState(false);
  const [socketMessages, setSocketMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [connectedTo, setConnectedTo] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [alert, setAlert] = useState("");
  const connectedRef = useRef();
  const webSocket = useRef(null);
  const [message, setMessage] = useState("");
  const messagesRef = useRef({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    webSocket.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    webSocket.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setSocketMessages((prev) => [...prev, data]);
    };
    webSocket.current.onclose = () => {
      webSocket.current.close();
    };
    return () => webSocket.current.close();
  }, []);

  useEffect(() => {
    let data = socketMessages.pop();
    if (data) {
      switch (data.type) {
        case "connect":
          setSocketOpen(true);
          break;
        case "login":
          onLogin(data);
          break;
        case "updateUsers":
          updateUsersList(data);
          break;
        case "removeUser":
          removeUser(data);
          break;
        case "offer":
          onOffer(data);
          break;
        case "answer":
          onAnswer(data);
          break;
        case "candidate":
          onCandidate(data);
          break;
        default:
          break;
      }
    }
  }, [socketMessages]);

  const send = (data) => {
    webSocket.current.send(JSON.stringify(data));
  };

  const handleLogin = () => {
    setLoggingIn(true);
    send({
      type: "login",
      name,
    });
  };

  const updateUsersList = ({ user }) => {
    setUsers((prev) => [...prev, user]);
  };

  const removeUser = ({ user }) => {
    setUsers((prev) => prev.filter((u) => u.userName !== user.userName));
  };

  const handleDataChannelMessageReceived = ({ data }) => {
    const message = JSON.parse(data);
    const { name: user } = message;
    let messages = messagesRef.current;
    let userMessages = messages[user];
    if (userMessages) {
      userMessages = [...userMessages, message];
      let newMessages = Object.assign({}, messages, { [user]: userMessages });
      messagesRef.current = newMessages;
      setMessages(newMessages);
    } else {
      let newMessages = Object.assign({}, messages, { [user]: [message] });
      messagesRef.current = newMessages;
      setMessages(newMessages);
    }
  };

  const onLogin = ({ success, message, users: loggedIn }) => {
    setLoggingIn(false);
    if (success) {
      setAlert("Logged in successfully!");
      setIsLoggedIn(true);
      setUsers(loggedIn);
      let localConnection = new RTCPeerConnection(configuration);
      //when the browser finds an ice candidate we send it to another peer
      localConnection.onicecandidate = ({ candidate }) => {
        let connectedTo = connectedRef.current;

        if (candidate && !!connectedTo) {
          send({
            name: connectedTo,
            type: "candidate",
            candidate,
          });
        }
      };
      localConnection.ondatachannel = (event) => {
        console.log("Data channel is created!");
        let receiveChannel = event.channel;
        receiveChannel.onopen = () => {
          console.log("Data channel is open and ready to be used.");
        };
        receiveChannel.onmessage = handleDataChannelMessageReceived;
        updateChannel(receiveChannel);
      };
      updateConnection(localConnection);
    } else {
      setAlert(message);
    }
  };

  //when somebody wants to message us
  const onOffer = ({ offer, name }) => {
    setConnectedTo(name);
    connectedRef.current = name;

    connection
      .setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => connection.createAnswer())
      .then((answer) => connection.setLocalDescription(answer))
      .then(() =>
        send({ type: "answer", answer: connection.localDescription, name })
      )
      .catch((e) => {
        console.log({ e });
        setAlert("An error has occurred.");
      });
  };

  //when another user answers to our offer
  const onAnswer = ({ answer }) => {
    connection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  //when we got ice candidate from another user
  const onCandidate = ({ candidate }) => {
    connection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  //when a user clicks the send message button
  const sendMsg = () => {
    const time = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    let text = { time, message, name };
    let messages = messagesRef.current;
    let connectedTo = connectedRef.current;
    let userMessages = messages[connectedTo];
    if (messages[connectedTo]) {
      userMessages = [...userMessages, text];
      let newMessages = Object.assign({}, messages, {
        [connectedTo]: userMessages,
      });
      messagesRef.current = newMessages;
      setMessages(newMessages);
    } else {
      userMessages = Object.assign({}, messages, { [connectedTo]: [text] });
      messagesRef.current = userMessages;
      setMessages(userMessages);
    }
    console.log("channel", channel);
    channel.send(JSON.stringify(text));
    setMessage("");
  };

  const handleConnection = (name) => {
    // var dataChannelOptions = {
    //   reliable: true,
    // };

    let dataChannel = connection.createDataChannel("messenger");

    dataChannel.onerror = (error) => {
      setAlert("An error has occurred.");
    };

    dataChannel.onmessage = handleDataChannelMessageReceived;
    updateChannel(dataChannel);

    connection
      .createOffer()
      .then((offer) => connection.setLocalDescription(offer))
      .then(() =>
        send({ type: "offer", offer: connection.localDescription, name })
      )
      .catch((e) => setAlert("An error has occurred."));
  };

  const toggleConnection = (userName) => {
    if (connectedRef.current === userName) {
      setConnecting(true);
      setConnectedTo("");
      connectedRef.current = "";
      setConnecting(false);
    } else {
      setConnecting(true);
      setConnectedTo(userName);
      connectedRef.current = userName;
      handleConnection(userName);
      setConnecting(false);
    }
  };
  return (
    <div className="App">
      <div center style={{ color: "red" }}>
        {alert}
      </div>
      <h2>Simple one to one chat application</h2>
      {(socketOpen && (
        <Fragment>
          <div class="loginuser">
            <div>
              {(!isLoggedIn && (
                <div>
                  <input
                    disabled={loggingIn}
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Username..."
                  />
                  <button
                    color="teal"
                    disabled={!name || loggingIn}
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                </div>
              )) || (
                <div raised textAlign="center" color="olive">
                  Logged In as: {name}
                </div>
              )}
            </div>
          </div>
          <div>
            <UsersList
              users={users}
              toggleConnection={toggleConnection}
              connectedTo={connectedTo}
              connection={connecting}
            />
            <MessageBox
              messages={messages}
              connectedTo={connectedTo}
              message={message}
              setMessage={setMessage}
              sendMsg={sendMsg}
              name={name}
            />
          </div>
        </Fragment>
      )) || <div>Loading</div>}
    </div>
  );
};

export default Chat;
