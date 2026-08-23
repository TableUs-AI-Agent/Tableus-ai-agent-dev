const fingerprintPattern = /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/;

export function parseAndroidFingerprints(value: string): string[] {
  const fingerprints = value
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
  if (!fingerprints.length || fingerprints.some((item) => !fingerprintPattern.test(item))) {
    throw new Error("ANDROID_SHA256_CERT_FINGERPRINTS is missing or invalid");
  }
  return [...new Set(fingerprints)];
}

export function buildAppleAssociation(teamId: string, bundleId: string) {
  if (!/^[A-Z0-9]{10}$/.test(teamId)) throw new Error("APPLE_TEAM_ID is missing or invalid");
  if (!/^[A-Za-z0-9.-]+$/.test(bundleId)) throw new Error("IOS_BUNDLE_IDENTIFIER is invalid");
  const appId = `${teamId}.${bundleId}`;
  return {
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [appId],
          components: [{ "/": "/join/*" }, { "/": "/auth" }],
        },
      ],
    },
  };
}

export function buildAndroidAssociation(packageName: string, fingerprints: string[]) {
  if (!/^[A-Za-z][A-Za-z0-9_.]+$/.test(packageName)) {
    throw new Error("ANDROID_PACKAGE_NAME is invalid");
  }
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];
}
