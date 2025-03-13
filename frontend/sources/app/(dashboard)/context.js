'use client'
import { createContext } from 'react';
import { useState} from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const myContext = createContext()

const MyProvider = ({ children }) => {
  const [userData, setUserData] = useState(undefined);
  const [notList, setNotList] = useState([]);
  const [render, setRender] = useState(false);
  let [requestPending, setRpending] = useState(false)
  let [requestAccepted, setRaccepted] = useState(false)
  let [token, setToken] = useState(undefined)
  let [friends, setFriends] = useState([])
  let [check, setCheck] = useState([])
  const [lastMessage, setLastMessage] = useState({});


  let location = usePathname()
  let router = useRouter()

  return (
    <myContext.Provider value={{ userData, setUserData, notList, setNotList, requestPending, setRpending, requestAccepted, setRaccepted, token, setToken, friends, setFriends, check, setCheck, setLastMessage, lastMessage}}>
      {children}
    </myContext.Provider>
  );
};

export {MyProvider, myContext};