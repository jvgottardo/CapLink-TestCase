'use client';
import axios from "axios";
import { useRouter } from "next/navigation";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUser = async (data: { name: string; email: string; password: string; role: string }) => {
  const res = await axios.post(`${API_URL}/api/auth/signup`, data);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data.user;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await axios.post(`${API_URL}/api/auth/login`, data);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data.user;
};

export const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    // Remove token e headers
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    // Redireciona para login
 window.location.href = "/login";
  };

  return logout;
};

export const getCurrentUser = async (token: any) => {
  const  jwtToken = token;
  try {
    const res = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `${jwtToken}`},
    });
    return res.data.user;
  } catch {
    return null;
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
};
