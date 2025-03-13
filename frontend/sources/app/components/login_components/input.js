import "../../app_css/inputs.css"

export default function Input({type,change, value}){
    return (
        <>
            <input type={type} value={value} onChange={change}></input>
        </>
    )
}