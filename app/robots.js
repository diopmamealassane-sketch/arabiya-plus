export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // On bloque l'indexation des zones privées/techniques — inutile
      // pour Google et ça évite de gaspiller le budget de crawl.
      disallow: ["/dashboard", "/api/", "/login", "/lesson/", "/review", "/leaderboard"],
    },
    sitemap: "https://arabiya-plus.com/sitemap.xml",
  };
}

