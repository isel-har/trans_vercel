"use client";
import "../../app_css/register.css";
import Inputs from "../../components/register_components/inputs";
import Button from "../../components/global/button";
import Link from "next/link";
import { useContext, useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Register() {

  const [email, setEmail] = useState("");
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmP] = useState("");

  return (
    <div className="register z-15">
      <Alert variant="destructive" className="error">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="border-red paragraph_er">
          Your login credentials are wrong!
        </AlertDescription>
      </Alert>
      <form className="regForm">
        <h1>Registration</h1>

        <Inputs
          formInfo={{
            setEmail: setEmail,
            setUsername: setUsername,
            setPassword: setPassword,
            setConfirmP: setConfirmP
          }}
        ></Inputs>
        <Button
          name="REGISTER"
          data={{
            email: email,
            username: userName,
            password: password,
          }}
          confirmPass= {confirmPass}
          path="register"
        ></Button>
        <p className="closure">
          Already have an account ? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
