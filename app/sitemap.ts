import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://noha-manqabat.vercel.app";
  return [
    { url: base,              lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${base}/#videos`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/#lyrics`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/#manqabat`,lastModified: new Date(),changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/#majlis`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/#contact`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
