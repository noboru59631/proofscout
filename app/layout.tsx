import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofScout — Evidence before conviction",
  description: "Adversarial research powered by Nemotron on Nebius."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
