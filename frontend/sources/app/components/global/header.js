"use client";

import Search from "./search.js";
import Notification from "./notification.js";
import Pro from "./pro.js";
import Logo from "../logo.js";
import { useState } from "react";
import { FaBars } from "react-icons/fa6";
import SearchT from "./SearchT.js";


export default function Header() {

  // const [isNoti, setIsNoti] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isNav, setIsNav] = useState(false);
  const [search, setSearch] = useState(false);
  // const router = useRouter();
  // const location = usePathname();
  // const {user} = useAuth();

  return (
    <>
      <header className="">
        <Logo className="logoComp" />

        <FaBars
          className="w-[35px] h-[35px] text-white relative right-[35px] cursor-pointer bar else"
          onClick={() => {
            let nav = document.querySelector("nav");
            if (isNav == true) {
              nav.style.left = "-95px";
              setIsNav(false);
            } else if (isNav == false) {
              nav.style.left = "0";
              setIsNav(true);
            }
          }}
        />

        <div className="flex gap-[25px] items-center else" id="else">
          <Search search={search} setSearch={setSearch} />
          {search && <SearchT setSearch={setSearch} />}

          <Notification />
          <Pro isPro={{ isPro, setIsPro }}  />
        </div>
      </header>
    </>
  );
}
