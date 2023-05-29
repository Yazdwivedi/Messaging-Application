// @ts-nocheck
import {useSelector } from "react-redux";
import "./style.css";
import ChatBox from "src/components/chat-box";
import ContactList from "src/components/contact-list";
import { useFetchContactsQuery } from "src/apiSlice";
function MainChatView() {
  const user = useSelector((state) => state?.user?.userInfo);
  const userContacts = useFetchContactsQuery({ userId: user?.uid }) || [];
  return (
      <div className="app-container">
        <ContactList contacts={userContacts?.data} user={user}/>
        <ChatBox />
      </div>
  );
}

export default MainChatView;
