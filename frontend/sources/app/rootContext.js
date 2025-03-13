'use client'
import { createContext } from 'react';
import { useState} from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const rootContext = createContext()

const RootProvider = ({ children }) => {
  const [ch, setCh] = useState(false);
  


  let location = usePathname()
  let router = useRouter()

  return (
      <rootContext.Provider value={{ch , setCh}}>
      {children}
    </rootContext.Provider>
  );
};

export {RootProvider, rootContext};