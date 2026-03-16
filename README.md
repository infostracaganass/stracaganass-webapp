# Stracaganass WebApp

Progetto Next.js pronto per pubblicazione con:
- frontend webapp responsive
- gestione eventi e notizie
- login amministratore con password server-side
- database Supabase
- predisposizione notifiche OneSignal

## Avvio locale

1. Copia `.env.example` in `.env.local`
2. Compila le variabili ambiente
3. Esegui lo script `supabase-schema.sql` su Supabase
4. Installa le dipendenze
5. Avvia il progetto

```bash
npm install
npm run dev
```

## Note

- Le icone PWA incluse sono placeholder semplici da sostituire.
- I link Instagram e WhatsApp sono generici e vanno rimpiazzati con quelli reali dell'associazione.
- La parte OneSignal lato browser è predisposta ma non completa di service worker reale.
