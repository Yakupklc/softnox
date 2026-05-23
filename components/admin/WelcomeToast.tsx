"use client";
import { useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

const KEY = "softnox-welcome-toast-shown";

export function WelcomeToast({ name }: { name: string }) {
  const toast = useToast();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    toast.success(name ? `Hoş geldin, ${name}!` : "Hoş geldin!");
  }, [name, toast]);
  return null;
}
