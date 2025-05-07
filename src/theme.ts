import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "'Press Start 2P', monospace",
    body: "'Press Start 2P', monospace",
    mono: "'Press Start 2P', monospace",
  },
  colors: {
    neon: {
      blue: "#00E8FF",
      pink: "#FF00CC",
      violet: "#A259FF",
      yellow: "#FF9900",
      dark: "#181A20",
      panel: "#23272F",
    },
    gray: {
      900: "#181A20",
      800: "#23272F",
    },
  },
  styles: {
    global: {
      "html, body": {
        bg: "#181A20",
        color: "#00E8FF",
        fontFamily: "'Press Start 2P', monospace",
        letterSpacing: "0.5px",
        minHeight: "100vh",
      },
      "*": {
        boxSizing: "border-box",
      },
      "::selection": {
        background: "#FF00CC55",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: "'Press Start 2P', monospace",
        fontWeight: "bold",
        borderRadius: "md",
        boxShadow: "0 0 8px #00E8FF, 0 0 16px #FF00CC55",
        _focus: {
          boxShadow: "0 0 0 2px #FF00CC",
        },
      },
      variants: {
        neon: {
          bgGradient: "linear(to-r, #00E8FF, #FF00CC, #A259FF)",
          color: "#181A20",
          border: "2px solid #00E8FF",
          textShadow: "0 0 8px #00E8FF",
          _hover: {
            bgGradient: "linear(to-r, #FF00CC, #00E8FF, #A259FF)",
            boxShadow: "0 0 24px #FF00CC, 0 0 48px #00E8FF",
            color: "#fff",
          },
        },
        outline: {
          border: "2px solid #00E8FF",
          color: "#00E8FF",
          bg: "transparent",
          _hover: {
            bg: "#23272F",
            boxShadow: "0 0 16px #00E8FF, 0 0 32px #FF00CC55",
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "#181A20",
          border: "2.5px solid",
          borderImage: "linear-gradient(90deg, #00E8FF, #FF00CC, #A259FF) 1",
          boxShadow: "0 0 32px #00E8FF, 0 0 64px #FF00CC55",
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: "#23272F",
          border: "2px solid #00E8FF",
          color: "#00E8FF",
          fontFamily: "'Press Start 2P', monospace",
          _placeholder: {
            color: "#A259FF",
            opacity: 1,
          },
        },
      },
    },
  },
}); 