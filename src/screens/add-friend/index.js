// @ts-nocheck
import "./style.css";
import { useEffect, useRef, useState } from "react";
import {
  useSendRequestMutation,
  useFetchRequestsQuery,
  useUpdateRequestMutation,
} from "./slice";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { useFetchContactsQuery } from "src/apiSlice";
import Input from "src/components/input";
import Button from "src/components/button";
import { isMobile } from "src/utils/common";

const AddFriend = () => {
  const userId = useSelector((state) => state?.user?.userInfo?.uid);
  const sidebarRef = useRef({});
  const userContacts = useFetchContactsQuery({ userId })?.contactList || [];
  const [friendId, setFriendId] = useState("");
  const [barOpen, setBarOpen] = useState("default");
  const [selectedContent, setSelectedContent] = useState("Add-Friend");
  const [sendReqErr, setSendReqErr] = useState("No such user found");
  const [isWindowMobile, setIsWindowMobile] = useState(isMobile(window.innerWidth));
  
  const [
    sendNewRequest,
    { isError: addRequestError, isLoading: isSendingRequest },
  ] = useSendRequestMutation();

  const [updateRequest, { isError: updateRequestError }] =
    useUpdateRequestMutation();

  const {
    data: requests,
    isFetching,
    isError,
  } = useFetchRequestsQuery({ userId }, { skip: !userId });

  useEffect(()=>{
    window.addEventListener("resize", autoResize);
    return ()=>{
      window.removeEventListener("resize", autoResize);
    }
  },[])

  const autoResize = () => {
    setIsWindowMobile(isMobile(window.innerWidth))
  }

  const handleOutsideClick = (event) => {
    if (isWindowMobile && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setBarOpen(prevVal=>prevVal === true ? false : prevVal)
    }
  }

  useEffect(()=>{
    window.addEventListener("resize", autoResize);
    document.addEventListener("mousedown", handleOutsideClick);
    return ()=>{
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", autoResize);
    }
  },[]);

  const sendRequest = () => {
    sendNewRequest({ requestId: uuidv4(), userId, friendId, userContacts })
      .unwrap()
      .catch((err) => setSendReqErr(err))
      .finally(()=>setFriendId(""));
  };

  const updateUserRequest = (requestId, type, userReqId) => {
    updateRequest({ requestId, userId, userReqId, type })
      .unwrap()
      .catch((err) => setSendReqErr(err));
  };

  const renderAddFriend = () => {
    return (
      <div style={{ ...(!isWindowMobile && {maxWidth: "30%"}) }}>
        <p className="main-header">Your User Id:-</p>
        <p>{userId}</p>
        <div className="friend-id-container">
          <Input
            value={friendId}
            onChange={setFriendId}
            style={{...{ padding: "15px",  }, ...(isWindowMobile && {width: "70%"}) }}
            placeholder={"Enter a friend id"}
          />
          {isSendingRequest && <span className="loader"></span>}
        </div>
        {addRequestError && <p className="err-msg">{sendReqErr}</p>}
        <Button
          onClick={sendRequest}
          label="Send"
          style={{ marginTop: "20px", padding: "12px" }}
        />
        {isError && <p className="err-msg">Error fetching requests</p>}
      </div>
    );
  };

  const renderSentRequests = () => {
    return (
      <>
        <p className="main-header">Requests Sent</p>
        <div className="requests-container">
          {requests?.sent?.map((req) => {
            return (
              <div className="request-box" key={req.requestId}>
                <p>{req.name}</p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderReceivedRequests = () => {
    // FOR UI testing
    // const NUM = 14;
    // let val = [];
    // for (let i = 0; i < NUM; i++) {
    //   val = requests?.received && [...val, ...requests?.received];
    // }
    return (
      <>
        <p className="main-header">Requests Received</p>
        {updateRequestError && (
          <p className="err-msg">Unable to add or reject requests</p>
        )}
        <div className="requests-container" style={{...(isWindowMobile ? { gridTemplateColumns: "auto"}:{})}}>
          {requests?.received?.map((req) => { 
            return (
              <div key={req?.requestId} className="received-box">
                <p>{req.name}</p>
                <div>
                  <Button
                    onClick={() =>
                      updateUserRequest(req?.requestId, "accept", req?.userId)
                    }
                    label="Accept"
                    style={{ padding: "10px" }}
                  />
                  <Button
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #FF512F 0%, #DD2476  51%, #FF512F  100%)",
                      padding: "10px",
                      marginLeft: "7px"
                    }}
                    onClick={() =>
                      updateUserRequest(req?.requestId, "reject", req?.userId)
                    }
                    label="Reject"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const sidebarObj = [
    {
      key: "Add-Friend",
      icon: require("../../assets/add-friend.png"),
      display: renderAddFriend(),
    },
    {
      key: "Sent-Requests",
      icon: require("../../assets/sent.png"),
      display: renderSentRequests(),
    },
    {
      key: "Received-Requests",
      icon: require("../../assets/received.png"),
      display: renderReceivedRequests(),
    },
  ];

  const sectionToDisplay = () => {
    return sidebarObj.find((disp) => disp?.key === selectedContent)?.display;
  };

  return (
    <div className="sidebar-container">
      <div ref = {sidebarRef} className={`list-container ${barOpen === "default" ? "" :(barOpen ? "slide-in-animate" : "slide-out-animate")}`}>
      {isWindowMobile && (
          <img
            className={`menu-icon ${barOpen === "default" ? "" :(barOpen ? "rotate-in-animate" : "rotate-out-animate")}`}
            src={require("../../assets/menu.png")}
            onClick={() => setBarOpen(prevVal=>prevVal === "default" ? true : !prevVal)}
          />
        )}
        {((isWindowMobile && barOpen===true) || !isWindowMobile) && sidebarObj &&
          sidebarObj?.length > 0 &&
          sidebarObj.map(({ key, icon }) => {
            return (
              <div
                className="item-container"
                style={
                  selectedContent === key ? { backgroundColor: "#00b899" } : {}
                }
                key={key}
                onClick={() => {
                  isWindowMobile && setBarOpen(prevVal=>prevVal === "default" ? true : !prevVal)
                  setSelectedContent(key)
                }}
              >
                <img src={icon} />
                <span className="sidebar-text" style={{ marginLeft: "5px" }}>
                  {key}
                </span>
              </div>
            );
          })}
      </div>

      <div className="display-section-container">{sectionToDisplay()}</div>
    </div>
  );
};

export default AddFriend;
