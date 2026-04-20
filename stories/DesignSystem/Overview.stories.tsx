import type { Meta, StoryObj } from "@storybook/react";
import { colors, breakpoints } from "@/constants/systemDesign";

const Overview = () => {
  const FeatureCard = ({
    icon,
    title,
    description,
    link,
  }: {
    icon: string;
    title: string;
    description: string;
    link: string;
  }) => (
    <div
      style={{
        padding: "24px",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "16px" }}>{icon}</div>
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "#666",
          lineHeight: "1.5",
          marginBottom: "12px",
        }}
      >
        {description}
      </p>
      <div
        style={{
          fontSize: "12px",
          color: colors.brand.secondary,
          fontWeight: "500",
          textDecoration: "underline",
        }}
      >
        View {link} →
      </div>
    </div>
  );

  const StatCard = ({
    number,
    label,
    description,
  }: {
    number: string;
    label: string;
    description: string;
  }) => (
    <div style={{ textAlign: "center", padding: "16px" }}>
      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: colors.brand.secondary,
          marginBottom: "8px",
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", color: "#666" }}>{description}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Hero Section */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.brand.default} 0%, ${colors.brand.secondary} 100%)`,
          color: "white",
          padding: "64px 32px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "16px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Circle Design System
        </h1>
        <p
          style={{
            fontSize: "20px",
            opacity: 0.9,
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          A comprehensive design system that ensures consistency, accessibility, and
          exceptional user experience across the Circle platform.
        </p>
      </div>

      {/* Stats Section */}
      <div
        style={{
          padding: "48px 32px",
          backgroundColor: "#fafafa",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <StatCard
            number="50+"
            label="Color Tokens"
            description="Semantic color system"
          />
          <StatCard
            number="4"
            label="Breakpoints"
            description="Responsive design points"
          />
          <StatCard number="15+" label="Components" description="Reusable UI elements" />
          <StatCard number="100%" label="Accessible" description="WCAG 2.1 compliant" />
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: "64px 32px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          Explore the Design System
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          <FeatureCard
            icon="🎨"
            title="Colors"
            description="A carefully crafted color palette with semantic naming, dark/light variants, and accessibility considerations for all interface elements."
            link="Colors"
          />

          <FeatureCard
            icon="📝"
            title="Typography"
            description="Consistent text styles, hierarchies, and formatting guidelines that ensure readability and visual harmony across the application."
            link="Typography"
          />

          <FeatureCard
            icon="📱"
            title="Breakpoints"
            description="Responsive design system with mobile-first approach, ensuring optimal experience across all device sizes and orientations."
            link="Breakpoints"
          />

          <FeatureCard
            icon="🧩"
            title="Components"
            description="Reusable UI components with consistent styling, multiple variants, and built-in accessibility features for rapid development."
            link="Components"
          />
        </div>
      </div>

      {/* Principles Section */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "64px 32px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            Design Principles
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "32px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  color: colors.brand.secondary,
                }}
              >
                ♿
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
                Accessibility First
              </h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                Every component is built with accessibility in mind, ensuring inclusive
                experiences for all users regardless of their abilities.
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  color: colors.brand.secondary,
                }}
              >
                🎯
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
                Consistency
              </h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                Unified visual language and interaction patterns create predictable and
                intuitive user experiences across the platform.
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  color: colors.brand.secondary,
                }}
              >
                ⚡
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
                Performance
              </h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                Optimized components and efficient styling ensure fast loading times and
                smooth interactions on all devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div
        style={{
          padding: "64px 32px",
          backgroundColor: "white",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            Getting Started
          </h2>

          <p
            style={{
              fontSize: "16px",
              color: "#666",
              lineHeight: "1.6",
              marginBottom: "32px",
            }}
          >
            Ready to build with the Circle design system? Explore each section to
            understand the components, patterns, and guidelines that will help you create
            consistent and beautiful user interfaces.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                1. Explore Colors
              </h4>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Start with the color system to understand the visual foundation
              </p>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                2. Review Typography
              </h4>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Learn about text styles and hierarchy guidelines
              </p>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                3. Study Components
              </h4>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Discover available components and their usage patterns
              </p>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                4. Build Responsively
              </h4>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Use breakpoints to create adaptive layouts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof Overview> = {
  title: "Design System (Example)/Overview",
  component: Overview,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Welcome to the Circle Design System - a comprehensive guide to building consistent, accessible, and beautiful user interfaces.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction: Story = {};
