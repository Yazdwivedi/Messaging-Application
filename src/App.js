import { useEffect, useState } from "react";
import "./App.css";
import { useDispatch } from "react-redux";
import { updateUser } from "./screens/signup/slice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    try {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchContacts({ userId: user?.uid })
            .unwrap()
            .then((res) => {
              dispatch(updateUser({ ...user, username: res?.username }));
              localStorage.setItem("userLoginToken", user?.uid);
              navigate("/main");
            });
        }
      });
    } catch (err) {
      console.log(err);
      localStorage.clear();
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
            {/* <Route path="/*" element={<Navigate to="/login" />}  />  */}
          </Routes>
      </>
    )
  );
}

export default App;
