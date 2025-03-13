"use client";

import "../../app_css/etc.css";

export default function UserStatus({ friend }) {
  return (
    <div
      className={`userStatus ${friend.friend.username}_status bg ${friend.friend.status}`}
    ></div>
  );
}
