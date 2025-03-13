"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { useAuth } from "../contexts/authContext";
import { NotiProvider } from "../contexts/notiContext";
import { redirect } from 'next/navigation'
// import { useEffect, useState } from "react";
import "../app_css/etc.css";
import "../app_css/global.css";
import "../app_css/home.css";
import Global  from "./global.js";

export default function DashBoardLayout({ children }) {

	const { user, setUser } = useAuth();
	const token = localStorage.getItem('token');
	
  	if (!token)
    	setUser(null);
	if (!user)
    	redirect('/login');

  	return (
	<NotiProvider>
      	<ChakraProvider>
        	  <Global />
         	 {children}
      	</ChakraProvider>
    </NotiProvider>
  );
}
