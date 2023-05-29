import "./style.css"

const Button = ({style={}, label="", onClick=()=>{}}) => {
    return (
        <button id="userButton" style={style} onClick={onClick}>{label}</button>
    );
}

export default Button;