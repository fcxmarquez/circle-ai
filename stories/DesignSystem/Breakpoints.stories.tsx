import type { Meta, StoryObj } from "@storybook/react";
import { breakpoints } from "@/constants/systemDesign";

const Breakpoints = () => {
  const BreakpointCard = ({
    name,
    value,
    description,
    examples,
  }: {
    name: string;
    value: string;
    description: string;
    examples: string[];
  }) => (
    <div
      style={{
        marginBottom: "24px",
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginRight: "12px",
            textTransform: "capitalize",
          }}
        >
          {name}
        </h3>
        <code
          style={{
            fontSize: "14px",
            fontFamily: "Monaco, Menlo, monospace",
            backgroundColor: "#e8e8e8",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {value}
        </code>
      </div>

      <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
        {description}
      </p>

      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
          Common Use Cases:
        </h4>
        <ul style={{ fontSize: "13px", color: "#777", paddingLeft: "20px" }}>
          {examples.map((example, index) => (
            <li key={index} style={{ marginBottom: "4px" }}>
              {example}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#ddd",
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: getBreakpointPercentage(value),
            height: "100%",
            backgroundColor: getBreakpointColor(name),
            borderRadius: "4px",
          }}
        />
      </div>
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
        Visual representation of viewport width
      </div>
    </div>
  );

  const getBreakpointPercentage = (value: string): string => {
    const numValue = parseInt(value);
    const maxWidth = 1440; // largeDesktop
    return `${Math.min((numValue / maxWidth) * 100, 100)}%`;
  };

  const getBreakpointColor = (name: string): string => {
    const colors: Record<string, string> = {
      mobile: "#ff6b6b",
      tablet: "#4ecdc4",
      desktop: "#45b7d1",
      largeDesktop: "#96ceb4",
    };
    return colors[name] || "#999";
  };

  const ResponsiveDemo = () => (
    <div
      style={{
        marginTop: "32px",
        padding: "20px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>
        Responsive Layout Demo
      </h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
        Resize your browser window to see how content adapts at different breakpoints.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {Object.entries(breakpoints).map(([name, value]) => (
          <div
            key={name}
            style={{
              padding: "12px",
              backgroundColor: getBreakpointColor(name),
              color: "white",
              borderRadius: "6px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {name}: {value}
          </div>
        ))}
      </div>

      <div style={{ fontSize: "12px", color: "#888" }}>
        Current viewport: <span id="current-width">Resize to see</span>
      </div>
    </div>
  );

  return (
    <div
      style={{ padding: "24px", fontFamily: "system-ui, sans-serif", maxWidth: "800px" }}
    >
      <h1 style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "bold" }}>
        Circle Responsive Breakpoints
      </h1>

      <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>
        Our responsive design system uses these breakpoints to ensure optimal user
        experience across all device sizes.
      </p>

      <BreakpointCard
        name="mobile"
        value={breakpoints.mobile}
        description="Small mobile devices and phones in portrait orientation"
        examples={[
          "Single column layouts",
          "Stacked navigation",
          "Touch-optimized buttons",
          "Simplified interfaces",
        ]}
      />

      <BreakpointCard
        name="tablet"
        value={breakpoints.tablet}
        description="Tablets and large phones in landscape, small laptops"
        examples={[
          "Two-column layouts",
          "Collapsible sidebars",
          "Medium-sized touch targets",
          "Adaptive navigation",
        ]}
      />

      <BreakpointCard
        name="desktop"
        value={breakpoints.desktop}
        description="Standard desktop and laptop screens"
        examples={[
          "Multi-column layouts",
          "Persistent sidebars",
          "Hover interactions",
          "Full navigation menus",
        ]}
      />

      <BreakpointCard
        name="largeDesktop"
        value={breakpoints.largeDesktop}
        description="Large desktop monitors and high-resolution displays"
        examples={[
          "Wide layouts with margins",
          "Multiple content areas",
          "Enhanced spacing",
          "Rich interactive elements",
        ]}
      />

      <ResponsiveDemo />

      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          backgroundColor: "#e8f4f8",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
          💡 Implementation Tips
        </h3>
        <ul style={{ fontSize: "14px", color: "#555", paddingLeft: "20px" }}>
          <li style={{ marginBottom: "4px" }}>
            Use mobile-first approach with min-width media queries
          </li>
          <li style={{ marginBottom: "4px" }}>
            Test layouts at breakpoint boundaries (±1px)
          </li>
          <li style={{ marginBottom: "4px" }}>
            Consider content hierarchy changes at each breakpoint
          </li>
          <li style={{ marginBottom: "4px" }}>
            Ensure touch targets are at least 44px on mobile
          </li>
        </ul>
      </div>
    </div>
  );
};

const meta: Meta<typeof Breakpoints> = {
  title: "Design System (Example)/Breakpoints",
  component: Breakpoints,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Responsive breakpoint system defining how the Circle interface adapts across different screen sizes and devices.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllBreakpoints: Story = {};
