import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    associationName: process.env.NEXT_PUBLIC_ASSOCIATION_NAME || "Stracaganass",
    appTitle: process.env.NEXT_PUBLIC_APP_TITLE || "Stracaganass WebApp",
    tagline: "La guggen simpatica",
    links: [
      { id: "1", label: "Sito ufficiale", url: "https://stracaganass0.wordpress.com/" },
      { id: "2", label: "Area Soci", url: "https://stracaganass0.wordpress.com/area-soci/" },
      { id: "3", label: "Instagram", url: "https://www.instagram.com/stracaganass/" },
      { id: "4", label: "WhatsApp", url: "https://whatsapp.com/channel/0029Va9XWFk11ulQK0DMLc0R" }
    ]
  });
}
