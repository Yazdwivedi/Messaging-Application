// @ts-nocheck
import { useState } from "react";
import "./style.css";
import { useDispatch } from "react-redux";
import { updateSelectedContact } from "./slice";
import Input from "../input";

const ContactList = ({ contacts = [], user = {} }) => {
  
  const [searchVal, setSearchVal] = useState("");
  const dispatch = useDispatch();
  
  const renderContactList = () => {

    //TODO remove this later
    let contacts = [
      { userId: 1, name: "User 1" },
      { userId: 2, name: "User 2" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },
      { userId: 3, name: "User 3" },

       { userId: 3, name: "User 3" },
        { userId: 3, name: "User 3" },
        { userId: 3, name: "User 3" }, { userId: 3, name: "User 3" }, { userId: 3, name: "User 3" }, { userId: 3, name: "User 3" }, { userId: 3, name: "User 3" },
    ];
    let filteredContacts = contacts.filter(val=>(val?.name.toLowerCase()).includes(searchVal.toLowerCase()));
    return filteredContacts?.length>0 ? (
      <div className="contacts-container">
        {filteredContacts &&
          filteredContacts.length > 0 &&
          filteredContacts.map(({ userId, name }) => (
            <div className="user-contact">
              
              <img src={require("../../assets/contacts.png")} />
              <p
                key={userId}
                onClick={() => dispatch(updateSelectedContact({ userId }))}
              >
                {name}
              </p>
            </div>
          ))}
      </div>
    ): <p>No contacts found</p>;
  };

  return (
    <div className="contacts-box-container">
      <div className="user-info">
        <img src={require("../../assets/profile.webp")} />
        <p>{user?.displayName || "Yash Dwivedi"}</p>
        <Input value={searchVal} onChange={setSearchVal} placeholder={"Search for a contact"}/>
      </div>
      {renderContactList()}
    </div>
  );
};

export default ContactList;
