import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { colors } from "@/constants/systemDesign";

const Components = () => {
  const ComponentSection = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <section style={{ marginBottom: "48px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
        {description}
      </p>
      <div
        style={{
          padding: "24px",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
        }}
      >
        {children}
      </div>
    </section>
  );

  const VariantGrid = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        alignItems: "start",
      }}
    >
      {children}
    </div>
  );

  const VariantCard = ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div
      style={{
        padding: "16px",
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
      }}
    >
      <h4 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
        {title}
      </h4>
      {description && (
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
          {description}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );

  return (
    <div
      style={{ padding: "24px", fontFamily: "system-ui, sans-serif", maxWidth: "1000px" }}
    >
      <h1 style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "bold" }}>
        Circle Component Library
      </h1>

      <p style={{ fontSize: "16px", color: "#666", marginBottom: "48px" }}>
        A comprehensive collection of reusable UI components built with consistency,
        accessibility, and user experience in mind.
      </p>

      <ComponentSection
        title="Buttons"
        description="Interactive elements for user actions, available in multiple variants and sizes"
      >
        <VariantGrid>
          <VariantCard
            title="Variants"
            description="Different visual styles for various contexts"
          >
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </VariantCard>

          <VariantCard title="Sizes" description="Different sizes for various use cases">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🔍</Button>
          </VariantCard>

          <VariantCard title="States" description="Interactive and accessibility states">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button style={{ opacity: 0.8 }}>Hover (simulated)</Button>
            <Button style={{ outline: "2px solid #0066cc" }}>Focused (simulated)</Button>
          </VariantCard>
        </VariantGrid>
      </ComponentSection>

      <ComponentSection
        title="Color Usage Examples"
        description="How components integrate with the design system colors"
      >
        <VariantGrid>
          <VariantCard title="Chat Interface Colors">
            <div
              style={{
                padding: "12px",
                backgroundColor: colors.chat.user.background,
                color: colors.chat.user.text,
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              User message style
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: colors.chat.assistant.background.dark,
                color: colors.chat.assistant.text.dark,
                borderRadius: "8px",
              }}
            >
              Assistant message style
            </div>
          </VariantCard>

          <VariantCard title="Background Variations">
            <div
              style={{
                padding: "12px",
                backgroundColor: colors.background.sideNav,
                color: colors.text.default,
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              SideNav background
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: colors.background.modal,
                color: colors.text.default,
                borderRadius: "8px",
              }}
            >
              Modal background
            </div>
          </VariantCard>

          <VariantCard title="Interactive Elements">
            <Button
              style={{
                backgroundColor: colors.button.default,
                color: colors.text.default,
              }}
            >
              Primary Action
            </Button>
            <Button
              variant="outline"
              style={{
                borderColor: colors.brand.secondary,
                color: colors.brand.secondary,
              }}
            >
              Secondary Action
            </Button>
          </VariantCard>
        </VariantGrid>
      </ComponentSection>

      <ComponentSection
        title="Layout Components"
        description="Structural components that define the application layout"
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          <h4 style={{ fontWeight: "500", marginBottom: "12px" }}>
            Available Layout Components:
          </h4>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>
              <strong>NavBar:</strong> Fixed header navigation with responsive hamburger
              menu
            </li>
            <li>
              <strong>SideNav:</strong> Collapsible sidebar navigation for desktop and
              mobile
            </li>
            <li>
              <strong>Footer:</strong> Application footer with links and information
            </li>
            <li>
              <strong>Modal:</strong> Overlay dialogs for focused interactions
            </li>
          </ul>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Input Components"
        description="Form elements and interactive inputs for user data collection"
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          <h4 style={{ fontWeight: "500", marginBottom: "12px" }}>
            Available Input Components:
          </h4>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>
              <strong>InputChat:</strong> Specialized chat input with send functionality
            </li>
            <li>
              <strong>InputConfig:</strong> Configuration form inputs
            </li>
            <li>
              <strong>Form Controls:</strong> Standard form elements with consistent
              styling
            </li>
          </ul>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Feedback Components"
        description="Components for user feedback and communication"
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          <h4 style={{ fontWeight: "500", marginBottom: "12px" }}>
            Available Feedback Components:
          </h4>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>
              <strong>BubbleChat:</strong> Chat message bubbles with proper styling
            </li>
            <li>
              <strong>Conversation:</strong> Chat conversation containers
            </li>
            <li>
              <strong>ConversationGroup:</strong> Grouped conversation displays
            </li>
          </ul>
        </div>
      </ComponentSection>

      <div
        style={{
          marginTop: "48px",
          padding: "20px",
          backgroundColor: "#e8f4f8",
          borderRadius: "12px",
          border: "1px solid #b8e6f0",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
          🎨 Design System Benefits
        </h3>
        <ul
          style={{
            fontSize: "14px",
            color: "#555",
            paddingLeft: "20px",
            lineHeight: "1.6",
          }}
        >
          <li style={{ marginBottom: "8px" }}>
            <strong>Consistency:</strong> All components follow the same design principles
            and color system
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Accessibility:</strong> Built-in focus states, ARIA attributes, and
            keyboard navigation
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Maintainability:</strong> Centralized styling makes updates and
            changes easier
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Developer Experience:</strong> Clear documentation and examples for
            each component
          </li>
          <li>
            <strong>Performance:</strong> Optimized components with minimal bundle impact
          </li>
        </ul>
      </div>
    </div>
  );
};

const meta: Meta<typeof Components> = {
  title: "Design System (Example)/Components",
  component: Components,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete overview of all UI components in the Circle design system, showcasing variants, states, and usage examples.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllComponents: Story = {};
