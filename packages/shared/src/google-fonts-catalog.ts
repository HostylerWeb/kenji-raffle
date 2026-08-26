export type GoogleFontEntry = {
  family: string;
  category: "sans-serif" | "serif" | "display";
  weights: string;
};

/** Curated Google Fonts safe for raffle / commerce sites */
export const GOOGLE_FONTS_CATALOG: GoogleFontEntry[] = [
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "Inter", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "DM Sans", category: "sans-serif", weights: "400;500;600;700" },
  { family: "Poppins", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "Montserrat", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "Outfit", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "Manrope", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "Nunito Sans", category: "sans-serif", weights: "400;600;700;800" },
  { family: "Roboto", category: "sans-serif", weights: "400;500;700" },
  { family: "Oswald", category: "display", weights: "400;500;600;700" },
  { family: "Bebas Neue", category: "display", weights: "400" },
  { family: "Anton", category: "display", weights: "400" },
  { family: "Playfair Display", category: "serif", weights: "400;500;600;700;800" },
  { family: "Merriweather", category: "serif", weights: "400;700" },
  { family: "Lora", category: "serif", weights: "400;500;600;700" },
  { family: "Space Grotesk", category: "sans-serif", weights: "400;500;600;700" },
  { family: "Rubik", category: "sans-serif", weights: "400;500;600;700;800" },
  { family: "Work Sans", category: "sans-serif", weights: "400;500;600;700;800" },
];

export function findGoogleFont(family: string): GoogleFontEntry | undefined {
  return GOOGLE_FONTS_CATALOG.find(
    (f) => f.family.toLowerCase() === family.trim().toLowerCase(),
  );
}

export function buildGoogleFontsUrl(families: string[]): string {
  const unique = [...new Set(families.map((f) => f.trim()).filter(Boolean))];
  if (unique.length === 0) return "";

  const params = unique
    .map((family) => {
      const entry = findGoogleFont(family);
      const weights = entry?.weights ?? "400;500;600;700";
      const encoded = family.replace(/ /g, "+");
      return `family=${encoded}:wght@${weights}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
