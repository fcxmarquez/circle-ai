import type { Preview } from "@storybook/react";
import "../app/globals.css";

type StorybookTheme = "light" | "dark" | "system";

function getResolvedTheme(theme: StorybookTheme): "light" | "dark" {
  if (theme !== "system") {
    return theme;
  }

  if (globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme ?? "light") as StorybookTheme;
      const resolvedTheme = getResolvedTheme(theme);
      const isDark = resolvedTheme === "dark";

      document.documentElement.classList.toggle("dark", isDark);
      document.body.classList.toggle("dark", isDark);
      document.body.style.colorScheme = resolvedTheme;

      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        smallMobile: {
          name: "Small mobile (P)",
          styles: {
            width: "275px",
            height: "568px",
          },
        },
        mobile: {
          name: "Mobile (P)",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        mobileLandscape: {
          name: "Mobile (L)",
          styles: {
            width: "667px",
            height: "375px",
          },
        },
        tablet: {
          name: "Tablet (P)",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        tabletLandscape: {
          name: "Tablet (L)",
          styles: {
            width: "1024px",
            height: "768px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1024px",
            height: "768px",
          },
        },
        largeDesktop: {
          name: "Large Desktop",
          styles: {
            width: "1440px",
            height: "900px",
          },
        },
      },
    },
  },
};

export default preview;
