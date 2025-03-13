"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import Header from "../components/global/header.js";
import NavBar from "../components/global/navbar.js";
import { getCookie } from "cookies-next";
import Sockets from "../components/Sockets.js";
import "../app_css/etc.css";
import "../app_css/global.css";
import "../app_css/home.css";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { MyProvider } from "./context";
import { useAuth } from "../contexts/authContext.js";

export default function Global() {

  return (
      <>
        <Header className="head" />
        <NavBar />
        {/* <Sockets /> */}
      </>
  );
}
