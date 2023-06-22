// @ts-nocheck
import "./style.css";
import { useEffect, useState } from "react";
import {
  updateUser,
  useCreateUserMutation,
  useLoginUserMutation,
} from "./slice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Button from "../../components/button";
import { useForm } from "react-hook-form";
import FormInput from "src/components/form-components/input";


const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const SignIn = ({ type }) => {
  const [loginErr, setLoginErr] = useState("");

  const [createUser] = useCreateUserMutation();
  const [loginUser] = useLoginUserMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { Email: "", Password: "", Username: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    reset({ Email: "", Password: "" });
  }, [type]);

  const signInExistingUser = () => {
    const formValues = getValues();
    loginUser({ email: formValues?.Email, password: formValues?.Password })
      .unwrap()
      .then((res) => {
        navigate("/main");
      })
      .catch((err) => setLoginErr(getErrorMessage(err?.code)));
  };

  const signInNewUser = () => {
    const formValues = getValues();
    createUser({ email: formValues?.Email, password: formValues?.Password, name: formValues?.Username })
      .unwrap()
      .then((res) => {
        navigate("/main");
      });
  };

  const getErrorMessage = (msg) => {
    switch (msg) {
      case "auth/invalid-email":
        return "Invalid User Id or Email";
      case "auth/user-not-found":
        return "No such user found";
      default:
        return "Something went wrong";
    }
  };

  return type === "signup" ? (
    <div className="signup-container">
      <div className="input-container">
        <p className="signup-heading">User Sign-up</p>
        <FormInput
          style={{ padding: "15px", width: "90%", alignSelf: "center" }}
          placeholder={"Enter Username"}
          label={"Username"}
          register={register}
          error={errors["Username"]}
          required={true}
          errMessage={"Please enter a username"}
        />
        <FormInput
          style={{ padding: "15px", width: "90%", alignSelf: "center" }}
          placeholder={"Enter email"}
          label={"Email"}
          register={register}
          error={errors["Email"]}
          validation={EMAIL_REGEX}
          required={true}
          errMessage={"Please enter proper email"}
        />
        <FormInput
          style={{ padding: "15px", width: "90%", alignSelf: "center" }}
          placeholder={"Enter password"}
          label={"Password"}
          type="password"
          register={register}
          error={errors["Password"]}
          validation={PASSWORD_REGEX}
          required={true}
          errMessage={
            "Password should contain atleast 1 uppercase, 1 lowercase, 1 number, 1 special character and must be between 8 and 20 digits in length"
          }
        />
        <Button
          onClick={signInNewUser}
          label="Sign Up"
          style={{ marginTop: "30px" }}
          disabled={!isValid}
        />

        <Button
          onClick={() => {
            navigate("/login");
          }}
          label="User Login"
          style={{
            marginTop: "15px",
            backgroundImage:
              "linear-gradient(to right, #045de9 0%, #09c6f9  52%, #045de9 100%)",
          }}
        />
      </div>
    </div>
  ) : (
    <div className="signup-container">
      <div className="input-container">
        <p className="signup-heading">User Login</p>
        <FormInput
          style={{ padding: "15px", width: "90%", alignSelf: "center" }}
          placeholder={"Enter email"}
          label={"Email"}
          register={register}
          error={errors["Email"]}
          validation={EMAIL_REGEX}
          required={true}
          errMessage={"Please enter proper email"}
        />
        <FormInput
          style={{ padding: "15px", width: "90%", alignSelf: "center" }}
          placeholder={"Enter password"}
          label={"Password"}
          type="password"
          register={register}
          error={errors["Password"]}
          validation={PASSWORD_REGEX}
          required={true}
          errMessage={
            "Password should contain atleast 1 uppercase, 1 lowercase, 1 number, 1 special character and must be between 8 and 20 digits in length"
          }
        />
        {loginErr && <p className="err-msg">{loginErr}</p>}
        <Button
          onClick={signInExistingUser}
          label="Log In"
          style={{ marginTop: "30px" }}
          disabled={!isValid}
        />

        <Button
          onClick={() => {
            navigate("/sign");
          }}
          label="Register User"
          style={{
            marginTop: "15px",
            backgroundImage:
              "linear-gradient(to right, #045de9 0%, #09c6f9  52%, #045de9 100%)",
          }}
        />
      </div>
    </div>
  );
};

export default SignIn;
