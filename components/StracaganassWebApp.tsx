"use client";

import { useEffect, useMemo, useState } from "react";
import OneSignal from "react-onesignal";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Megaphone,
  Newspaper,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  place?: string | null;
  description?: string | null;
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
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
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
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid #cbd5e1",
        background: "white",
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
        minHeight: 100,
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid #cbd5e1",
        background: "white",
        resize: "vertical",
      }}
    />
  );
}

export default function StracaganassWebApp() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [showIosHelp, setShowIosHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const updateLayout = () => setIsMobile(window.innerWidth < 900);
  updateLayout();
  window.addEventListener("resize", updateLayout);
  return () => window.removeEventListener("resize", updateLayout);
}, []);
  const [events, setEvents] = useState<EventItem[]>(FALLBACK_EVENTS);
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

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
    return events.filter((item) => new Date(`${item.date}T${item.time || "00:00"}`) >= today);
  }, [events]);

  const visibleEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 5);

const handleInstallClick = async () => {
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

    setPushEnabled(true);
    alert("Notifiche attivate correttamente.");
  } catch (err) {
    alert(err instanceof Error ? err.message : "Errore attivazione notifiche.");
  } finally {
    setLoading(false);
  }
};

  const login = async () => {
    setLoading(true);
    try {
      await apiFetch<{ ok: true; admin: true }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setAdmin(true);
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
    } catch {
      setAdmin(false);
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
      setEventForm({ title: "", date: "", time: "", place: "", description: "" });
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

  return (
    <main
  style={{
    maxWidth: 1200,
    margin: "0 auto",
    padding: isMobile ? 14 : 24,
    width: "100%",
  }}
>
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div style={{ padding: 24 }}>
           
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <Megaphone size={16} /> {config.tagline}
              </div>
             <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "14px 0 10px",
  }}
>
  <img
    src="/logo-stracaganass.png"
    alt="Stracaganass"
    style={{
      height: isMobile ? 36 : 48,
      width: "auto",
    }}
  />

  <h1
    style={{
      fontSize: isMobile ? 30 : 44,
      margin: 0,
      lineHeight: 1.05,
    }}
  >
    StracAPP
  </h1>
</div>
              <p style={{ maxWidth: 760, color: "#475569", fontSize: 18 }}>
  Le informazioni a portata di mano
</p>
            </div>
          </div>
        </Card>
      </motion.section>

      {error ? (
        <div style={{ marginTop: 16, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: 14, borderRadius: 16 }}>
          {error}
        </div>
      ) : null}

     <div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
    gap: 24,
    marginTop: 24,
    alignItems: "start",
  }}
>
        <div style={{ display: "grid", gap: 24 }}>
          <Card>
  <div
    style={{
      padding: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      background: "#f8fafc",
      borderRadius: 20,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          background: "#e0f2fe",
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
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          Installa StracAPP
        </div>

        <div style={{ fontSize: 14, color: "#64748b" }}>
          Per sistemi iPhone o Android
        </div>
      </div>
    </div>

  <Button onClick={() => void handleInstallClick()}>
  {isIos ? "Guida installazione" : "Installa app"}
</Button>
  </div>

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
        <li>Verifica di aver aperto il link in Safari</li>
        <li>Tocca il pulsante Condividi</li>
        <li>Seleziona “Aggiungi a Home”</li>
        <li>Conferma</li>
      </ol>

      <div style={{ marginTop: 12 }}>
        <Button variant="outline" onClick={() => setShowIosHelp(false)}>
          Chiudi
        </Button>
      </div>
    </div>
  ) : null}
</Card>

          <Card>
            <div style={{ padding: 24, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ background: "white", border: "1px solid #fde68a", borderRadius: 16, padding: 10 }}>
                  <Bell size={18} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Ricevi notifiche su eventi e notizie</div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    Attiva le notifiche per rimanere aggiornato 
                  </div>
                </div>
              </div>
              <Button onClick={enableNotifications} disabled={loading || pushEnabled}>
                {loading ? <Loader2 size={16} /> : null}
                {pushEnabled ? "Notifiche attive" : "Attiva notifiche"}
              </Button>
            </div>
          </Card>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
              <div>
  <h2
    style={{
      margin: 0,
      fontSize: 32,
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#1e3a8a",
    }}
  >
    📅 Eventi in arrivo
  </h2>
</div>
              <Button variant="outline" onClick={() => void loadData()} title="Aggiorna">
                <RefreshCw size={16} />
              </Button>
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
                visibleEvents.map((item) => (
                  <Card key={item.id}>
                    <div style={{ padding: 20, display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0369a1", fontWeight: 700 }}>Evento</div>
                          <div style={{ fontSize: 22, fontWeight: 800 }}>{item.title}</div>
                        </div>
                        {item.time ? (
                          <div style={{ background: "#fef3c7", color: "#92400e", borderRadius: 999, padding: "6px 10px", height: "fit-content" }}>
                            {item.time}
                          </div>
                        ) : null}
                      </div>
                      <div style={{ color: "#475569", display: "grid", gap: 6, fontSize: 14 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Calendar size={15} /> {formatDate(item.date)}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MapPin size={15} /> {item.place || "Da confermare"}</div>
                      </div>
                      <div style={{ color: "#334155" }}>{item.description || ""}</div>
                      {admin ? (
                        <Button variant="outline" onClick={() => void deleteEvent(item.id)} disabled={deletingId === item.id}>
                          <Trash2 size={16} /> Elimina
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                ))
              ) : (
                <div>Nessun evento disponibile.</div>
              )}
            </div>

            {upcomingEvents.length > 5 ? (
              <div style={{ marginTop: 12 }}>
                <Button variant="outline" onClick={() => setShowAllEvents((value) => !value)}>
                  {showAllEvents ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showAllEvents ? "Mostra meno" : "Mostra altro"}
                </Button>
              </div>
            ) : null}
          </section>

          <section>
            <div style={{ marginBottom: 12 }}>
  <h2
    style={{
      margin: 0,
      fontSize: 32,
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#1e3a8a"
    }}
  >
    📰 Ultime info
  </h2>
</div>
            <div style={{ display: "grid", gap: 16 }}>
              {news.map((item) => (
                <Card key={item.id}>
                  <div style={{ padding: 20, display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, textTransform: "uppercase", color: "#b45309", fontWeight: 700 }}>Notizia</div>
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
              ))}
            </div>
          </section>

          <section>
            <div style={{ marginBottom: 12 }}>
  <h2
    style={{
      margin: 0,
      fontSize: 32,
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#1e3a8a"
    }}
  >
    🔗 Link utili
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
                    <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{link.label}</div>
                        <div style={{ fontSize: 14, color: "#64748b" }}>Apri collegamento</div>
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
            <div style={{ padding: 24, background: "#0f172a", color: "white", borderRadius: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Lock size={18} color="#fde68a" />
                <strong>Area amministratore</strong>
              </div>

              {!admin ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <p style={{ color: "#cbd5e1", margin: 0 }}>
                    Accesso semplice per inserire eventi e news in pochi secondi.
                  </p>
                  <Field label="Password amministratore">
                    <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </Field>
                  <Button variant="secondary" onClick={() => void login()} disabled={loading}>
                    {loading ? <Loader2 size={16} /> : null} Accedi
                  </Button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", padding: 12, borderRadius: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#86efac" }}>
                      <ShieldCheck size={16} /> Sessione attiva
                    </div>
                    <Button variant="outline" onClick={() => void logout()}>
                      <LogOut size={16} /> Esci
                    </Button>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}><Plus size={16} /> Nuovo evento</div>
                    <Field label="Titolo"><TextInput value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></Field>
                    <Field label="Data"><TextInput type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></Field>
                    <Field label="Ora"><TextInput type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} /></Field>
                    <Field label="Luogo"><TextInput value={eventForm.place} onChange={(e) => setEventForm({ ...eventForm, place: e.target.value })} /></Field>
                    <Field label="Descrizione"><TextArea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></Field>
                    <Button onClick={() => void addEvent()} disabled={loading}>{loading ? <Loader2 size={16} /> : null} Aggiungi evento</Button>
                  </div>

                  <div style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}><Newspaper size={16} /> Nuova notizia</div>
                    <Field label="Titolo"><TextInput value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} /></Field>
                    <Field label="Data"><TextInput type="date" value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} /></Field>
                    <Field label="Testo"><TextArea value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} /></Field>
                    <Button variant="secondary" onClick={() => void addNews()} disabled={loading}>{loading ? <Loader2 size={16} /> : null} Aggiungi notizia</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: 20 }}>
              <strong>Backend semplice consigliato</strong>
              <ul style={{ color: "#475569" }}>
                <li>Frontend Next.js su Vercel</li>
                <li>Database Supabase Postgres</li>
                <li>Una sola password admin lato server</li>
                <li>Notifiche con OneSignal</li>
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
