// @ts-nocheck
import "./style.css";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import {
  firebaseApis,
  useLogoutUserMutation,
  useSendMessageMutation,
} from "./slice";
import { useNavigate } from "react-router-dom";
import { resetUser } from "src/screens/signup/slice";
import { resetSelectedContact } from "../contact-list/slice";
import Button from "../button";
import Input from "../input";

const ChatBox = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userInp, setUserInp] = useState("");
  const [msgs, setMsgs] = useState([]);
  const msgsRef = useRef();

  const selectedContact = useSelector(
    (state) => state?.contacts?.selectedContact
  );

  const userId = useSelector((state) => state?.user?.userInfo?.uid);
  const [
    fetchMessages,
    { isFetching: isFetchingMsgs, isError: isFetchMsgsErr, data },
  ] = firebaseApis.endpoints.fetchMessages.useLazyQuery();
  const [sendMessage, { isFetching: sendData, isError: isSendMsgErr }] =
    useSendMessageMutation();
  const [logoutUser] = useLogoutUserMutation();

  useEffect(() => {
    const responseMsgIds = [];
    data &&
      data.length > 0 &&
      data.forEach((val) => {
        responseMsgIds.push(val?.msgId);
      });
    const responseMsgs = data && [...data];
    msgs &&
      msgs.length > 0 &&
      msgs.forEach((val) => {
        if (
          !responseMsgIds.includes(val?.msgId) &&
          (val?.status === "loading" || val?.status === "error")
        ) {
          responseMsgs.push(val);
        }
      });
    responseMsgs && setMsgs(responseMsgs);
  }, [data]);

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  useEffect(() => {
    if (!userId || !selectedContact?.userId) {
      return;
    }
    fetchMessages({ userId, selectedContactId: selectedContact?.userId });
  }, [selectedContact, userId]);

  const scrollToBottom = () => {
    msgsRef?.current.scrollIntoView();
  };

  const storeMessage = () => {
    const currentMsgs = [...msgs];
    const timestamp = Date.now();
    const msgId = uuidv4();
    const msgObj = {
      msgId,
      message: userInp,
      timestamp,
      msgType: "send",
      status: "loading",
    };
    currentMsgs.push(msgObj);
    setMsgs((prevState) => {
      return currentMsgs;
    });
    sendMessage({
      msgId,
      senderId: userId,
      receiverId: selectedContact?.userId,
      message: userInp,
      timestamp: timestamp,
    })
      .unwrap()
      .catch((err) => {
        msgErrorUpdate(msgObj);
      });
  };

  const msgErrorUpdate = (msgObj) => {
    setMsgs((prevState) => {
      let newMsg = prevState.map((msg) => {
        if (msgObj?.msgId === msg?.msgId) {
          msg.status = "error";
        }
        return msg;
      });
      const findMsgObj = newMsg.find((msg) => msgObj?.msgId === msg?.msgId);
      const newMsgObj = { ...msgObj, status: "error" };
      if (!findMsgObj) {
        newMsg.push(newMsgObj);
      }
      return newMsg;
    });
  };

  const getMsgStstus = (userMsg) => {
    //TODO Attribute these icons
    switch(userMsg){
      case "loading": return <img src={require("../../assets/loading.gif")}/>;
      case "success": return <img src={require("../../assets/success.png")}/>;
      case "error": return <img src={require("../../assets/fail.png")}/>;
      default : return <img src={require("../../assets/loading.gif")}/>;
    }
  }

  const renderUserMsgs = () => {
    return (
      <div className="message-list">
        {msgs &&
          msgs.length > 0 &&
          msgs.map((msg, i) => {
            const displayDate = new Date(msg?.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            return (
              <div
                key={msg?.msgId}
                className={
                  msg?.msgType === "send"
                    ? "chat-box-sender"
                    : "chat-box-receiver"
                }
              >
                {/* {msg?.status === "loading" && <p>Loading</p>}
              {msg?.status === "success" && <p>Success</p>}
              {msg?.status === "error" && <p>Error</p>} */}
                <p className="message">{msg?.message}</p>
                <span className="time">{displayDate}{msg?.msgType === "send" && getMsgStstus(msg?.status)}</span>
              </div>
            );
          })}
        <div ref={msgsRef} />
      </div>
    );
  };

  const logout = () => {
    logoutUser()
      .unwrap()
      .then(() => {
        dispatch(resetUser());
        dispatch(resetSelectedContact());
        navigate("/login");
      });
  };

  const renderHeader = () => {
    return (
      <div className="header-container">
        <img src={require("../../assets/profile.webp")} />
        <p>{selectedContact?.name}</p>
        <div className="button-group">
          <Button onClick={() => navigate("/add-friend")} label="Add Friend" />
          <Button
            style={{
              backgroundImage:
                "linear-gradient(to right, #FF512F 0%, #DD2476  51%, #FF512F  100%)",
            }}
            onClick={logout}
            label="Logout"
          />
        </div>
      </div>
    );
  };

  return selectedContact ? (
    <div className="chatbox-container">
      {renderHeader()}
      {renderUserMsgs()}
      <div className="input-box">
        <Input
          value={userInp}
          onChange={setUserInp}
          style={{ padding: "15px" }}
          placeholder={"Enter a message"}
        />
        <Button
          style={{
            backgroundImage:
              "linear-gradient(to right, #1FA2FF 0%, #12D8FA  51%, #1FA2FF  100%)",
          }}
          onClick={storeMessage}
          label="Enter"
        />
        {/* <button onClick={storeMessage}>Enter</button> */}
      </div>
    </div>
  ) : (
    <div className="empty-chatbox-container" ref={msgsRef}>
      <img src={require("../../assets/messages.png")} />
      <p>Select a contact to view a list of all contacts and their messages</p>
      <div className="initial-button-group">
        <Button onClick={() => navigate("/add-friend")} label="Add Friend" />
        <Button
          style={{
            backgroundImage:
              "linear-gradient(to right, #FF512F 0%, #DD2476  51%, #FF512F  100%)",
          }}
          onClick={logout}
          label="Logout"
        />
      </div>
    </div>
  );
};

export default ChatBox;
