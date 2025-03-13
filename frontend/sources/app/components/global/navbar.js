"use client";

import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { IoGameController } from "react-icons/io5";
import { BsChatTextFill } from "react-icons/bs";
import { IoLogOutSharp } from "react-icons/io5";
import { BiSolidHomeAlt2 } from "react-icons/bi";
import { useState, useEffect } from "react";
import { History } from "lucide-react";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";

export default function NavBar() {

  const [width, setWidth] = useState();
  const { setUser } = useAuth();
  const api = useAxios();

  const logoutFunc = async () => {    
    // const token = localStorage.getItem("token");
    try {
      await api.post("auth/logout/");
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      console.log(err)
    }
  };
  const handleResize = () => {
    setWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    let nav = document.querySelector("nav");
    if (width >= 1088) {
      nav.style.left = "0px";
    } else {
      if (width != undefined) nav.style.left = "-95px";
    }
  }, [width]);
  return (
    <nav className="navs">
      <div className="images">
        <Link href="/">
          <BiSolidHomeAlt2 className="navIcon" />
        </Link>
        <Link href="/profile">
          <CgProfile className="text-white proIcon navIcon" />
        </Link>
        <Link href="/history">
          <History className="navIcon"/>
          {/* <BsChatTextFill className="navIcon" /> */}
        </Link>
        <Link href="/game">
          <IoGameController className="navIcon" />
        </Link>
        <Link href="/chat">
          <BsChatTextFill className="navIcon" />
        </Link>
      </div>
      <button
        // href="/login"
        className="logout"
        onClick={logoutFunc}
      >
        <IoLogOutSharp className="logIcon" />
      </button>
    </nav>
  );
}
