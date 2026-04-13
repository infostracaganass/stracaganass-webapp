"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Megaphone,
  Mail,
  Newspaper,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
  AlertTriangle,
  Globe,
Facebook,
Instagram,
MessageCircle,
  XCircle,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  place?: string | null;
  description?: string | null;
  food_info?: string | null;
  music_info?: string | null;
  end_time_info?: string | null;
  extra_info?: string | null;
};

type NewsItem = {
  id: string;
  title: string;
  date: string;
  body?: string | null;
};

type LinkItem = {
  id: string;
  label: string;
  url: string;
};

type AttendanceStatus = "present" | "absent" | "maybe";

type EventResponse = {
  id: string;
  event_id: string;
  name: string;
  status: AttendanceStatus;
  note?: string | null;
  created_at: string;
  updated_at: string;
};

type Config = {
  associationName: string;
  appTitle: string;
  tagline: string;
  links: LinkItem[];
};

const FALLBACK_EVENTS: EventItem[] = [];
const FALLBACK_NEWS: NewsItem[] = [];
const DEFAULT_CONFIG: Config = {
  associationName: "Stracaganass",
  appTitle: "StracApp",
  tagline: "La guggen simpatica",
  links: [
  {
    id: "site",
    label: "Sito ufficiale",
    url: "https://www.stracaganass.com"
  },
  {
    id: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/Stracaganass"
  },
  {
    id: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/stracaganass/"
  },
  {
    id: "whatsapp",
    label: "WhatsApp canale",
    url: "https://whatsapp.com/channel/0029Va9XWFk11ulQK0DMLc0R"
  }
],
};

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("it-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getEventCountdown(dateString: string, time?: string | null) {
  try {
    const eventDate = new Date(`${dateString}T${time || "00:00"}`);
    const now = new Date();

    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0 && hours < 24) {
      if (hours <= 1) return "oggi";
      return `-${hours} ore`;
    }

    if (days === 1) return "domani";

    return `-${days} giorni`;
  } catch {
    return null;
  }
}

function isToday(dateString: string) {
  try {
    const today = new Date();
    const date = new Date(dateString);

    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  } catch {
    return false;
  }
}

function buildCalendarLink(item: EventItem) {
  try {
    const start = new Date(`${item.date}T${item.time || "18:00"}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const formatGoogleDate = (value: Date) =>
      value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    const title = encodeURIComponent(item.title || "Evento Stracaganass");
    const details = encodeURIComponent(item.description || "");
    const location = encodeURIComponent(item.place || "");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}&details=${details}&location=${location}`;
  } catch {
    return "#";
  }
}

const SPONSOR_LOGOS = [
  "/sponsors/1.png",
  "/sponsors/2.png",
  "/sponsors/3.png",
  "/sponsors/4.png",
  "/sponsors/5.png",
  "/sponsors/6.png",
  "/sponsors/7.png",
  "/sponsors/8.png",
  "/sponsors/9.png",
  "/sponsors/10.png",
  "/sponsors/11.png",
  "/sponsors/12.png",
  "/sponsors/13.png",
  "/sponsors/14.png",
  "/sponsors/15.png",
  "/sponsors/16.png",
  "/sponsors/17.png",
  "/sponsors/18.png",
  "/sponsors/19.png",
  "/sponsors/20.png",
  "/sponsors/21.png",
  "/sponsors/22.png",
  "/sponsors/23.png",
  "/sponsors/24.png",
  "/sponsors/25.png",
  "/sponsors/26.png",
  "/sponsors/27.png",
  "/sponsors/28.png",
  "/sponsors/29.png",
  "/sponsors/30.png",
  "/sponsors/31.png",
];

function shuffleArray<T>(array: T[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message =
      typeof json === "object" && json !== null && "message" in json && typeof (json as { message?: unknown }).message === "string"
        ? (json as { message: string }).message
        : "Errore nella richiesta.";
    throw new Error(message);
  }

  return json as T;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 24,
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "dark";
  title?: string;
}) {
  let background = "#0284c7";
  let color = "white";
  let border = "none";

  if (variant === "secondary") {
    background = "#facc15";
    color = "#111827";
  }
  if (variant === "outline") {
    background = "white";
    color = "#0f172a";
    border = "1px solid #cbd5e1";
  }
  if (variant === "dark") {
    background = "#0f172a";
    color = "white";
  }

  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: 16,
        background,
        color,
        border,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props;

  return (
    <input
      {...rest}
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        minHeight: 48,
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid #cbd5e1",
        background: "white",
        fontSize: 16,
        WebkitAppearance: "none",
        appearance: "none",
        ...style, 
      }}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        minHeight: 100,
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid #cbd5e1",
        background: "white",
        resize: "vertical",
        fontSize: 16,
        WebkitAppearance: "none",
        appearance: "none",
      }}
    />
  );
}

const ENABLE_TOP_ALERT_BANNER = true;

const TOP_ALERT_BANNER = {
  title: (
  <>
    Unisciti alla Stracaganass!
    <br />
    Ti aspettiamo!
  </>
),
  body: "La Stracaganass apre le porte a nuovi musicisti per la stagione 2026/2027. Curioso o interessato? Scrivici senza impegno a sabrina.mottini@hotmail.com. A giugno 2026 ti aspetta anche una grigliata offerta per scoprire il mondo della guggen. Vieni a conoscerci!",
};

const MEMBERS_MATERIAL_LINKS = {
  music: "https://drive.google.com/drive/folders/1ohzi234a0Qzh_pKy5V1i8_Mi9DaPWGU1?usp=sharing",
  media: "https://drive.google.com/drive/folders/1SZas5nl4BHFHEKYk-Jl2AgFOrTt95g-x?usp=sharing",
};

export default function StracaganassWebApp() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [browserPermissionGranted, setBrowserPermissionGranted] = useState(false);
const [deviceRegistered, setDeviceRegistered] = useState(false);
const [subscriptionActive, setSubscriptionActive] = useState(false);
const [showIosHelp, setShowIosHelp] = useState(false);
  const [installPanelOpen, setInstallPanelOpen] = useState(false);
  const [checkingNotifications, setCheckingNotifications] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [appInstalled, setAppInstalled] = useState(false);
const [installChecked, setInstallChecked] = useState(false);
const [verificationOk, setVerificationOk] = useState(false);
  const [showTopAlertBanner, setShowTopAlertBanner] = useState(ENABLE_TOP_ALERT_BANNER);
const [topAlertBannerOpen, setTopAlertBannerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMemberPassword, setShowMemberPassword] = useState(false);

useEffect(() => {
  const updateLayout = () => setIsMobile(window.innerWidth < 900);
  updateLayout();
  window.addEventListener("resize", updateLayout);
  return () => window.removeEventListener("resize", updateLayout);
}, []);
  const [events, setEvents] = useState<EventItem[]>(FALLBACK_EVENTS);
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [hasNewEvents, setHasNewEvents] = useState(false);
const [hasNewNews, setHasNewNews] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [membersAreaOpen, setMembersAreaOpen] = useState(false);
  const [adminSection, setAdminSection] = useState<"surveys" | "events" | "news">("surveys");
const [memberLoggedIn, setMemberLoggedIn] = useState(false);
const [memberPassword, setMemberPassword] = useState("");
const [memberError, setMemberError] = useState("");
  const [membersSection, setMembersSection] = useState<"home" | "attendance" | "materials">("home");

const [attendanceLoadingByEvent, setAttendanceLoadingByEvent] = useState<Record<string, boolean>>({});

const [attendanceError, setAttendanceError] = useState("");
const [attendanceMessage, setAttendanceMessage] = useState("");

const [attendanceResponses, setAttendanceResponses] = useState<Record<string, EventResponse[]>>({});

const [attendanceResponsesOpen, setAttendanceResponsesOpen] = useState<Record<string, boolean>>({});

const [attendanceForm, setAttendanceForm] = useState<
  Record<string, { name: string; status: AttendanceStatus | "" }>
>({});
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [sponsorLogos, setSponsorLogos] = useState<string[]>([]);
  const sponsorTrackRef = useRef<HTMLDivElement | null>(null);
const [sponsorScrollDistance, setSponsorScrollDistance] = useState(0);

 useEffect(() => {
  async function initOneSignal() {
    if (typeof window === "undefined") return;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) return;

    try {
      await OneSignal.init({
        appId,
      });
    } catch (error) {
      console.error("Errore inizializzazione OneSignal:", error);
    }
  }

  void initOneSignal();
}, []);

  const [eventForm, setEventForm] = useState({
  title: "",
  date: "",
  time: "",
  place: "",
  description: "",
  food_info: "",
  music_info: "",
  end_time_info: "",
  extra_info: "",
});

const [editingEventId, setEditingEventId] = useState<string | null>(null);

const [editEventForm, setEditEventForm] = useState({
  title: "",
  date: "",
  time: "",
  place: "",
  description: "",
  food_info: "",
  music_info: "",
  end_time_info: "",
  extra_info: "",
});
  
  const [newsForm, setNewsForm] = useState({
    title: "",
    date: "",
    body: "",
  });

const isIos =
  typeof window !== "undefined" &&
  /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const isAndroid =
  typeof window !== "undefined" &&
  /android/i.test(window.navigator.userAgent);
  
  const loadData = async () => {
    try {
      setError("");
      setBootLoading(true);

      const [configData, eventsData, newsData] = await Promise.all([
        apiFetch<Config>("/api/public/config"),
        apiFetch<EventItem[]>("/api/events"),
        apiFetch<NewsItem[]>("/api/news"),
      ]);

      setConfig(configData);
      setEvents(eventsData);
      setNews(newsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento dati.");
    } finally {
      setBootLoading(false);
    }
  };

  useEffect(() => {
  void loadData();

  const interval = window.setInterval(() => {
    void loadData();
  }, 300000);

  return () => window.clearInterval(interval);
}, []);

useEffect(() => {
  setSponsorLogos(shuffleArray(SPONSOR_LOGOS));
}, []);

  useEffect(() => {
  const updateSponsorScrollDistance = () => {
    const track = sponsorTrackRef.current;
    if (!track) return;

    setSponsorScrollDistance(track.scrollWidth / 2);
  };

  updateSponsorScrollDistance();

  window.addEventListener("resize", updateSponsorScrollDistance);

  return () => {
    window.removeEventListener("resize", updateSponsorScrollDistance);
  };
}, [sponsorLogos, isMobile]);
  
useEffect(() => {
  const checkPushStatus = async () => {
    if (typeof window === "undefined") return;

    const permission =
      "Notification" in window ? Notification.permission : "default";

    const browserOk = permission === "granted";
    setBrowserPermissionGranted(browserOk);

    if (!browserOk) {
      setPushEnabled(false);
      setDeviceRegistered(false);
      setSubscriptionActive(false);
      localStorage.removeItem("stracapp_push_enabled");
      return;
    }

    // Stato base browser
    setPushEnabled(true);
    localStorage.setItem("stracapp_push_enabled", "true");

    // Controllo OneSignal, se disponibile
    try {
      const oneSignal = (window as any).OneSignal;

      if (oneSignal && oneSignal.User && oneSignal.User.PushSubscription) {
        const optedIn = oneSignal.User.PushSubscription.optedIn === true;
        const subscriptionId = oneSignal.User.PushSubscription.id;

        setSubscriptionActive(optedIn);
        setDeviceRegistered(Boolean(subscriptionId));
        setPushEnabled(optedIn || browserOk);
      } else {
        // fallback semplice
        setDeviceRegistered(browserOk);
        setSubscriptionActive(browserOk);
      }
    } catch (error) {
      console.error("Errore controllo stato OneSignal:", error);
      setDeviceRegistered(browserOk);
      setSubscriptionActive(browserOk);
    }
  };

  void checkPushStatus();
}, []);

  useEffect(() => {
  const interval = setInterval(() => {
    if ("Notification" in window) {
      const permission = Notification.permission;

      if (permission !== "granted") {
        setPushEnabled(false);
        localStorage.removeItem("stracapp_push_enabled");
      }
    }
  }, 5000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
  if (typeof window === "undefined") return;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  setAppInstalled(isStandalone);
  setInstallChecked(true);
}, []);
  
useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener("beforeinstallprompt", handler as EventListener);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler as EventListener);
  };
}, []);
  
  const upcomingEvents = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events
    .filter((item) => new Date(`${item.date}T${item.time || "00:00"}`) >= today)
    .sort(
      (a, b) =>
        +new Date(`${a.date}T${a.time || "00:00"}`) -
        +new Date(`${b.date}T${b.time || "00:00"}`)
    );
}, [events]);

useEffect(() => {
  if (!admin) return;
  if (adminSection !== "surveys") return;
  if (!upcomingEvents.length) return;

  void loadAllAdminAttendance();
}, [admin, adminSection, upcomingEvents]);

  const visibleEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 5);

  const eventsSignature = useMemo(() => {
  return events
    .map((item) => `${item.id}:${item.date}:${item.time || ""}:${item.title}`)
    .join("|");
}, [events]);

const newsSignature = useMemo(() => {
  return news
    .map((item) => `${item.id}:${item.date}:${item.title}`)
    .join("|");
}, [news]);

useEffect(() => {
  setShowTopAlertBanner(ENABLE_TOP_ALERT_BANNER);
  setTopAlertBannerOpen(false);
}, []);

useEffect(() => {
  if (!memberLoggedIn) return;
  if (membersSection !== "attendance") return;
  if (!upcomingEvents.length) return;

  void Promise.all(upcomingEvents.map((event) => loadEventResponses(event.id)));
}, [memberLoggedIn, membersSection, upcomingEvents]);
  
  useEffect(() => {
  if (bootLoading || typeof window === "undefined") return;

  const savedEventsSignature = localStorage.getItem("stracapp_seen_events_signature");
  const savedNewsSignature = localStorage.getItem("stracapp_seen_news_signature");

  if (savedEventsSignature === null) {
    localStorage.setItem("stracapp_seen_events_signature", eventsSignature);
    setHasNewEvents(false);
  } else {
    setHasNewEvents(savedEventsSignature !== eventsSignature);
  }

  if (savedNewsSignature === null) {
    localStorage.setItem("stracapp_seen_news_signature", newsSignature);
    setHasNewNews(false);
  } else {
    setHasNewNews(savedNewsSignature !== newsSignature);
  }
}, [bootLoading, eventsSignature, newsSignature]);

  useEffect(() => {
  if (bootLoading || typeof window === "undefined") return;
  if (!hasNewEvents && !hasNewNews) return;

  const timer = window.setTimeout(() => {
    localStorage.setItem("stracapp_seen_events_signature", eventsSignature);
    localStorage.setItem("stracapp_seen_news_signature", newsSignature);
    setHasNewEvents(false);
    setHasNewNews(false);
  }, 6000);

  return () => window.clearTimeout(timer);
}, [bootLoading, hasNewEvents, hasNewNews, eventsSignature, newsSignature]);

const handleInstallClick = async () => {
  setInstallPanelOpen(true);

  if (isIos) {
    setShowIosHelp(true);
    return;
  }

  if (!deferredPrompt) {
    alert("Installazione non disponibile su questo dispositivo in questo momento.");
    return;
  }

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  setDeferredPrompt(null);
};
  
const enableNotifications = async () => {
  if (!(typeof window !== "undefined" && "Notification" in window)) {
    alert("Browser non compatibile con le notifiche.");
    return;
  }

  setLoading(true);

  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setPushEnabled(false);
      localStorage.removeItem("stracapp_push_enabled");
      alert("Permesso notifiche non concesso.");
      return;
    }

    await apiFetch<{ ok: true }>("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        subscription: null
      })
    });

   const finalPermission = Notification.permission;

if (finalPermission === "granted") {
  setBrowserPermissionGranted(true);

  try {
    const oneSignal = (window as any).OneSignal;

    if (oneSignal && oneSignal.User && oneSignal.User.PushSubscription) {
      const optedIn = oneSignal.User.PushSubscription.optedIn === true;
      const subscriptionId = oneSignal.User.PushSubscription.id;

      setDeviceRegistered(Boolean(subscriptionId));
      setSubscriptionActive(optedIn);
      setPushEnabled(optedIn);
    } else {
      setDeviceRegistered(true);
      setSubscriptionActive(true);
      setPushEnabled(true);
    }
  } catch {
    setDeviceRegistered(true);
    setSubscriptionActive(true);
    setPushEnabled(true);
  }

  localStorage.setItem("stracapp_push_enabled", "true");
  alert("Notifiche attivate correttamente.");
} else {
  setBrowserPermissionGranted(false);
  setPushEnabled(false);
  setDeviceRegistered(false);
  setSubscriptionActive(false);
  localStorage.removeItem("stracapp_push_enabled");
  alert("Le notifiche non risultano attive sul browser.");
}
} catch (err) {
setPushEnabled(false);
setBrowserPermissionGranted(false);
setDeviceRegistered(false);
setSubscriptionActive(false);
localStorage.removeItem("stracapp_push_enabled");
alert(err instanceof Error ? err.message : "Errore attivazione notifiche.");
} finally {
setLoading(false);
}
};
  
const verifyNotifications = async () => {
  setCheckingNotifications(true);
  setVerificationDone(false);

  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setBrowserPermissionGranted(false);
      setDeviceRegistered(false);
      setSubscriptionActive(false);
      setPushEnabled(false);
      setVerificationOk(false);
      setVerificationDone(true);
      return;
    }

    const permission = Notification.permission;
    const browserOk = permission === "granted";

    setBrowserPermissionGranted(browserOk);

    if (!browserOk) {
      setDeviceRegistered(false);
      setSubscriptionActive(false);
      setPushEnabled(false);
      localStorage.removeItem("stracapp_push_enabled");
      setVerificationOk(false);
      setVerificationDone(true);
      return;
    }

    let registered = false;
    let subscribed = false;

    try {
      const oneSignal = (window as any).OneSignal;

      if (oneSignal && oneSignal.User && oneSignal.User.PushSubscription) {
        const optedIn = oneSignal.User.PushSubscription.optedIn === true;
        const subscriptionId = oneSignal.User.PushSubscription.id;

        registered = Boolean(subscriptionId);
        subscribed = optedIn;

        setDeviceRegistered(registered);
        setSubscriptionActive(subscribed);
        setPushEnabled(subscribed);
      } else {
        registered = true;
        subscribed = true;

        setDeviceRegistered(true);
        setSubscriptionActive(true);
        setPushEnabled(true);
      }
    } catch {
      registered = true;
      subscribed = true;

      setDeviceRegistered(true);
      setSubscriptionActive(true);
      setPushEnabled(true);
    }

    localStorage.setItem("stracapp_push_enabled", "true");

    const allOk = browserOk && registered && subscribed;
    setVerificationOk(allOk);
    setVerificationDone(true);
  } catch (err) {
    console.error(err);
    setBrowserPermissionGranted(false);
    setDeviceRegistered(false);
    setSubscriptionActive(false);
    setPushEnabled(false);
    localStorage.removeItem("stracapp_push_enabled");
    setVerificationOk(false);
    setVerificationDone(true);
  } finally {
    setCheckingNotifications(false);
  }
};

const loginMembersArea = () => {
  if (memberPassword === "straca123") {
    setMemberLoggedIn(true);
    setMembersAreaOpen(true);
    setMembersSection("home");
    setMemberPassword("");
    setMemberError("");
    return;
  }

  setMemberLoggedIn(false);
  setMemberError("Password soci non corretta.");
};

const logoutMembersArea = () => {
  setMemberLoggedIn(false);
  setMembersAreaOpen(false);
  setMembersSection("home");

  setMemberPassword("");
  setMemberError("");

  // reset presenze
  setAttendanceResponses({});
  setAttendanceResponsesOpen({});
  setAttendanceForm({});
  setAttendanceError("");
  setAttendanceMessage("");
};
  
const login = async () => {
    setLoading(true);
    try {
      await apiFetch<{ ok: true; admin: true }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setAdmin(true);
setAdminPanelOpen(true);
      setAdminSection("surveys");
setPassword("");
setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accesso non riuscito.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
  setLoading(true);
  try {
    await apiFetch<{ ok: true }>("/api/admin/logout", { method: "POST" });
    setAdmin(false);
    setAdminPanelOpen(false);
    setAdminSection("surveys");
  } catch {
    setAdmin(false);
    setAdminPanelOpen(false);
  } finally {
    setLoading(false);
  }
};

  const addEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      alert("Inserisci almeno titolo e data.");
      return;
    }

    setLoading(true);
    try {
      const created = await apiFetch<EventItem>("/api/events", {
        method: "POST",
        body: JSON.stringify(eventForm),
      });

      setEvents((prev) => [...prev, created].sort((a, b) => +new Date(a.date) - +new Date(b.date)));
      setEventForm({
  title: "",
  date: "",
  time: "",
  place: "",
  description: "",
  food_info: "",
  music_info: "",
  end_time_info: "",
  extra_info: "",
});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore creazione evento.");
    } finally {
      setLoading(false);
    }
  };

  const addNews = async () => {
    if (!newsForm.title || !newsForm.date) {
      alert("Inserisci almeno titolo e data.");
      return;
    }

    setLoading(true);
    try {
      const created = await apiFetch<NewsItem>("/api/news", {
        method: "POST",
        body: JSON.stringify(newsForm),
      });

      setNews((prev) => [...prev, created].sort((a, b) => +new Date(b.date) - +new Date(a.date)));
      setNewsForm({ title: "", date: "", body: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore creazione notizia.");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setDeletingId(id);
    try {
      await apiFetch<{ ok: true }>(`/api/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore eliminazione evento.");
    } finally {
      setDeletingId("");
    }
  };

  const deleteNews = async (id: string) => {
    setDeletingId(id);
    try {
      await apiFetch<{ ok: true }>(`/api/news/${id}`, { method: "DELETE" });
      setNews((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore eliminazione notizia.");
    } finally {
      setDeletingId("");
    }
  };

const getAttendanceFormValue = (eventId: string) => {
  return attendanceForm[eventId] || {
    name: "",
    status: "",
  };
};

const updateAttendanceForm = (
  eventId: string,
  patch: Partial<{ name: string; status: AttendanceStatus | "" }>
) => {
  setAttendanceForm((prev) => ({
    ...prev,
    [eventId]: {
      name: prev[eventId]?.name || "",
      status: prev[eventId]?.status || "",
      ...patch,
    },
  }));
};

const loadEventResponses = async (eventId: string) => {
  try {
    const responses = await apiFetch<EventResponse[]>(
      `/api/event-responses?eventId=${encodeURIComponent(eventId)}`
    );

    setAttendanceResponses((prev) => ({
      ...prev,
      [eventId]: responses,
    }));
  } catch (err) {
    console.error("Errore caricamento risposte:", err);
  }
};

const submitAttendance = async (eventId: string) => {
  const form = attendanceForm[eventId];

  if (!form?.name?.trim()) {
    setAttendanceError("Inserisci il nome socio.");
    setAttendanceMessage("");
    return;
  }

  if (!form?.status) {
    setAttendanceError("Seleziona una risposta.");
    setAttendanceMessage("");
    return;
  }

  setAttendanceLoadingByEvent((prev) => ({ ...prev, [eventId]: true }));
  setAttendanceError("");
  setAttendanceMessage("");

  try {
    await apiFetch<{ ok: true; response: EventResponse }>("/api/event-responses", {
      method: "POST",
      body: JSON.stringify({
        eventId,
        name: form.name.trim(),
        status: form.status,
        note: "",
      }),
    });

    setAttendanceMessage("Risposta salvata correttamente.");
    await loadEventResponses(eventId);
  } catch (err) {
    setAttendanceError(
      err instanceof Error ? err.message : "Errore durante il salvataggio della risposta."
    );
    setAttendanceMessage("");
  } finally {
    setAttendanceLoadingByEvent((prev) => ({ ...prev, [eventId]: false }));
  }
};

const getAttendanceStatusStyles = (
  status: AttendanceStatus,
  active: boolean
): React.CSSProperties => {
  if (status === "present") {
    return {
      background: active ? "#16a34a" : "#f0fdf4",
      color: active ? "white" : "#166534",
      border: active ? "1px solid #16a34a" : "1px solid #86efac",
    };
  }

  if (status === "absent") {
    return {
      background: active ? "#dc2626" : "#fef2f2",
      color: active ? "white" : "#991b1b",
      border: active ? "1px solid #dc2626" : "1px solid #fca5a5",
    };
  }

  return {
    background: active ? "#eab308" : "#fefce8",
    color: active ? "#111827" : "#a16207",
    border: active ? "1px solid #eab308" : "1px solid #fde68a",
  };
};

const getAdminEventResponses = (eventId: string) => {
  return attendanceResponses[eventId] || [];
};

const getAdminEventCounts = (eventId: string) => {
  const responses = getAdminEventResponses(eventId);

  return {
    present: responses.filter((response) => response.status === "present").length,
    absent: responses.filter((response) => response.status === "absent").length,
    maybe: responses.filter((response) => response.status === "maybe").length,
    total: responses.length,
  };
};

const loadAllAdminAttendance = async () => {
  if (!upcomingEvents.length) return;

  await Promise.all(upcomingEvents.map((event) => loadEventResponses(event.id)));
};
  
const getAttendanceStatusLabel = (status: AttendanceStatus) => {
  if (status === "present") return "Presenti";
  if (status === "absent") return "Assenti";
  return "Forse";
};

const getGroupedAttendanceResponses = (responses: EventResponse[]) => {
  return {
    present: responses.filter((response) => response.status === "present"),
    absent: responses.filter((response) => response.status === "absent"),
    maybe: responses.filter((response) => response.status === "maybe"),
  };
};

const buildWhatsAppEventText = (event: EventItem) => {
  const lines = [
    `🟢 ${event.title}`,
    "",
    "Ecco le informazioni utili:",
    `- 📆 ${formatDate(event.date)}`,
    `- 📍 ${event.place?.trim() ? event.place.trim() : "Da definire"}`,
    `- 🕰️ Ritrovo ${event.time?.trim() ? event.time.trim() : "orario da definire"} in loco`,
  ];

  if (event.food_info?.trim()) {
    lines.push(`- 🍗 ${event.food_info.trim()}`);
  }

  if (event.music_info?.trim()) {
    lines.push(`- 🎶 ${event.music_info.trim()}`);
  }

  if (event.end_time_info?.trim()) {
    lines.push(`- 🔚 termine ore ${event.end_time_info.trim()}`);
  }

  if (event.extra_info?.trim()) {
    lines.push("");
    lines.push(`ℹ️ ${event.extra_info.trim()}`);
  }

  return lines.join("\n");
};

const copyWhatsAppEventText = async (event: EventItem) => {
  try {
    const text = buildWhatsAppEventText(event);
    await navigator.clipboard.writeText(text);
    alert("Testo WhatsApp copiato.");
  } catch {
    alert("Impossibile copiare il testo WhatsApp.");
  }
};
  
  return (
    <main
  style={{
    maxWidth: 1200,
    margin: "0 auto",
    padding: isMobile ? 14 : 24,
    width: "100%",
  }}
>

{ENABLE_TOP_ALERT_BANNER && showTopAlertBanner && (
  <div
    style={{
      marginBottom: 24,
      background: "#dc2626",
      color: "white",
      borderRadius: 24,
      padding: isMobile ? 14 : 16,
      boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 16,
            padding: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <Info size={18} color="white" />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <button
              onClick={() => setTopAlertBannerOpen((value) => !value)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                textAlign: "left",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {TOP_ALERT_BANNER.title}
              </div>
            </button>

            <button
              onClick={() => setTopAlertBannerOpen((value) => !value)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {topAlertBannerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <button
              onClick={() => setShowTopAlertBanner(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          {topAlertBannerOpen && (
            <div
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {TOP_ALERT_BANNER.body}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
      
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
  <div style={{ padding: 24 }}>
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <img
          src="/logo-stracaganass.png"
          alt="Stracaganass"
          style={{
            height: isMobile ? 28 : 34,
            width: "auto",
          }}
        />

        <span
          style={{
            fontSize: isMobile ? 26 : 32,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          StracAPP
        </span>
      </div>

      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1e3a8a",
        }}
      >
        Stracaganass Guggen Band
      </div>

      <div
        style={{
          fontSize: 14,
          color: "#475569",
          marginTop: 4,
        }}
      >
        Le informazioni a portata di mano
      </div>
    </div>
  </div>
</Card>
      </motion.section>

<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
  <div style={{ marginTop: 24 }}>
    <Card>
      <div
        style={{
          padding: isMobile ? 12 : 16,
          overflow: "hidden",
          borderRadius: 24,
          background: "white",
        }}
      >
        {sponsorScrollDistance > 0 ? (
          <motion.div
            ref={sponsorTrackRef}
            animate={{ x: [0, -sponsorScrollDistance] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
            style={{
              display: "flex",
              width: "max-content",
              alignItems: "center",
              gap: isMobile ? 14 : 18,
              willChange: "transform",
            }}
          >
            {[...sponsorLogos, ...sponsorLogos].map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                style={{
                  flex: "0 0 auto",
                  height: isMobile ? 44 : 54,
                  width: isMobile ? 90 : 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  background: "white",
                  padding: 6,
                }}
              >
                <img
                  src={logo}
                  alt="Sponsor"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <div
            ref={sponsorTrackRef}
            style={{
              display: "flex",
              width: "max-content",
              alignItems: "center",
              gap: isMobile ? 14 : 18,
            }}
          >
            {[...sponsorLogos, ...sponsorLogos].map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                style={{
                  flex: "0 0 auto",
                  height: isMobile ? 44 : 54,
                  width: isMobile ? 90 : 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  background: "white",
                  padding: 6,
                }}
              >
                <img
                  src={logo}
                  alt="Sponsor"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  </div>
</motion.section>
      
      {error ? (
        <div style={{ marginTop: 16, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: 14, borderRadius: 16 }}>
          {error}
        </div>
      ) : null}

     <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 24,
    marginTop: 24,
    alignItems: "start",
  }}
>
        <div style={{ display: "grid", gap: 24 }}>

          {!appInstalled ? (
  <Card>
    <div style={{ padding: 24 }}>
      <button
        onClick={() => setInstallPanelOpen((value) => !value)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "white",
              border: "1px solid #bae6fd",
              borderRadius: 16,
              padding: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Smartphone size={20} color="#0369a1" />
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              Installa StracAPP
            </div>

            <div style={{ color: "#64748b", fontSize: 14 }}>
              Per sistemi iPhone o Android
            </div>
          </div>
        </div>

        {installPanelOpen ? (
          <ChevronUp size={18} color="#64748b" />
        ) : (
          <ChevronDown size={18} color="#64748b" />
        )}
      </button>

      {installPanelOpen ? (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 12,
            }}
          >
            <Button
              onClick={() => void handleInstallClick()}
              disabled={appInstalled}
            >
              {appInstalled ? (
                <>
                  <CheckCircle size={16} /> Installato
                </>
              ) : (
                "Guida installazione"
              )}
            </Button>
          </div>

          {installChecked && appInstalled ? (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#15803d",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <CheckCircle size={14} /> Webapp installata correttamente
            </div>
          ) : null}

          {showIosHelp ? (
            <div
              style={{
                marginTop: 16,
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 16,
                padding: 16,
                color: "#7c2d12",
              }}
            >
              <strong>Installazione su iPhone</strong>

              <ol style={{ marginTop: 8, paddingLeft: 18 }}>
                <li>Aperto il link ricevuto in Safari</li>
                <li>Tocca il pulsante Condividi</li>
                <li>Seleziona “Aggiungi a schermata Home”</li>
                <li>Conferma</li>
              </ol>

              <div style={{ marginTop: 12 }}>
                <Button
                  variant="outline"
                  onClick={() => setShowIosHelp(false)}
                >
                  Chiudi
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  </Card>
) : null}
          
         <section
  style={{
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: isMobile ? 16 : 20,
  }}
>
            <div style={{ marginBottom: 12 }}>
  <h2
  style={{
    margin: 0,
    fontSize: 32,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#0f172a"
  }}
>
  <ChevronRight size={22} color="#1e3a8a" />
  Info alert
 {hasNewNews ? (
  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "#dc2626",
        display: "inline-block",
      }}
    />
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#dc2626",
        letterSpacing: 0.5,
      }}
    >
      NEW
    </span>
  </span>
) : null}
</h2>
</div>
            <div style={{ display: "grid", gap: 16 }}>
  {bootLoading ? (
    <div>Caricamento news...</div>
  ) : news.length ? (
    news.map((item) => (
  <Card key={item.id}>
    <div
      style={{
        padding: 20,
        display: "grid",
        gap: 10,
        borderRadius: 20,
        background: "white",
      }}
    >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
  <div style={{ display: "grid", gap: 8 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0369a1", fontWeight: 700 }}>
        News
      </div>

      {isToday(item.date) ? (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: "#b91c1c",
      background: "#fee2e2",
      borderRadius: 999,
      padding: "4px 8px",
    }}
  >
    OGGI
  </span>
) : null}
    </div>

    <div style={{ fontSize: 22, fontWeight: 800 }}>{item.title}</div>
  </div>
                      <div style={{ border: "1px solid #bae6fd", borderRadius: 999, padding: "6px 10px", height: "fit-content", color: "#0369a1" }}>
                        {formatDate(item.date)}
                      </div>
                    </div>
                    <div style={{ color: "#334155" }}>{item.body || ""}</div>
                    {admin ? (
                      <Button variant="outline" onClick={() => void deleteNews(item.id)} disabled={deletingId === item.id}>
                        <Trash2 size={16} /> Elimina
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))
  ) : (
    <div>Nessuna news disponibile.</div>
  )}
</div>
          </section>
          
          <section
  style={{
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: isMobile ? 16 : 20,
  }}
>
            <div style={{ marginBottom: 12 }}>
              <div>
  <h2
  style={{
    margin: 0,
    fontSize: 32,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#0f172a",
  }}
>
  <ChevronRight size={22} color="#1e3a8a" />
  Eventi
 {hasNewEvents ? (
  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "#dc2626",
        display: "inline-block",
      }}
    />
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#dc2626",
        letterSpacing: 0.5,
      }}
    >
      NEW
    </span>
  </span>
) : null}
</h2>
</div>
            
            </div>

            <div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 16,
  }}
>
              {bootLoading ? (
  <div>Caricamento eventi...</div>
) : visibleEvents.length ? (
  visibleEvents.map((item, index) => {
    const eventIsToday = isToday(item.date);

    return (
      <Card key={item.id}>
        <div
          style={{
            padding: 20,
            display: "grid",
            gap: 10,
            border: visibleEvents[0]?.id === item.id ? "2px solid #93c5fd" : "none",
borderRadius: 20,
background: visibleEvents[0]?.id === item.id ? "#eff6ff" : "white",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    color: "#0369a1",
                    fontWeight: 700,
                  }}
                >
                  Evento
                </div>

                {visibleEvents[0]?.id === item.id ? (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: "#1d4ed8",
      background: "#dbeafe",
      borderRadius: 999,
      padding: "4px 8px",
    }}
  >
    NEXT
  </span>
) : null}

                {visibleEvents[0]?.id === item.id && getEventCountdown(item.date, item.time) ? (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: "#1d4ed8",
      background: "#dbeafe",
      borderRadius: 999,
      padding: "4px 8px",
    }}
  >
    {getEventCountdown(item.date, item.time)}
  </span>
) : null}

                {eventIsToday ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#b91c1c",
                      background: "#fee2e2",
                      borderRadius: 999,
                      padding: "4px 8px",
                    }}
                  >
                    OGGI
                  </span>
                ) : null}
              </div>

              <div style={{ fontSize: 22, fontWeight: 800 }}>{item.title}</div>
            </div>

            {item.time ? (
              <div
                style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  borderRadius: 999,
                  padding: "6px 10px",
                  height: "fit-content",
                }}
              >
                {item.time}
              </div>
            ) : null}
          </div>

          <div style={{ color: "#475569", display: "grid", gap: 6, fontSize: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
  <Calendar size={15} />
  <span>{formatDate(item.date)}</span>

  <a
    href={buildCalendarLink(item)}
    target="_blank"
    rel="noreferrer"
    style={{
      marginLeft: 6,
      fontSize: 13,
      color: "#0369a1",
      fontWeight: 600,
      textDecoration: "none"
    }}
  >
    Aggiungi al calendario
  </a>
</div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
  <MapPin size={15} />

  <span>{item.place || "Da confermare"}</span>

  {item.place ? (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}`}
      target="_blank"
      rel="noreferrer"
      style={{
        marginLeft: 6,
        fontSize: 13,
        color: "#0369a1",
        fontWeight: 600,
        textDecoration: "none"
      }}
    >
      Apri mappa
    </a>
  ) : null}
</div>
          </div>

          <div style={{ color: "#334155" }}>{item.description || ""}</div>

          {admin ? (
            <Button
              variant="outline"
              onClick={() => void deleteEvent(item.id)}
              disabled={deletingId === item.id}
            >
              <Trash2 size={16} /> Elimina
            </Button>
          ) : null}
        </div>
      </Card>
    );
  })
) : (
  <div>Nessun evento disponibile.</div>
)}
            </div>

            {upcomingEvents.length > 5 ? (
  <div style={{ marginTop: 12 }}>
    <button
      onClick={() => setShowAllEvents((value) => !value)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: 700,
        color: "#0f172a",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {showAllEvents ? (
        <>
          <ChevronUp size={16} /> Mostra meno
        </>
      ) : (
        <>
          <ChevronDown size={16} /> Mostra altro
        </>
      )}
    </button>
  </div>
) : null}
          </section>

          <section
  style={{
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: isMobile ? 16 : 20,
  }}
>
            <div style={{ marginBottom: 12 }}>
  <h2
    style={{
      margin: 0,
      fontSize: 32,
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#0f172a"
    }}
  >
    <ChevronRight size={22} color="#1e3a8a" />
  Links
  </h2>
</div>
           <div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    gap: 16,
  }}
>
              {config.links.map((link) => (
                <a href={link.url} target="_blank" rel="noreferrer" key={link.id}>
                  <Card>
                    <div
  style={{
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    
    {/* ICONA DINAMICA */}
    {link.id === "site" && <Globe size={18} color="#0369a1" />}
    {link.id === "facebook" && <Facebook size={18} color="#1877F2" />}
    {link.id === "instagram" && <Instagram size={18} color="#E1306C" />}
    {link.id === "whatsapp" && <MessageCircle size={18} color="#25D366" />}

    <div>
      <div style={{ fontWeight: 800 }}>{link.label}</div>
      <div style={{ fontSize: 14, color: "#64748b" }}>
        Apri collegamento
      </div>
    </div>
  </div>

  <ExternalLink size={16} color="#0369a1" />
</div>
                  </Card>
                </a>
              ))}
            </div>
          </section>
        </div>
       
        <aside style={{ display: "grid", gap: 24, alignSelf: "start" }}>
                    <Card>
  <div style={{ padding: 24 }}>
    <button
      onClick={() => setNotificationsPanelOpen((value) => !value)}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            background: "white",
            border: "1px solid #fde68a",
            borderRadius: 16,
            padding: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={18} color="#d97706" />
        </div>

        <div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>
            Status delle notifiche push
          </div>
          <div style={{ color: "#64748b", fontSize: 14 }}>
            Attiva le notifiche push
          </div>
        </div>
      </div>

      {notificationsPanelOpen ? (
        <ChevronUp size={18} color="#64748b" />
      ) : (
        <ChevronDown size={18} color="#64748b" />
      )}
    </button>

    {notificationsPanelOpen ? (
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 12,
          }}
        >
          <Button onClick={() => void enableNotifications()} disabled={loading || pushEnabled}>
            {loading ? <Loader2 size={16} /> : null}
            {pushEnabled ? (
              <>
                <CheckCircle size={16} /> Notifiche attive
              </>
            ) : (
              "Attiva notifiche"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => void verifyNotifications()}
            disabled={checkingNotifications}
          >
            {checkingNotifications ? <Loader2 size={16} /> : null}
            Verifica
          </Button>
        </div>

        {!verificationDone ? (
          <div
            style={{
              marginTop: 10,
              display: "grid",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: browserPermissionGranted ? "#15803d" : "#b91c1c",
              }}
            >
              {browserPermissionGranted ? <CheckCircle size={14} /> : <XCircle size={14} />}
              Browser autorizzato
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: deviceRegistered ? "#15803d" : "#b91c1c",
              }}
            >
              {deviceRegistered ? <CheckCircle size={14} /> : <XCircle size={14} />}
              Device registrato
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: subscriptionActive ? "#15803d" : "#b91c1c",
              }}
            >
              {subscriptionActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
              Subscription attiva
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: 10,
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: verificationOk ? "#15803d" : "#b45309",
            }}
          >
            {verificationOk ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {verificationOk
              ? "Sistema notifiche pronto"
              : "Problema con configurazione notifiche"}
          </div>
        )}
      </div>
    ) : null}
  </div>
</Card>

<Card>
  <div
    style={{
      padding: 24,
      background: "#0f172a",
      color: "white",
      borderRadius: 24,
    }}
  >
    <button
      onClick={() => setMembersAreaOpen((value) => !value)}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        color: "white",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 16,
            padding: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lock size={18} color="#fde68a" />
        </div>

        <div>
          <div style={{ fontWeight: 700, color: "white" }}>
            Area soci
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 14 }}>
            Effettua il login
          </div>
        </div>
      </div>

      {membersAreaOpen ? (
        <ChevronUp size={18} color="#cbd5e1" />
      ) : (
        <ChevronDown size={18} color="#cbd5e1" />
      )}
    </button>

    {membersAreaOpen ? (
      <div style={{ marginTop: 16 }}>
        {!memberLoggedIn ? (
          <div style={{ display: "grid", gap: 12 }}>
            <p style={{ color: "#cbd5e1", margin: 0 }}>
            
            </p>

            <Field label="Password area soci">
  <div style={{ position: "relative" }}>
    <TextInput
      type={showMemberPassword ? "text" : "password"}
      value={memberPassword}
      onChange={(e) => setMemberPassword(e.target.value)}
      style={{ paddingRight: 44 }}
    />

    <button
      type="button"
      onClick={() => setShowMemberPassword((v) => !v)}
      style={{
        position: "absolute",
        top: "50%",
        right: 10,
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showMemberPassword ? (
        <EyeOff size={18} color="#64748b" />
      ) : (
        <Eye size={18} color="#64748b" />
      )}
    </button>
  </div>
</Field>

            {memberError ? (
              <div
                style={{
                  color: "#fecaca",
                  background: "rgba(127,29,29,0.35)",
                  border: "1px solid rgba(248,113,113,0.35)",
                  borderRadius: 12,
                  padding: 10,
                  fontSize: 14,
                }}
              >
                {memberError}
              </div>
            ) : null}

            <Button variant="secondary" onClick={loginMembersArea}>
              Accedi
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.06)",
                padding: 12,
                borderRadius: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#86efac" }}>
                <ShieldCheck size={16} /> Sessione soci attiva
              </div>

              <Button variant="outline" onClick={logoutMembersArea}>
                <LogOut size={16} /> Esci
              </Button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
  <div style={{ color: "#cbd5e1", fontSize: 14 }}>
    
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 10,
    }}
  >
    <Button
  variant={membersSection === "attendance" ? "secondary" : "outline"}
  onClick={() => {
    setMembersSection((prev) => (prev === "attendance" ? "home" : "attendance"));
    setAttendanceError("");
    setAttendanceMessage("");
  }}
>
  Presenze eventi
</Button>

    <Button
  variant={membersSection === "materials" ? "secondary" : "outline"}
  onClick={() => setMembersSection((prev) => (prev === "materials" ? "home" : "materials"))}
>
  Materiale soci
</Button>
  </div>

  {membersSection === "attendance" ? (
    <div
      style={{
        marginTop: 8,
        display: "grid",
        gap: 12,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: 12,
      }}
    >
      <div style={{ fontWeight: 700, color: "white" }}>Presenze eventi</div>

      {attendanceError ? (
        <div
          style={{
            color: "#fecaca",
            background: "rgba(127,29,29,0.35)",
            border: "1px solid rgba(248,113,113,0.35)",
            borderRadius: 12,
            padding: 10,
            fontSize: 14,
          }}
        >
          {attendanceError}
        </div>
      ) : null}

      {attendanceMessage ? (
        <div
          style={{
            color: "#bbf7d0",
            background: "rgba(20,83,45,0.35)",
            border: "1px solid rgba(134,239,172,0.35)",
            borderRadius: 12,
            padding: 10,
            fontSize: 14,
          }}
        >
          {attendanceMessage}
        </div>
      ) : null}

      {upcomingEvents.length === 0 ? (
        <div style={{ color: "#cbd5e1", fontSize: 14 }}>
          Nessun evento disponibile.
        </div>
      ) : (
        upcomingEvents.map((event) => {
          const form = getAttendanceFormValue(event.id);
          const responses = attendanceResponses[event.id] || [];
          const responsesOpen = attendanceResponsesOpen[event.id] || false;
          const groupedResponses = getGroupedAttendanceResponses(responses);

          return (
            <div
              key={event.id}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: 12,
                display: "grid",
                gap: 10,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: "white" }}>{event.title}</div>
                <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
                  {formatDate(event.date)}{event.time ? ` • ${event.time}` : ""}
                </div>
              </div>

              <Field label="Nome socio">
                <TextInput
                  value={form.name}
                  onChange={(e) => updateAttendanceForm(event.id, { name: e.target.value })}
                  placeholder="Inserisci il tuo nome"
                />
              </Field>

              <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  }}
>
  <button
    type="button"
    onClick={() => updateAttendanceForm(event.id, { status: "present" })}
    style={{
      padding: "12px 10px",
      borderRadius: 16,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      whiteSpace: "nowrap",
      ...getAttendanceStatusStyles("present", form.status === "present"),
    }}
  >
    Presente
  </button>

  <button
    type="button"
    onClick={() => updateAttendanceForm(event.id, { status: "absent" })}
    style={{
      padding: "12px 10px",
      borderRadius: 16,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      whiteSpace: "nowrap",
      ...getAttendanceStatusStyles("absent", form.status === "absent"),
    }}
  >
    Assente
  </button>

  <button
    type="button"
    onClick={() => updateAttendanceForm(event.id, { status: "maybe" })}
    style={{
      padding: "12px 10px",
      borderRadius: 16,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      whiteSpace: "nowrap",
      ...getAttendanceStatusStyles("maybe", form.status === "maybe"),
    }}
  >
    Forse
  </button>
</div>

              <div style={{ display: "grid", gap: 6 }}>
  <Button
    onClick={() => void submitAttendance(event.id)}
    disabled={attendanceLoadingByEvent[event.id]}
    variant="dark"
  >
    {attendanceLoadingByEvent[event.id] ? <Loader2 size={16} /> : null}
    Salva risposta
  </Button>

  <button
  onClick={() =>
    setAttendanceResponsesOpen((prev) => ({
      ...prev,
      [event.id]: !prev[event.id],
    }))
  }
  style={{
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-start",
  }}
>
  {attendanceResponsesOpen[event.id] ? (
    <>
      <ChevronUp size={14} /> Nascondi risposte ({responses.length})
    </>
  ) : (
    <>
      <ChevronDown size={14} /> Mostra risposte ({responses.length})
    </>
  )}
</button>
</div>

              {responsesOpen ? (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "#cbd5e1",
                    display: "grid",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "white" }}>Risposte ricevute</div>

                  {responses.length === 0 ? (
  <div>Nessuna risposta registrata.</div>
) : (
  <div style={{ display: "grid", gap: 10 }}>
    {(["present", "absent", "maybe"] as AttendanceStatus[]).map((status) => {
      const items = groupedResponses[status];

      if (items.length === 0) return null;

      return (
        <div key={status} style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={{ fontWeight: 700, color: "white" }}>
              {getAttendanceStatusLabel(status)}
            </span>

            <span
              style={{
                fontWeight: 700,
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                ...getAttendanceStatusStyles(status, false),
              }}
            >
              {items.length}
            </span>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {items.map((response) => (
              <div
                key={response.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  paddingBottom: 6,
                }}
              >
                <span>{response.name}</span>

                <span
  style={{
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color:
      response.status === "present"
        ? "#16a34a"
        : response.status === "absent"
        ? "#dc2626"
        : "#facc15",
  }}
>
  {response.status === "present" && "PRESENTE"}
  {response.status === "absent" && "ASSENTE"}
  {response.status === "maybe" && "FORSE"}
</span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
)}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  ) : null}

  {membersSection === "materials" ? (
    <div
      style={{
        display: "grid",
        gap: 12,
        background: "rgba(255,255,255,0.06)",
        padding: 12,
        borderRadius: 16,
      }}
    >
      <div style={{ fontWeight: 700, color: "white" }}>
        Materiale soci
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <a
          href={MEMBERS_MATERIAL_LINKS.music}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "white" }}>
                Spartiti e materiale
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                Visualizza documenti
              </div>
            </div>

            <ExternalLink size={16} color="#cbd5e1" />
          </div>
        </a>

        <a
          href={MEMBERS_MATERIAL_LINKS.media}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "white" }}>
                Foto e video soci
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                Carica contenuti
              </div>
            </div>

            <ExternalLink size={16} color="#cbd5e1" />
          </div>
        </a>
      </div>
    </div>
  ) : null}
</div>

          </div>
        )}
      </div>
    ) : null}
  </div>
</Card>          
          <Card>
  <div
    style={{
      padding: 24,
      background: "#0f172a",
      color: "white",
      borderRadius: 24,
    }}
  >
    <button
  onClick={() => setAdminPanelOpen((value) => !value)}
  style={{
    width: "100%",
    background: "transparent",
    border: "none",
    color: "white",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    textAlign: "left",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Lock size={18} color="#fde68a" />
    </div>

    <div>
      <div style={{ fontWeight: 700, color: "white" }}>
        Area amministratore
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 14 }}>
        Effettua il login
      </div>
    </div>
  </div>

  {adminPanelOpen ? (
    <ChevronUp size={18} color="#cbd5e1" />
  ) : (
    <ChevronDown size={18} color="#cbd5e1" />
  )}
</button>

    {adminPanelOpen ? (
      <div style={{ marginTop: 16 }}>
        {!admin ? (
          <div style={{ display: "grid", gap: 12 }}>
            <p style={{ color: "#cbd5e1", margin: 0 }}>
              
            </p>
            <Field label="Password amministratore">
  <div style={{ position: "relative" }}>
    <TextInput
      type={showAdminPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={{ paddingRight: 44 }}
    />

    <button
      type="button"
      onClick={() => setShowAdminPassword((v) => !v)}
      style={{
        position: "absolute",
        top: "50%",
        right: 10,
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showAdminPassword ? (
        <EyeOff size={18} color="#64748b" />
      ) : (
        <Eye size={18} color="#64748b" />
      )}
    </button>
  </div>
</Field>
            <Button variant="secondary" onClick={() => void login()} disabled={loading}>
              {loading ? <Loader2 size={16} /> : null} Accedi
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      background: "rgba(255,255,255,0.06)",
      padding: 12,
      borderRadius: 16,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#86efac" }}>
      <ShieldCheck size={16} /> Sessione attiva
    </div>
    <Button variant="outline" onClick={() => void logout()}>
      <LogOut size={16} /> Esci
    </Button>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 10,
    }}
  >
    <Button
      variant={adminSection === "surveys" ? "secondary" : "outline"}
      onClick={() => setAdminSection("surveys")}
    >
      Risultati sondaggi
    </Button>

    <Button
      variant={adminSection === "events" ? "secondary" : "outline"}
      onClick={() => setAdminSection("events")}
    >
      Aggiungi eventi
    </Button>

    <Button
      variant={adminSection === "news" ? "secondary" : "outline"}
      onClick={() => setAdminSection("news")}
    >
      Aggiungi news
    </Button>
  </div>

  {adminSection === "surveys" ? (
    <div
      style={{
        display: "grid",
        gap: 12,
        background: "rgba(255,255,255,0.06)",
        padding: 12,
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
        <ShieldCheck size={16} /> Risultati sondaggi
      </div>

      {upcomingEvents.length === 0 ? (
        <div style={{ color: "#cbd5e1", fontSize: 14 }}>
          Nessun evento disponibile.
        </div>
      ) : (
        upcomingEvents.map((event) => {
          const responses = getAdminEventResponses(event.id);
          const counts = getAdminEventCounts(event.id);

          return (
            <div
              key={event.id}
              style={{
                display: "grid",
                gap: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <div
  style={{
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  }}
>
  <div>
    <div style={{ fontWeight: 700, color: "white" }}>{event.title}</div>
    <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
      {formatDate(event.date)}{event.time ? ` • ${event.time}` : ""}
    </div>
  </div>

  <button
    type="button"
    onClick={() => void copyWhatsAppEventText(event)}
    title="Copia testo WhatsApp"
    style={{
      background: "transparent",
      border: "none",
      padding: 4,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      flex: "0 0 auto",
    }}
  >
    <MessageCircle size={16} color="#86efac" />
  </button>
</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    padding: "10px 8px",
                    background: "rgba(255,255,255,0.05)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#cbd5e1", textTransform: "uppercase" }}>
                    Totale
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{counts.total}</div>
                </div>

                <div
                  style={{
                    borderRadius: 12,
                    padding: "10px 8px",
                    background: "rgba(22,163,74,0.12)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#86efac", textTransform: "uppercase" }}>
                    Presenti
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#86efac" }}>
                    {counts.present}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 12,
                    padding: "10px 8px",
                    background: "rgba(220,38,38,0.12)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#fca5a5", textTransform: "uppercase" }}>
                    Assenti
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#fca5a5" }}>
                    {counts.absent}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 12,
                    padding: "10px 8px",
                    background: "rgba(234,179,8,0.12)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#fde68a", textTransform: "uppercase" }}>
                    Forse
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#fde68a" }}>
                    {counts.maybe}
                  </div>
                </div>
              </div>

              {responses.length > 0 ? (
                <div style={{ display: "grid", gap: 6 }}>
                  {(["present", "absent", "maybe"] as AttendanceStatus[]).map((status) => {
                    const items = responses.filter((response) => response.status === status);

                    if (items.length === 0) return null;

                    return (
                      <div key={status} style={{ display: "grid", gap: 4 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              status === "present"
                                ? "#86efac"
                                : status === "absent"
                                ? "#fca5a5"
                                : "#fde68a",
                            textTransform: "uppercase",
                          }}
                        >
                          {status === "present" && "Presenti"}
                          {status === "absent" && "Assenti"}
                          {status === "maybe" && "Forse"}
                        </div>

                        <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>
                          {items.map((item) => item.name).join(", ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                  Nessuna risposta registrata.
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  ) : null}

  {adminSection === "events" ? (
  <div style={{ display: "grid", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
      <Plus size={16} /> Nuovo evento
    </div>

    <Field label="Titolo">
      <TextInput
        value={eventForm.title}
        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
      />
    </Field>

    <Field label="Data">
      <TextInput
        type="date"
        value={eventForm.date}
        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
      />
    </Field>

    <Field label="Ora">
      <TextInput
        type="time"
        value={eventForm.time}
        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
      />
    </Field>

    <Field label="Luogo">
      <TextInput
        value={eventForm.place}
        onChange={(e) => setEventForm({ ...eventForm, place: e.target.value })}
      />
    </Field>

    <Field label="Descrizione">
      <TextArea
        value={eventForm.description}
        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
      />
    </Field>

    {/* 👇 NUOVI CAMPI */}

    <Field label="Info cibo">
      <TextInput
        value={eventForm.food_info}
        onChange={(e) => setEventForm({ ...eventForm, food_info: e.target.value })}
      />
    </Field>

    <Field label="Info suonate">
      <TextInput
        value={eventForm.music_info}
        onChange={(e) => setEventForm({ ...eventForm, music_info: e.target.value })}
      />
    </Field>

    <Field label="Termine ore">
      <TextInput
        value={eventForm.end_time_info}
        onChange={(e) => setEventForm({ ...eventForm, end_time_info: e.target.value })}
      />
    </Field>

    <Field label="Info supplementari">
      <TextArea
        value={eventForm.extra_info}
        onChange={(e) => setEventForm({ ...eventForm, extra_info: e.target.value })}
      />
    </Field>

    <Button onClick={() => void addEvent()} disabled={loading}>
      {loading ? <Loader2 size={16} /> : null} Aggiungi evento
    </Button>
  </div>
) : null}

  {adminSection === "news" ? (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
        <Newspaper size={16} /> Nuova notizia
      </div>
      <Field label="Titolo">
        <TextInput
          value={newsForm.title}
          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
        />
      </Field>
      <Field label="Data">
        <TextInput
          type="date"
          value={newsForm.date}
          onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
        />
      </Field>
      <Field label="Testo">
        <TextArea
          value={newsForm.body}
          onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
        />
      </Field>
      <Button variant="secondary" onClick={() => void addNews()} disabled={loading}>
        {loading ? <Loader2 size={16} /> : null} Aggiungi notizia
      </Button>
    </div>
  ) : null}
</div>
        )}
      </div>
    ) : null}
  </div>
</Card>

         
        </aside>
      </div>
<a
  href="mailto:sabrina.mottini@hotmail.com"
  style={{
    position: "fixed",
    bottom: 40,
    right: 20,
    background: "#0284c7",
    color: "white",
    padding: 14,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    zIndex: 1000,
  }}
>
  <Mail size={28} />
</a>
    </main>
  );
}
