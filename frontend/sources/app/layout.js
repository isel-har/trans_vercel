"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./app_css/etc.css";
import "./app_css/global.css";
import "./app_css/home.css";
import { AuthProvider } from "./contexts/authContext.js";
import { useEffect } from "react";
// import { useState } from "react";
// import { ChakraProvider } from "@chakra-ui/react";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {

  const pathname = usePathname();
  const noWrapperPaths = [
    "/game/pingpong/tournament/bracket",
    "/game/pingpong/tournament",
    "/history",
    "/login",
    "/register",
  ];
  const shouldApplyWrapper = !noWrapperPaths.includes(pathname);
  // const [userData, setUserData] = useState(undefined);
  useEffect(() => {
    setTimeout(() => {
      document.querySelector("body").style.backgroundColor = "#131A25";
    }, 100);
  }, []);

  return (
    <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            {shouldApplyWrapper ? (
              <div
              id="wrapper"
              className="wrapper flex-col w-full min-h-screen bg-gradient-to-b from-gray-900 flex items-center  to-black overflow-hidden"
              >
                {children}
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </body>
    </html>
  );
}
