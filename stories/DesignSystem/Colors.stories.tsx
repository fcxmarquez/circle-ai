import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "@/constants/systemDesign";

const ColorPalette = () => {
  const ColorSwatch = ({
    color,
    name,
    description,
  }: {
    color: string;
    name: string;
    description?: string;
  }) => (
    <div
      style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: color,
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
      <div>
        <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
          {name}
        </div>
        <div style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>
          {color}
        </div>
        {description ? (
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );

  const ColorSection = ({
    title,
    colorObj,
    prefix = "",
  }: {
    title: string;
    colorObj: Record<string, any>;
    prefix?: string;
  }) => (
    <div style={{ marginBottom: "32px" }}>
      <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "bold" }}>
        {title}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {Object.entries(colorObj).map(([key, value]) => {
          if (typeof value === "string") {
            return (
              <ColorSwatch
                key={key}
                color={value}
                name={prefix ? `${prefix}.${key}` : key}
                description={getColorDescription(key)}
              />
            );
          } else if (typeof value === "object" && value !== null) {
            return (
              <div key={key}>
                <h4 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                  {key}
                </h4>
                {Object.entries(value).map(([subKey, subValue]) => {
                  if (typeof subValue === "string") {
                    return (
                      <ColorSwatch
                        key={`${key}-${subKey}`}
                        color={subValue}
                        name={`${prefix ? `${prefix}.` : ""}${key}.${subKey}`}
                      />
                    );
                  } else if (typeof subValue === "object" && subValue !== null) {
                    return (
                      <div
                        key={`${key}-${subKey}`}
                        style={{ marginLeft: "16px", marginBottom: "8px" }}
                      >
                        <h5
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            marginBottom: "8px",
                          }}
                        >
                          {subKey}
                        </h5>
                        {Object.entries(subValue).map(([nestedKey, nestedValue]) => (
                          <ColorSwatch
                            key={`${key}-${subKey}-${nestedKey}`}
                            color={nestedValue as string}
                            name={`${prefix ? `${prefix}.` : ""}${key}.${subKey}.${nestedKey}`}
                          />
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );

  const getColorDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      default: "Primary brand color",
      secondary: "Secondary accent color",
      hover: "Interactive hover state",
      light: "Light theme variant",
      dark: "Dark theme variant",
    };
    return descriptions[key];
  };

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "bold" }}>
        Circle Color System
      </h1>

      <ColorSection title="Brand Colors" colorObj={colors.brand} prefix="brand" />
      <ColorSection title="Text Colors" colorObj={colors.text} prefix="text" />
      <ColorSection
        title="Background Colors"
        colorObj={colors.background}
        prefix="background"
      />
      <ColorSection title="Button Colors" colorObj={colors.button} prefix="button" />
      <ColorSection title="Chat Colors" colorObj={colors.chat} prefix="chat" />
      <ColorSection title="Header Colors" colorObj={colors.header} prefix="header" />
    </div>
  );
};

const meta: Meta<typeof ColorPalette> = {
  title: "Design System (Example)/Colors",
  component: ColorPalette,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The complete color palette for the Circle design system, including brand colors, text colors, backgrounds, and component-specific colors.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllColors: Story = {};
