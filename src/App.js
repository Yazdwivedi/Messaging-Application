import { useEffect, useState } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "./screens/signup/slice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Outlet, Route, Routes } from "react-router-dom";
import { apiSlice } from "./apiSlice";
import MainChatView from "./screens/main-chat-view";
import AddFriend from "./screens/add-friend";
import SignIn from "./screens/signup";
import AuthGuard from "./utils/auth-guard";

function App() {
  const auth = getAuth();
  const userId = useSelector((state) => state?.user?.userInfo?.uid);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchContacts, { isError, isFetching, data }] =
    apiSlice.endpoints.fetchContacts.useLazyQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log("User...123", user);
      if(user){
        dispatch(updateUser(user));
        fetchContacts({ userId: user?.uid });
      }
      setIsLoading(false);
    });
  }, []);

  return !isLoading && (
    <>
      <Routes>
        <Route path="main" element={<AuthGuard id={userId}><MainChatView /></AuthGuard>} />
        <Route path="add-friend" element={<AuthGuard id={userId}><AddFriend /></AuthGuard>} />
        <Route path="sign" element={<SignIn type="signup"/>} />
        <Route path="login" element={<SignIn type="login"/>} />

      </Routes>
    </>
  );
}

export default App;
