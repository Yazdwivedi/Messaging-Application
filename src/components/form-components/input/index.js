// @ts-nocheck
import "./style.css";

const FormInput = ({
  style = {},
  placeholder = "",
  label = "",
  labelStyle = {},
  type = "text",
  errMessage = "",
  validation = /^$/,
  register=()=>{return {}},
  error=false,
  required=false
}) => {
  const errorStyle = error ? { border: "1px solid red" } : {};
  return (
    <>
      {label && (
        <p id="inp-label" style={labelStyle}>
          {label}
        </p>
      )}
      <input
        id={"user-inp"}
        style={{ ...style, ...errorStyle }}
        placeholder={placeholder}
        type={type}
        {...register(label, { pattern: validation, required })}
      />
      {error && <p className="err-msg">{errMessage}</p>}
    </>
  );
};

export default FormInput;
