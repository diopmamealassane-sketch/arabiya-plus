export default function sitemap() {
  const base = "https://arabiya-plus.com";
  const now = new Date();
  const niveaux = ["a1", "a2", "b1", "b2", "c1", "c2"];

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/test-niveau`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...niveaux.map((n) => ({
      url: `${base}/cours-arabe/${n}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${base}/politique-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];
}
