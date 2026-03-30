import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    associationName: process.env.NEXT_PUBLIC_ASSOCIATION_NAME || "Stracaganass",
    appTitle: process.env.NEXT_PUBLIC_APP_TITLE || "StracApp",
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
  },
  {
    id: "area_soci",
    label: "Area soci",
    url: "https://stracaganass0.wordpress.com/area-soci/"
  }
]
  });
}
