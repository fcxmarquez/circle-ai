import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalShortcuts } from "@/components/global-shortcuts";
import { ModalRender } from "@/components/modals/ModalRender";
import { ShadcnModalRender } from "@/components/modals/shadcn-modal-render";
import { ModelSelector } from "@/components/model-selector";
import { NavActions } from "@/components/nav-actions";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  display: "swap",
  variable: "--font-primary",
});

export const metadata: Metadata = {
  title: "EnkiAI",
  description: "AI-powered chat application",
};

/**
 * Defines the root layout for the Next.js application with a modern sidebar layout.
 *
 * Wraps all page content with the Inter font, global providers, sidebar navigation, and header.
 *
 * @param children - The page content to be rendered within the layout.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} relative`}>
        <Providers>
          <ModalRender />
          <Toaster />
          <SidebarProvider>
            <GlobalShortcuts />
            <ShadcnModalRender />
            <AppSidebar />
            <SidebarInset className="relative min-h-dvh max-h-dvh h-full overflow-y-hidden overflow-x-hidden">
              <header className="flex h-14 sticky top-0 z-10 bg-background/50 backdrop-blur-lg shrink-0 items-center gap-2 overflow-hidden max-w-full">
                <div className="flex flex-1 items-center gap-2 px-3 min-w-0">
                  <SidebarTrigger className="shrink-0" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4 shrink-0"
                  />
                  <ModelSelector />
                </div>
                <div className="ml-auto px-3 shrink-0">
                  <NavActions />
                </div>
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
