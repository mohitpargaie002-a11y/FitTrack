import client from "./client";
import type { AuthResponse } from "../types";

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await client.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await client.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
};
