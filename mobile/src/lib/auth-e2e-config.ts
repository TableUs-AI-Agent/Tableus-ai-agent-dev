export function isAuthE2EEnabled(input: {
  configFlag: boolean;
  apiUrl: string;
  demoMode: boolean;
  supabaseConfigured: boolean;
}) {
  return input.configFlag
    && input.apiUrl.startsWith("https://")
    && !input.demoMode
    && input.supabaseConfigured;
}
