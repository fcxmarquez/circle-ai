import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DismissibleAlert } from "@/components/ui/dismissible-alert";

const meta: Meta<typeof DismissibleAlert> = {
  title: "components/ui/DismissibleAlert",
  component: DismissibleAlert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An alert banner with optional title, description, icon, dismiss button, and action slot.",
      },
    },
  },
  argTypes: {
    title: {
      description: "Heading text for the alert",
      control: { type: "text" },
    },
    description: {
      description: "Body text for the alert",
      control: { type: "text" },
    },
    dismissLabel: {
      description: "Accessible label for the dismiss button",
      control: { type: "text" },
    },
    onDismiss: {
      description: "When provided, renders a close (×) button",
      action: "dismissed",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DismissibleAlert>;

export const Default: Story = {
  args: {
    title: "Provider status unavailable",
    description: "Environment API keys could not be checked.",
  },
};

export const WithDismiss: Story = {
  args: {
    title: "Provider status unavailable",
    description: "Environment API keys could not be checked.",
    onDismiss: () => {},
  },
};

export const WithIcon: Story = {
  args: {
    title: "Provider status unavailable",
    description: "Environment API keys could not be checked.",
    icon: <AlertCircle className="text-destructive" />,
    onDismiss: () => {},
  },
};

export const WithAction: Story = {
  args: {
    title: "Provider status unavailable",
    description: "Environment API keys could not be checked.",
    icon: <AlertCircle className="text-destructive" />,
    onDismiss: () => {},
    action: (
      <Button size="sm" type="button" variant="outline">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    ),
  },
};

export const CustomDismissLabel: Story = {
  args: {
    title: "Provider status unavailable",
    description: "Environment API keys could not be checked.",
    dismissLabel: "Close provider alert",
    onDismiss: () => {},
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Something went wrong",
  },
};

export const DescriptionOnly: Story = {
  args: {
    description: "A background process failed silently.",
  },
};
