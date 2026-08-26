export function isTelemetryE2EEnabled(input: {
  configFlag: boolean;
  apiUrl: string;
  demoMode: boolean;
  telemetryMode: string | undefined;
  supabaseConfigured: boolean;
}) {
  return input.configFlag
    && input.apiUrl.startsWith("https://")
    && !input.demoMode
    && input.telemetryMode === "staging"
    && input.supabaseConfigured;
}
