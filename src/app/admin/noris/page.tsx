import type { Metadata } from "next";
import NorisLinkPage from "@/features/admin/noris/NorisLinkPage";

export const metadata: Metadata = {
  title: "NORIS: зв'язок компаній з Oracle",
};

export default function Page() {
  return <NorisLinkPage />;
}
