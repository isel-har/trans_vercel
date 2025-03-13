'use client';

import Input from "../login_components/input"
import Button from "../global/button.js"
import { useState } from "react";

export default function Inputs({formInfo}){
    return (
        <div className="inputs mb-[25px] flex flex-col gap-[7px]">
            <div className="flex flex-col">
                <label>Email</label>
                <Input type="email" change={(e) => {
                    formInfo.setEmail(e.target.value) 
                    }}></Input>
            </div>
            <div className="flex flex-col">
                <label>Username</label>
                <Input type="text" change={(e) => {
                    formInfo.setUsername(e.target.value) 
                    }}></Input>
            </div>
            <div className="flex flex-col">
                <label>Password</label>
                <Input type="password" change={(e) => {
                    formInfo.setPassword(e.target.value) 
                    }}></Input>
            </div>
            <div className="flex flex-col">
                <label>Confirm Password</label>
                <Input type="password" change={(e) => {
                    formInfo.setConfirmP(e.target.value) 
                    }}></Input>
            </div>
        </div>
    )
}