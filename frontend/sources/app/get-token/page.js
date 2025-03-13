"use client";

import {  useSearchParams } from "next/navigation";
import {  useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "../contexts/authContext";

export default function GetToken() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const Requested = useRef(false);
  const { setUser } = useAuth();
  const api= useAxios();

  
  const fetchIntra = async () => {
    if (Requested.current) return;
    Requested.current = true;
    const code = searchParams.get("code");
    
    try { 
      const response = await api.get(`token-request/?code=${code}`);
      const data = response.data;
      setUser(data);
      localStorage.setItem("token", data.access);
      router.push("/");

    } catch (error) {
      console.error("error to fetch token-request");
    }
  };

  useEffect(() => {
    fetchIntra();
  }, []);

  return <></>;
}
