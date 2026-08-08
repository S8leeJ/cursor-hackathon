import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SWEnder — find your compile-time match",
  description: "Match college SEs by AI coding fingerprint.",
};

/** Clerk inherits the editor palette so auth doesn't look bolted on. */
const clerkAppearance = {
  variables: {
    colorPrimary: "#ff79c6",
    colorBackground: "#0f131b",
    colorText: "#e8eef7",
    colorTextSecondary: "#a6b2c4",
    colorInputBackground: "#06080e",
    colorInputText: "#e8eef7",
    colorDanger: "#ff6b6b",
    colorSuccess: "#58d977",
    colorWarning: "#ffb86c",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-panel border border-rule shadow-none",
    formButtonPrimary:
      "bg-kw text-editor font-semibold normal-case tracking-normal hover:brightness-110",
    footer: "bg-transparent",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jetbrains.variable} h-full`}>
      <body className="canvas flex min-h-dvh flex-col">
        <ClerkProvider appearance={clerkAppearance}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
