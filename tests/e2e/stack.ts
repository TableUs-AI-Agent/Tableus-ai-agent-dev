/** Ports for the local stack the end-to-end tests start, away from the usual dev servers. */
export const webPort = Number(process.env.E2E_WEB_PORT ?? 3100);
export const apiPort = Number(process.env.E2E_API_PORT ?? 8100);
export const apiOrigin = `http://127.0.0.1:${apiPort}`;
