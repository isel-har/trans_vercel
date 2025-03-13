"use client";

import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
import axios from 'axios';
import { HTTPENDPOINT } from "@/public/urls";
// import { useAxios } from "@/public/AxiosInstance";

const authContext = createContext();

const useAuth = () => {
  return useContext(authContext);
};

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const api = useAxios();

  const fetchUser = async () => {
  
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get(`${HTTPENDPOINT}me/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${token}`
          },
        });
        let user = response.data;
        user.access = token;
        setUser(user);
        
      } catch (error) {
        console.log("error => ", error);
      } finally {
        setLoading(false);
      }
    }
    else
      setLoading(false);
  };


  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <authContext.Provider value={{ user , loading, setLoading, setUser }}>
      { !loading ? children : <></>}
    </authContext.Provider>
  );
};

export { AuthProvider, useAuth };
