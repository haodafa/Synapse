import type { Metadata } from "next";
import { SynapseLanding } from "@/features/landing/components/synapse-landing";

export const metadata: Metadata = {
  title: "Homepage",
  description:
    "Synapse — open-source platform that turns coding agents into real teammates. Assign tasks, track progress, compound skills.",
  openGraph: {
    title: "Synapse — Project Management for Human + Agent Teams",
    description:
      "Manage your human + agent workforce in one place.",
    url: "/homepage",
  },
  alternates: {
    canonical: "/homepage",
  },
};

export default function HomepagePage() {
  return <SynapseLanding />;
}
