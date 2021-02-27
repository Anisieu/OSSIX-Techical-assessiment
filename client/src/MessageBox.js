import React from "react";
import { formatRelative } from "date-fns";
import avatar from "./avatar.png";

const MessageBox = ({
  messages,
  connectedTo,
  message,
  setMessage,
  sendMsg,
  name,
}) => {
  return (
    <div class="messagebox">
      <div>
        <div>
          <h1>
            {!!connectedTo ? connectedTo : "Not chatting with anyone currently"}
          </h1>
          <div>
            {!!connectedTo && messages[connectedTo] ? (
              <div>
                {messages[connectedTo].map(
                  ({ name: sender, message: text, time }) => (
                    <div key={`msg-${name}-${time}`}>
                      <img width="30" alt="" src={avatar} />
                      <span>
                        <span>{sender === name ? "You" : sender}</span>
                        <span>
                          {formatRelative(new Date(time), new Date())}
                        </span>
                        <span>{text}</span>
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div>
                <h1>No messages available yet</h1>
              </div>
            )}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message"
            />
            <button color="teal" disabled={!message} onClick={sendMsg}>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
