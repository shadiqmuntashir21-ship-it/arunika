"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function applyTheme(theme: "night" | "light") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("arunika-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f4f1ec" : "#070707");
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"night" | "light">("night");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "night";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "night" ? "light" : "night";
    setTheme(next);
    applyTheme(next);
  }

  const nextLabel = theme === "night" ? "Terang" : "Malam";
  return (
    <button
      type="button"
      className={compact ? "theme-toggle compact" : "theme-toggle"}
      onClick={toggle}
      aria-label={`Ganti ke mode ${nextLabel}`}
      title={`Mode ${nextLabel}`}
    >
      <span className="theme-symbol" aria-hidden="true">{theme === "night" ? "☀" : "☾"}</span>
      <span className="theme-label">{nextLabel}</span>
    </button>
  );
}

export function InstallButton({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const installedHandler = () => {
      setInstalled(true);
      setPromptEvent(null);
      setFeedback("Arunika berhasil dipasang.");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(""), 4200);
    return () => window.clearTimeout(t);
  }, [feedback]);

  async function install() {
    if (installed) {
      setFeedback("Arunika sudah terpasang sebagai aplikasi.");
      return;
    }
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setFeedback("Memasang Arunika…");
      setPromptEvent(null);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setFeedback("iPhone/iPad: tekan Share lalu pilih Add to Home Screen.");
    } else {
      setFeedback("Buka menu browser lalu pilih Install Arunika / Install App. Di Chrome, ikon install juga dapat muncul di address bar.");
    }
  }

  const className = hero ? "install-app-btn hero-install" : compact ? "install-app-btn compact" : "install-app-btn";
  return <>
    <button type="button" className={className} onClick={install}>
      <Icon name={installed ? "check" : "download"} size={compact ? 15 : 18}/>
      <span>{installed ? "Arunika Terpasang" : "Install Arunika"}</span>
    </button>
    {feedback ? <div className="install-feedback" role="status">{feedback}</div> : null}
  </>;
}
