import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { EnvProvidersStatusErrorAlert } from "@/components/providers/EnvProvidersStatusErrorAlert";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof EnvProvidersStatusErrorAlert> = {
  title: "components/providers/ResolvedChatConfigProvider/ErrorAlert",
  component: EnvProvidersStatusErrorAlert,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EnvProvidersStatusErrorAlert>;

function ErrorAlertPreview() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    window.setTimeout(() => setIsRetrying(false), 1200);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {isDismissed ? (
        <Button onClick={() => setIsDismissed(false)} variant="outline">
          Show alert
        </Button>
      ) : (
        <EnvProvidersStatusErrorAlert
          isRetrying={isRetrying}
          onDismiss={() => setIsDismissed(true)}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <ErrorAlertPreview />,
};

export const Retrying: Story = {
  args: {
    isRetrying: true,
    onDismiss: () => {},
    onRetry: () => {},
  },
  render: (args) => (
    <div className="min-h-screen bg-background p-6">
      <EnvProvidersStatusErrorAlert {...args} />
    </div>
  ),
};
