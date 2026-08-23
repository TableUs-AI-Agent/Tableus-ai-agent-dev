import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function shareAccountExport(data: unknown, now = new Date()) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("File sharing is not available on this device.");
  }
  const filename = `tableus-data-${now.toISOString().slice(0, 10)}.json`;
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  try {
    file.write(JSON.stringify(data, null, 2));
    await Sharing.shareAsync(file.uri, {
      dialogTitle: "Share your TableUs data export",
      mimeType: "application/json",
      UTI: "public.json",
    });
  } finally {
    if (file.exists) file.delete();
  }
}
