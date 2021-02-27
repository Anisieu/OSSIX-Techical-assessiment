import React from "react";
import avatar from "./avatar.png";

const UsersList = ({ users, toggleConnection, connectedTo, connecting }) => {
  return (
    <div class="userlist">
      <div>
        <h1>Online Users</h1>
        <div>
          {(users.length && (
            <ul>
              {users.map(({ userName }) => (
                <li key={userName}>
                  <li>
                    <button
                      onClick={() => {
                        toggleConnection(userName);
                      }}
                      disabled={!!connectedTo && connectedTo !== userName}
                      loading={connectedTo === userName && connecting}
                    >
                      {connectedTo === userName ? "Disconnect" : "Connect"}
                    </button>
                  </li>
                  <img width="30" src={avatar} alt="" />
                  <li>{userName}</li>
                </li>
              ))}
            </ul>
          )) || <div>There are no users Online</div>}
        </div>
      </div>
    </div>
  );
};

export default UsersList;
