"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { getToken } from "./auth-token";

export type Me = {
  username: string;
  role: "admin" | "trainer" | "trainee";
  displayName: string;
} | null;

export function useMe() {
  const [token, setTokenState] = useState<string | null>(null);
  useEffect(() => {
    setTokenState(getToken());
  }, []);
  const me = useQuery(
    (api as any)?.auth?.me,
    token ? { token } : "skip"
  ) as Me | undefined;
  return { token, me, loading: token !== null && me === undefined };
}
