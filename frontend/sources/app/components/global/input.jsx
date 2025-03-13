// import * as React from "react";

import { useAxios } from "@/public/AxiosInstance";
// import { use } from "react";

export default function Input({ setUsers, type, className, placeholder }) {

  const api = useAxios();
  return (
    <input
      type={type}
      className={`search flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={(e) => {
        let searchTab = document.querySelector(".searchTab");
        let input = document.querySelector(".search");
        if (input.value != undefined && input.value != "") {
          searchTab.style.display = "block";

          api
            .get(`search?query=${input.value}`)
            .then((res) => {
              if (res.statusText === "OK") {
                setUsers(res.data);
              } else {
              }
            })
            .catch(
              (error) => {
                console.log(error);
              } // router.push("/login")
            );
        } else {
          searchTab.style.display = "none";
        }
      }}
    />
  );
}
