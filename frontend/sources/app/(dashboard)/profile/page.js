"use client";

import Prof from "../../components/profile_components/Prof.js";
import Achievements from "../../components/profile_components/Achievements.js";
import History from "../../components/profile_components/History.js";
import Stats from "../../components/profile_components/Stats.js";
import Friends from "../../components/profile_components/Friends.js";
import "../../app_css/profile.css";
import "../../app_css/global.css";
import { useAuth } from "@/app/contexts/authContext.js";
import { useEffect, useState } from "react";
import { useAxios } from "@/public/AxiosInstance.js";


export default function Profile() {

  const { user } = useAuth();
  const [profile, setProfile ] = useState({});
  const [loading, setLoading ] = useState(true);
  const api= useAxios();


  const fetchProfile = async () => {
    try {
      const response = await api.get(`profile/?query=${user.id}`);
      setProfile(response.data);
    } catch (err){
      console.error("error to fetch profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []); // to test


  return (!loading &&
    <div className="Profile">
      <Prof userData={ profile } />
      <Achievements />
      <History id={user.id} />
      <div className="both flex">
        <Stats userData={ profile } />
        <Friends />
      </div>
    </div>
  );
}
