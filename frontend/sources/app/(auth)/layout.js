"use client";

import { useAuth } from "../contexts/authContext";
import { redirect } from 'next/navigation'

export default function AuthLayout({ children }) {

  const { user } = useAuth();

  if (user)
    redirect('/');

  return children;
}
