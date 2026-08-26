import { notFound } from "next/navigation";

import { TelemetryTestClient } from "./telemetry-client";

export default function TelemetryTestPage() {
  if (process.env.NEXT_PUBLIC_TELEMETRY_E2E !== "true" || process.env.NEXT_PUBLIC_TELEMETRY_MODE !== "staging") notFound();
  return <TelemetryTestClient />;
}
