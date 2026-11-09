import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StudioLayl from "../src/components/StudioLayl";
import "../src/studio-layl.css";
ReactDOM.createRoot(document.getElementById("root")!).render(<QueryClientProvider client={new QueryClient()}><StudioLayl /></QueryClientProvider>);
