// @ts-nocheck
import { useState } from "react";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { updateSelectedContact } from "./slice";
import { apiSlice } from "src/apiSlice";

const ContactList = ({contacts=[]}) => {
  // const contacList = useSelector((state) => state?.contacts?.contactList);
  // const selectedContact = useSelector(
  //   (state) => state?.contacts?.selectedContact
  // );
  const data = useSelector((state)=>state[apiSlice.reducerPath].endpoints);
  const dispatch = useDispatch();

  const renderContactList = () => {
    return (
      <div>
        {contacts &&
          contacts.length > 0 &&
          contacts.map(({ userId, name }) => (
            // <p onClick={() => id!==selectedContact?.id && dispatch(updateSelectedContact({ id, name }))}>

            <p key={userId} onClick={() =>dispatch(updateSelectedContact({ userId }))}>
              {name}
            </p>
          ))}
      </div>
    );
  };

  return (
    <div className="contacts-container">
      <h1>Contacts</h1>
      {renderContactList()}
    </div>
  );
};

export default ContactList;
