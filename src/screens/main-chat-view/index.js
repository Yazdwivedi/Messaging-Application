// @ts-nocheck
import {useSelector } from "react-redux";
import "./style.css";
import ChatBox from "src/components/chat-box";
import ContactList from "src/components/contact-list";
import { useFetchContactsQuery } from "src/apiSlice";
import { useEffect, useState } from "react";
import { isMobile } from "src/utils/common";

function MainChatView() {
  const [display, setDisplay] = useState("list");
  const user = useSelector((state) => state?.user?.userInfo);
  const userContacts = useFetchContactsQuery({ userId: user?.uid }) || [];
  const [isWindowMobile, setIsWindowMobile] = useState(isMobile(window.innerWidth));

  const autoResize = () => {
    setIsWindowMobile(isMobile(window.innerWidth))
  }

  useEffect(()=>{
    window.addEventListener("resize", autoResize);
    return ()=>{
      window.removeEventListener("resize", autoResize);
    }
  },[])

  return (
      <div className="app-container">
        <ContactList contacts={userContacts?.data?.contactList} user={user} display={display} setDisplay={setDisplay} isWindowMobile={isWindowMobile}/>
        <ChatBox display={display} setDisplay={setDisplay} isWindowMobile={isWindowMobile}/>
      </div>
  );
}

export default MainChatView;
