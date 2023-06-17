import "./style.css"

const Button = ({style={}, label="", onClick=()=>{}, disabled=false}) => {
    const disabledStyle = disabled ? {opacity: 0.25, cursor: "not-allowed"}:{};
    return (
        <button disabled={disabled} id="userButton" style={{...style, ...disabledStyle}} onClick={onClick}>{label}</button>
    );
}

export default Button;