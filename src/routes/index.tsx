import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StudioLayl from "@/components/StudioLayl";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ليل الأمسيات | زفات وشيلات الخليج والسعودية" },
      { name: "description", content: "استوديو ليل — زفات وشيلات بتفاصيل تصنع لحظتكم." },
      { property: "og:title", content: "ليل الأمسيات | زفات وشيلات الخليج والسعودية" },
      { property: "og:description", content: "استوديو ليل — زفات وشيلات بتفاصيل تصنع لحظتكم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b0b0d" },
    ],
  }),
  component: Index,
});

// The studio UI reads saved preferences from the browser, so render it after hydration.
function Index() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? <StudioLayl /> : <div style={{ minHeight: "100vh", background: "#0b0b0d" }} />;
}
