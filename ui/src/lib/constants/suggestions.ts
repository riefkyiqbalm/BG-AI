/**
 * Shared suggestion prompts and default chat suggestions
 * Used in DefaultPrompt component and other suggestion displays
 */

export interface Suggestion {
  icon: string;
  label: string;
  description?: string;
  prompt: string;
}

/**
 * Default chat suggestions/prompts shown in welcome screen
 */
export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    icon: "📊",
    label: "Analisis Gizi",
    description: "Analisis data nutrisi makanan",
    prompt: "Bagaimana cara menganalisis nilai gizi makanan?",
  },
  {
    icon: "🥗",
    label: "Rekomendasi Diet",
    description: "Dapatkan rekomendasi diet personal",
    prompt: "Berikan rekomendasi diet sehat untuk saya",
  },
  {
    icon: "📈",
    label: "Tracking Progress",
    description: "Pantau perkembangan nutrisi",
    prompt: "Bagaimana cara melacak progress nutrisi saya?",
  },
  {
    icon: "🏥",
    label: "Informasi Kesehatan",
    description: "Pelajari tentang kesehatan",
    prompt: "Jelaskan tentang pentingnya nutrisi seimbang",
  },
];

/**
 * Alternative welcome suggestions for authenticated users
 */
export const AUTH_SUGGESTIONS: Suggestion[] = [
  {
    icon: "⚡",
    label: "Start New Chat",
    prompt: "Buat sesi chat baru",
  },
  {
    icon: "📋",
    label: "View History",
    prompt: "Tampilkan riwayat chat",
  },
  {
    icon: "⚙️",
    label: "Settings",
    prompt: "Buka pengaturan",
  },
];

/**
 * Quick action suggestions
 */
export const QUICK_ACTIONS: Suggestion[] = [
  {
    icon: "🔍",
    label: "Search",
    prompt: "Cari dalam chat history",
  },
  {
    icon: "✏️",
    label: "Edit",
    prompt: "Edit pesan terakhir",
  },
  {
    icon: "📌",
    label: "Pin",
    prompt: "Pin pesan penting",
  },
  {
    icon: "🔗",
    label: "Share",
    prompt: "Bagikan chat",
  },
];

/**
 * Example prompts for different use cases
 */
export const EXAMPLE_PROMPTS = {
  nutrition: [
    "Berapa kebutuhan kalori harian saya?",
    "Makanan apa yang kaya akan protein?",
    "Bagaimana cara mengurangi gula dalam diet?",
    "Apa itu vitamin dan mineral esensial?",
  ],
  health: [
    "Apa manfaat olahraga teratur?",
    "Berapa jam tidur yang ideal?",
    "Cara menjaga kesehatan mental?",
    "Bagaimana cara meningkatkan imunitas?",
  ],
  menu: [
    "Beri saya ide menu sehat seminggu",
    "Resep makanan tinggi protein rendah kalori",
    "Menu diet seimbang untuk keluarga",
    "Makanan lezat dan bergizi untuk anak",
  ],
  tracking: [
    "Bagaimana cara menghitung kalori?",
    "Berapa berat badan ideal saya?",
    "Bagaimana progress tersimpan?",
    "Apa rekomendasi berdasarkan tracking saya?",
  ],
};

/**
 * Error message suggestions (responses when system encounters errors)
 */
export const ERROR_SUGGESTIONS: Suggestion[] = [
  {
    icon: "🔄",
    label: "Retry",
    prompt: "Coba lagi",
  },
  {
    icon: "🏠",
    label: "Start Over",
    prompt: "Mulai dari awal",
  },
  {
    icon: "❓",
    label: "Get Help",
    prompt: "Dapatkan bantuan",
  },
];

/**
 * Onboarding suggestions for new users
 */
export const ONBOARDING_SUGGESTIONS: Suggestion[] = [
  {
    icon: "👋",
    label: "Berkenalan",
    prompt: "Halo, saya pengguna baru",
  },
  {
    icon: "❓",
    label: "Bantuan",
    prompt: "Bagaimana cara menggunakan BG-AI?",
  },
  {
    icon: "📚",
    label: "Tutorial",
    prompt: "Tunjukkan tutorial lengkap",
  },
];

/**
 * Search suggestions (autocomplete suggestions for search)
 */
export const SEARCH_SUGGESTIONS = [
  "Kalori",
  "Protein",
  "Nutrisi",
  "Diet sehat",
  "Makanan bergizi",
  "Resep",
  "Kesehatan",
  "Olahraga",
  "Vitamin",
  "Mineral",
];

/**
 * Get suggestions by category
 */
export function getSuggestionsByCategory(
  category: "nutrition" | "health" | "menu" | "tracking"
): string[] {
  return EXAMPLE_PROMPTS[category];
}

/**
 * Get a random suggestion from a list
 */
export function getRandomSuggestion(suggestions: Suggestion[]): Suggestion {
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

/**
 * Filter suggestions by search query
 */
export function filterSuggestions(
  suggestions: Suggestion[],
  query: string
): Suggestion[] {
  const lowerQuery = query.toLowerCase();
  return suggestions.filter(
    (s) =>
      s.label.toLowerCase().includes(lowerQuery) ||
      s.prompt.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery)
  );
}
