// @ts-nocheck
import { useDispatch, useSelector } from "react-redux";
import "./style.css";
import ChatBox from "src/components/chat-box";
import ContactList from "src/components/contact-list";
import { useFetchContactsQuery } from "src/apiSlice";
import { useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "./slice";
import { resetUser } from "../signup/slice";
import { resetSelectedContact } from "src/components/contact-list/slice";

function MainChatView() {
  const user = useSelector((state) => state?.user?.userInfo);
  const userContacts = useFetchContactsQuery({ userId: user?.uid }) || [];
  const [logoutUser] = useLogoutUserMutation();
  // @ts-ignore
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const logout = () => {
    logoutUser().unwrap().then(()=>{
      dispatch(resetUser());
      dispatch(resetSelectedContact());
      navigate("/login");
    })
  }
  return (
      <div className="app-container">
        <ContactList contacts={userContacts?.data} user={user}/>
        <ChatBox />
        <button onClick={() => navigate("/add-friend")}>Add Friend</button>
        <button onClick={logout}>Logout</button>
      </div>
  );
}

export default MainChatView;
