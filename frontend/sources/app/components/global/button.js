"use client";

import { ChakraProvider, useToast } from "@chakra-ui/react";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";
import axios from 'axios';
import { HTTPENDPOINT } from "@/public/urls";

export default function Button({ name, data, confirmPass, path, on2FARequired }) {

  const toast = useToast();
  const { setUser } = useAuth();
  const api = useAxios(true);


  const handleLogin = async () => {
    if (confirmPass === data.password){
      try {
        const response = await axios.post(`${HTTPENDPOINT}auth/${path}/`, data);
  
        if (response.data.TFA) {
          on2FARequired(response.data.access);
        } else {
          localStorage.setItem("token", response.data.access)
          setUser(response.data);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Login Error",
          description: error.response?.data?.detail || "Invalid credentials",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      }

    }
    else{
      toast({
        title: "Login Error",
        description: "Password does not match !",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <ChakraProvider>
      <button className="submit" onClick={handleLogin} type="button">
        {name}
      </button>
    </ChakraProvider>
  );
}
