"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{ full_name: string; title: string } | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }
      const { data } = await supabase.from("profiles").select("full_name, title").eq("id", user.id).single();
      setProfile(data ?? { full_name: user.email?.split("@")[0] ?? "Admin", title: "Yönetici" });
    };
    load();
  }, []);

  const proceed = () => {
    setVisible(false);
    setTimeout(() => router.push("/admin"), 300);
  };

  useEffect(() => {
    const onKey = () => proceed();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!profile) return null;

  return (
    <div
      className="welcome"
      onClick={proceed}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      <div className="welcome__grid" />
      <div className="welcome__glow-1" />
      <div className="welcome__glow-2" />

      <div className="welcome__content">
        <div className="welcome__greeting">Hoş geldiniz</div>
        <div className="welcome__name">{profile.full_name}</div>
        <div className="welcome__title">{profile.title}</div>

        <div className="welcome__hint">
          <svg className="welcome__hint-icon" width={36} height={36} viewBox="0 0 36 36" fill="none">
            <rect width={36} height={36} rx={8} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <path d="M18 11v14M12 20l6 6 6-6" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="welcome__hint-text">Tıkla veya herhangi bir tuşa bas</span>
        </div>
      </div>
    </div>
  );
}
