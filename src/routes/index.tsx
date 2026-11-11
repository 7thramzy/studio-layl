import { createFileRoute } from "@tanstack/react-router";
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

function Index() {
  return <StudioLayl />;
}
