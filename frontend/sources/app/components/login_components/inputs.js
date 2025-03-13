import Input from "./input.js"
import Button from "../global/button.js"

export default function Inputs({formInfo}){
    return (
        <div className="inputs mb-[25px] flex flex-col gap-[7px]">
            <div className="flex flex-col">
                <label>Username</label>
                <Input type="text" change={(e) =>{
                    formInfo.setUserName(e.target.value);
                }}></Input>
            </div>
            
            <div className="flex flex-col">
                <label>Password</label>
                <Input type="password" change={(e) =>{
                    formInfo.setPassword(e.target.value);
                }}></Input>
            </div>
        </div>
    )
}