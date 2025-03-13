"use client";

import {useState } from "react";
import "../../app_css/etc2.css";
import Ta from "../global/Ta.js";
import BlocksRen from "./BlocksRen.js";
import FriendsRen from "./FriendsRen.js";

export default function Friends() {
  const [fl_bl, setFlBl] = useState(false);

  return (
    <div className="Friends pDivs pl-[25px] pr-[25px] pt-[25px]">
      <Ta setFlBl={setFlBl} />

      {!fl_bl && <FriendsRen />}
      {fl_bl && <BlocksRen />}
    </div>
  );
}
