import { Metadata } from "next";
import DashboardContent from "@/features/messages/components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardContent />;
}


