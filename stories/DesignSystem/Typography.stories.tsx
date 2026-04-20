import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "@/constants/systemDesign";

const Typography = () => {
  const TextExample = ({
    tag,
    size,
    weight,
    color,
    description,
    children,
  }: {
    tag: string;
    size: string;
    weight: string;
    color: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div
      style={{
        marginBottom: "32px",
        padding: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          fontSize: "12px",
          color: "#666",
          fontFamily: "monospace",
        }}
      >
        {tag} • {size} • {weight} • {color}
      </div>
      <div style={{ marginBottom: "8px", fontSize: "14px", color: "#888" }}>
        {description}
      </div>
      <div
        style={{ fontSize: size, fontWeight: weight, color: color, lineHeight: "1.5" }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div
      style={{ padding: "24px", fontFamily: "system-ui, sans-serif", maxWidth: "800px" }}
    >
      <h1 style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "bold" }}>
        Circle Typography System
      </h1>

      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
          Headings
        </h2>

        <TextExample
          tag="h1"
          size="32px"
          weight="bold"
          color={colors.text.default}
          description="Main page titles and primary headings"
        >
          Main Heading (H1)
        </TextExample>

        <TextExample
          tag="h2"
          size="24px"
          weight="600"
          color={colors.text.default}
          description="Section headings and secondary titles"
        >
          Section Heading (H2)
        </TextExample>

        <TextExample
          tag="h3"
          size="20px"
          weight="600"
          color={colors.text.default}
          description="Subsection headings"
        >
          Subsection Heading (H3)
        </TextExample>

        <TextExample
          tag="h4"
          size="18px"
          weight="500"
          color={colors.text.default}
          description="Component titles and smaller headings"
        >
          Component Heading (H4)
        </TextExample>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
          Body Text
        </h2>

        <TextExample
          tag="p"
          size="16px"
          weight="400"
          color={colors.text.default}
          description="Primary body text for main content"
        >
          This is the primary body text used for main content. It should be highly
          readable and comfortable for extended reading sessions. The color provides good
          contrast against dark backgrounds.
        </TextExample>

        <TextExample
          tag="p"
          size="16px"
          weight="400"
          color={colors.text.paragraph}
          description="Secondary body text for supporting content"
        >
          This is secondary body text used for supporting content, descriptions, and less
          prominent information. It uses a lighter color to create visual hierarchy.
        </TextExample>

        <TextExample
          tag="p"
          size="14px"
          weight="400"
          color={colors.text.paragraph}
          description="Small body text for captions and metadata"
        >
          Small body text used for captions, metadata, timestamps, and other supplementary
          information.
        </TextExample>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
          Interactive Text
        </h2>

        <TextExample
          tag="button"
          size="16px"
          weight="500"
          color={colors.chat.user.text}
          description="Button text and call-to-action labels"
        >
          Button Text
        </TextExample>

        <TextExample
          tag="a"
          size="16px"
          weight="400"
          color={colors.brand.secondary}
          description="Links and interactive text elements"
        >
          Link Text (hover and focus states)
        </TextExample>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
          Chat Interface
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: colors.chat.user.background,
              color: colors.chat.user.text,
              borderRadius: "12px",
              marginBottom: "8px",
              maxWidth: "70%",
              marginLeft: "auto",
            }}
          >
            User message text appears like this with high contrast for readability.
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: colors.chat.assistant.background.dark,
              color: colors.chat.assistant.text.dark,
              borderRadius: "12px",
              marginBottom: "8px",
              maxWidth: "70%",
            }}
          >
            Assistant response text uses these colors for optimal readability in the chat
            interface.
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
          Code and Monospace
        </h2>

        <TextExample
          tag="code"
          size="14px"
          weight="400"
          color={colors.text.default}
          description="Inline code and technical text"
        >
          <code
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              backgroundColor: colors.background.input.dark,
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            const example = "inline code";
          </code>
        </TextExample>
      </section>
    </div>
  );
};

const meta: Meta<typeof Typography> = {
  title: "Design System (Example)/Typography",
  component: Typography,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Typography system showcasing all text styles, sizes, weights, and colors used throughout the Circle application.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTypography: Story = {};
