export interface Theme {
  name: string;
  background: string;
  empty: string;
  levels: [string, string, string, string];
  text: string;
  subtext: string;
}

export const THEMES: Record<string, Theme> = {
  classic: {
    name: "Classic",
    background: "#0C1116",
    empty: "#161C23",
    levels: ["#023A16", "#196E2D", "#2CA044", "#39d353"],
    text: "#ffffff",
    subtext: "#8b949e",
  },
  light: {
    name: "Light",
    background: "#ffffff",
    empty: "#ebedf0",
    levels: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
    text: "#24292f",
    subtext: "#57606a",
  },
  dracula: {
    name: "Dracula",
    background: "#282a36",
    empty: "#44475a",
    levels: ["#6272a4", "#bd93f9", "#ff79c6", "#50fa7b"],
    text: "#f8f8f2",
    subtext: "#6272a4",
  },
  nord: {
    name: "Nord",
    background: "#2e3440",
    empty: "#3b4252",
    levels: ["#5e81ac", "#81a1c1", "#88c0d0", "#8fbcbb"],
    text: "#eceff4",
    subtext: "#d8dee9",
  },
  ocean: {
    name: "Ocean",
    background: "#0a192f",
    empty: "#112240",
    levels: ["#1d3461", "#1f5f8b", "#00b4d8", "#90e0ef"],
    text: "#ccd6f6",
    subtext: "#8892b0",
  },
  sunset: {
    name: "Sunset",
    background: "#1a1a2e",
    empty: "#16213e",
    levels: ["#e94560", "#f27121", "#e9724c", "#ffc857"],
    text: "#eee2dc",
    subtext: "#bab2b5",
  },
  mono: {
    name: "Mono",
    background: "#000000",
    empty: "#1a1a1a",
    levels: ["#404040", "#737373", "#a6a6a6", "#d9d9d9"],
    text: "#ffffff",
    subtext: "#999999",
  },
  catppuccin: {
    name: "Catppuccin",
    background: "#1e1e2e",
    empty: "#313244",
    levels: ["#585b70", "#89b4fa", "#cba6f7", "#a6e3a1"],
    text: "#cdd6f4",
    subtext: "#9399b2",
  },
  gruvbox: {
    name: "Gruvbox",
    background: "#282828",
    empty: "#3c3836",
    levels: ["#504945", "#98971a", "#b8bb26", "#fabd2f"],
    text: "#ebdbb2",
    subtext: "#a89984",
  },
  rosepine: {
    name: "Rosé Pine",
    background: "#191724",
    empty: "#26233a",
    levels: ["#403d52", "#9ccfd8", "#ebbcba", "#eb6f92"],
    text: "#e0def4",
    subtext: "#908caa",
  },
  synthwave: {
    name: "Synthwave",
    background: "#1a0b2e",
    empty: "#2d1b4e",
    levels: ["#7b2fbf", "#e83e8c", "#ff6ac1", "#36f9f6"],
    text: "#f8f8f2",
    subtext: "#b39ddb",
  },
  bhagwa: {
    name: "Bhagwa",
    background: "#1a0d00",
    empty: "#3a2410",
    // True kesari/saffron ramp: golden saffron -> deep saffron (#FF9933,
    // India flag) -> temple saffron (#FF7722) -> kesari vermilion (#FF671F).
    // Staying in the saffron family keeps even sparse cells reading saffron
    // instead of muddy brown.
    levels: ["#f4c430", "#ff9933", "#ff7722", "#ff671f"],
    text: "#fff3e0",
    subtext: "#e0b483",
  },
};

export function getTheme(name: string): Theme {
  return THEMES[name] || THEMES.classic;
}
