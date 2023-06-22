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
  const userId = localStorage.getItem("userLoginToken");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchContacts, { isError, isFetching, data }] =
    apiSlice.endpoints.fetchContacts.useLazyQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchContacts({ userId: user?.uid })
            .unwrap()
            .then((res) => {
              dispatch(updateUser({ ...user, username: res?.username }));
              localStorage.setItem("userLoginToken", user?.uid)
            })
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    !isLoading && (
      <>
        <Routes>
          <Route
            path="main"
            element={
              <AuthGuard id={userId}>
                <MainChatView />
              </AuthGuard>
            }
          />
          <Route
            path="add-friend"
            element={
              <AuthGuard id={userId}>
                <AddFriend />
              </AuthGuard>
            }
          />
          <Route path="sign" element={<SignIn type="signup" />} />
          <Route path="login" element={<SignIn type="login" />} />
        </Routes>
      </>
    )
  );
}

export default App;
