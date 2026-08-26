"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

import { captureTelemetry } from "../../lib/telemetry";

export function TelemetryTestClient() {
  const [status, setStatus] = useState("Telemetry checks not sent");
  const send = () => {
    const analyticsAccepted = captureTelemetry("telemetry_e2e", { component: "web" });
    Sentry.captureException(new Error("TableUs sanitized telemetry canary"));
    setStatus(analyticsAccepted ? "Telemetry checks sent" : "Telemetry is still starting. Try again.");
  };
  return <main className="mx-auto max-w-xl px-6 py-20"><h1>Staging telemetry check</h1><p>This sends one anonymous allowlisted event and one sanitized handled error. It never displays credentials or private product data.</p><button type="button" onClick={send}>Send sanitized telemetry checks</button><p role="status">{status}</p></main>;
}
