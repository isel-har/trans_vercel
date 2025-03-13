import axios from 'axios';
import https from 'https';
import { HTTPENDPOINT } from './urls';
import { useAuth } from '@/app/contexts/authContext';


export const useAxios = () => {

  const { setUser } = useAuth();

  const client = axios.create({
    baseURL: HTTPENDPOINT,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (request) => {
        const token = localStorage.getItem('token');

        if (!token) {
          setUser(null);
        } else {
          request.headers.Authorization = `Bearer ${token}`;
        }
      
      return request;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response, 
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null); 
      }
      return Promise.reject(error);
    }
  );

  return client;
};
