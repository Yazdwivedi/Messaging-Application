// @ts-nocheck
import { useState } from "react";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { updateSelectedContact } from "./slice";
import Input from "../input";

const ContactList = ({ contacts = [], user = {} }) => {
  const [searchVal, setSearchVal] = useState("");
  const selectedContact = useSelector(
    (state) => state?.contacts?.selectedContact
  );
  const dispatch = useDispatch();

  const renderContactList = () => {
    let filteredContacts = contacts.filter((val) =>
      val?.name.toLowerCase().includes(searchVal.toLowerCase())
    );
    return filteredContacts?.length > 0 ? (
      <div className="contacts-container">
        {filteredContacts &&
          filteredContacts.length > 0 &&
          filteredContacts.map(({ userId, name }) => (
            <div
              style={
                selectedContact?.userId === userId
                  ? { backgroundColor: "#F9F5F4" }
                  : {}
              }
              className="user-contact"
              onClick={() => dispatch(updateSelectedContact({ userId, name }))}
            >
              <img src={require("../../assets/contacts.png")} />
              <p key={userId}>{name}</p>
            </div>
          ))}
      </div>
    ) : (
      <p>No contacts found</p>
    );
  };

  return (
    <div className="contacts-box-container">
      <div className="user-info">
        <img src={require("../../assets/profile.webp")} />
        <p>{user?.username || ""}</p>
        <Input
          value={searchVal}
          onChange={setSearchVal}
          placeholder={"Search for a contact"}
        />
      </div>
      {renderContactList()}
    </div>
  );
};

export default ContactList;
