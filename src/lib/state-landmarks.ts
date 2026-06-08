// Famous landmark per state — shown as a poster banner on board cards
// (BookMyShow-style city art). Emoji keeps it dependency-free + always renders.
export type Landmark = {
  landmark: string;
  emoji: string;
  from: string; // gradient start
  to: string; // gradient end
};

export const STATE_LANDMARKS: Record<string, Landmark> = {
  Telangana: { landmark: "Charminar", emoji: "🕌", from: "#155E45", to: "#1F8765" },
  "Andhra Pradesh": { landmark: "Tirupati Temple", emoji: "🛕", from: "#9A3412", to: "#EA580C" },
  Karnataka: { landmark: "Mysore Palace", emoji: "🏰", from: "#7C2D12", to: "#C2410C" },
  "Tamil Nadu": { landmark: "Meenakshi Temple", emoji: "🛕", from: "#854D0E", to: "#CA8A04" },
  Maharashtra: { landmark: "Gateway of India", emoji: "🏛️", from: "#1E3A8A", to: "#2563EB" },
  Delhi: { landmark: "India Gate", emoji: "🏛️", from: "#3F3F46", to: "#71717A" },
  Rajasthan: { landmark: "Hawa Mahal", emoji: "🏯", from: "#9D174D", to: "#DB2777" },
  "Uttar Pradesh": { landmark: "Taj Mahal", emoji: "🕌", from: "#0F766E", to: "#14B8A6" },
  Kerala: { landmark: "Backwaters", emoji: "🛶", from: "#065F46", to: "#10B981" },
  "West Bengal": { landmark: "Howrah Bridge", emoji: "🌉", from: "#374151", to: "#6B7280" },
  Gujarat: { landmark: "Statue of Unity", emoji: "🗿", from: "#92400E", to: "#D97706" },
  Punjab: { landmark: "Golden Temple", emoji: "🛕", from: "#A16207", to: "#EAB308" },
};

export const DEFAULT_LANDMARK: Landmark = {
  landmark: "All India",
  emoji: "📚",
  from: "#3E3A8C",
  to: "#5852C9",
};

export function landmarkFor(state: string | null | undefined): Landmark {
  return (state && STATE_LANDMARKS[state]) || DEFAULT_LANDMARK;
}
