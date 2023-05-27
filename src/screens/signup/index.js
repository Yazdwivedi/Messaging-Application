import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { updateUser, useCreateUserMutation, useLoginUserMutation } from "./slice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const SignIn = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createUser] = useCreateUserMutation();
  const [loginUser] = useLoginUserMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const signInExistingUser = () => {
    loginUser({email, password}).unwrap().then(res=>{
      dispatch(updateUser(res));
      navigate("/main");
    });
  };

  const signInNewUser = () => {
    createUser({ email, password })
      .unwrap()
      .then((res) => {
        dispatch(updateUser(res));
        navigate("/main");
      });
  };

  return type === "signup" ? (
    <div>
      <h3>Sign Up</h3>
      Email
      <input value={email} onChange={(e) => setEmail(e?.target?.value)} />
      <br />
      Password
      <input value={password} onChange={(e) => setPassword(e?.target?.value)} />
      <button onClick={signInNewUser}>Submit</button>
    </div>
  ) : (
    <div>
      <h3>Login</h3>
      Email
      <input value={email} onChange={(e) => setEmail(e?.target?.value)} />
      <br />
      Password
      <input value={password} onChange={(e) => setPassword(e?.target?.value)} />
      <button onClick={signInExistingUser}>Submit</button>
    </div>
  );
};

export default SignIn;
