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
  if (meta) meta.setAttribute("content", theme === "light" ? "#f3f5f1" : "#070707");
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
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const isStandalone = () =>
      media.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    const sync = () => {
      setInstalled(isStandalone());
      setReady(true);
    };
    sync();

    const promptHandler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setInstalled(false);
      setReady(true);
    };

    const installedHandler = () => {
      setInstalled(true);
      setPromptEvent(null);
      setFeedback("");
    };

    window.addEventListener("beforeinstallprompt", promptHandler);
    window.addEventListener("appinstalled", installedHandler);
    media.addEventListener?.("change", sync);

    return () => {
      window.removeEventListener("beforeinstallprompt", promptHandler);
      window.removeEventListener("appinstalled", installedHandler);
      media.removeEventListener?.("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 7000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setFeedback("");
      } else {
        setFeedback("Instalasi dibatalkan. Kamu tetap bisa memasang Arunika kapan saja dari tombol Install.");
      }
      setPromptEvent(null);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setFeedback("iPhone/iPad: tekan Share di Safari → Add to Home Screen → Add.");
    } else if (/android/.test(ua)) {
      setFeedback("Android/Chrome: buka menu ⋮ → Install app / Add to Home screen. Jika prompt sudah siap, tombol ini akan membuka instalasi langsung.");
    } else {
      setFeedback("Chrome/Edge desktop: klik ikon Install di address bar atau menu browser → Install Arunika.");
    }
  }

  if (!ready || installed) return null;

  const className = hero ? "install-app-btn hero-install" : compact ? "install-app-btn compact" : "install-app-btn";
  return <>
    <button type="button" className={className} onClick={install}>
      <Icon name="download" size={compact ? 15 : 18}/>
      <span>{promptEvent ? "Install Arunika" : "Pasang Arunika"}</span>
    </button>
    {feedback ? <div className="install-feedback" role="status">{feedback}</div> : null}
  </>;
}
