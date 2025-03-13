"use client";

import Profus from "../../../components/profile_components/Profus.js";
import Achievements from "../../../components/profile_components/Achievements.js";
import History from "../../../components/profile_components/History.js";
import Stats from "../../../components/profile_components/Stats.js";
import Friendsus from "../../../components/profile_components/Friendsus.js";
import "../../../app_css/profile.css";
import { useEffect } from "react";
import { useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
// import "../app_css/global.css"
import { useNoti } from "@/app/contexts/notiContext.js";
import { useAxios } from "@/public/AxiosInstance.js";



export default function Profile({ params }) {

  const [uData, setUData] = useState(null);
  const { friends } = useNoti();
  const api = useAxios()
  // const [loading, setLoading] = useState()

  const fetchOProfile = async() => {
    try { 
      const response = await api.get(`profile/?query=${params.users}`);
      setUData(response.data);
    } catch (err) {
      console.log(err);
    }
  } 

  useEffect(() => {
	fetchOProfile();
  }, []);

  if (!uData) {
    return (
      <div className="error w-[100%] h-[100vh] flex items-center justify-center">
        <h1 className="text-white text-[25px]">User Not Found</h1>
      </div>
    );
  }
  return (
    <div className="Profile">
      <ChakraProvider>
        {uData && (
          <Profus uData={uData} friends={friends} user={params.users} />
        )}
        <Achievements />
        <History id={params.users}/>
        <div className="both flex">
          <Stats />
          <Friendsus  />
        </div>
      </ChakraProvider>
    </div>
  );
}
