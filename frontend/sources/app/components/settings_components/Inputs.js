'use client'
import { useState } from "react"
import Input from "./Input.js"
import { useEffect } from "react"
import { useAuth } from "@/app/contexts/authContext.js"
export default function Inputs({setData, setConfirmPassword}){
    let [firstName, setFirstName] = useState(null)
    let [lastName, setLastName] = useState(null)
    let [userName, setUserName] = useState(null)
    let [email, setEmail] = useState(null)
    let [oldPassword, setOldPassword] = useState(null)
    let [newPassword, setNewPassword] = useState(null)
    const {user} = useAuth()
    useEffect(() =>{
        let simo = {password: oldPassword, new_password: newPassword}
        setData(simo)
    }, [oldPassword, newPassword])
    return (
        <form className="w-[280px]">
            {/* <Input labe={"First Name"} type="text" setter={setFirstName} ids={"one"} data={{first_name: firstName}}></Input> */}
            {/* <Input labe={"Last Name"} type="text" setter={setLastName} ids={"two"} data={{last_name: lastName}}></Input> */}
            <Input labe={"UserName"} type="text" setter={setUserName} ids={"three"} data={{username: userName}}></Input>
            <Input labe={"Email"} type="email" setter={setEmail} ids={"four"} data={{email: email}}></Input>
            {
                !user.oauth_42 && 
                <>
                    <Input labe={"Old Password"} type="password" setter={setOldPassword} ids={"five"} data={oldPassword}></Input>
                    <Input labe={"New Password"} type="password" setter={setNewPassword} ids={"six"} data={newPassword}></Input>
                    <Input labe={"Confirm Password"} type="password" setter={setConfirmPassword} ids={"seven"}></Input>
                </>
            }
        </form>
    )
}