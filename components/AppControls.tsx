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
  const [installed, setInstalled] = useState(true);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const remembered = localStorage.getItem("arunika-pwa-installed") === "1";

    const syncInstalled = () => {
      const standalone = media.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(standalone || remembered);
      setReady(true);
    };
    syncInstalled();

    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setInstalled(false);
      localStorage.removeItem("arunika-pwa-installed");
      setReady(true);
    };

    const installedHandler = () => {
      localStorage.setItem("arunika-pwa-installed", "1");
      setInstalled(true);
      setPromptEvent(null);
      setFeedback("");
    };

    const displayHandler = () => {
      if (media.matches) {
        localStorage.setItem("arunika-pwa-installed", "1");
        setInstalled(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    media.addEventListener?.("change", displayHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      media.removeEventListener?.("change", displayHandler);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(""), 4600);
    return () => window.clearTimeout(t);
  }, [feedback]);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem("arunika-pwa-installed", "1");
        setInstalled(true);
        setFeedback("");
      }
      setPromptEvent(null);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setFeedback("iPhone/iPad: tekan Share lalu pilih Add to Home Screen.");
    } else {
      setFeedback("Di Chrome/Android: buka menu browser lalu pilih Install Arunika. Jika tersedia, ikon install juga muncul di address bar.");
    }
  }

  if (!ready || installed) return null;

  const className = hero ? "install-app-btn hero-install" : compact ? "install-app-btn compact" : "install-app-btn";
  return <>
    <button type="button" className={className} onClick={install}>
      <Icon name="download" size={compact ? 15 : 18}/>
      <span>Install Arunika</span>
    </button>
    {feedback ? <div className="install-feedback" role="status">{feedback}</div> : null}
  </>;
}
