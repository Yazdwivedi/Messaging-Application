import "./style.css";

const Input = ({style={}, placeholder="", value="", onChange=(e)=>{}}) => {
    return (
        <input id="user-inp" style={style} placeholder={placeholder} value={value} onChange={(e)=>onChange(e?.target?.value)}/>
    );
}

export default Input;