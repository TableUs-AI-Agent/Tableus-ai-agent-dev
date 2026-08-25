import { X509Certificate } from "node:crypto";

const MH_MAGIC_64 = 0xfeedfacf;
const LC_CODE_SIGNATURE = 0x1d;
const CSMAGIC_EMBEDDED_SIGNATURE = 0xfade0cc0;
const CSSLOT_SIGNATURESLOT = 0x10000;
const CSMAGIC_BLOBWRAPPER = 0xfade0b01;

function requireRange(buffer, offset, length, label) {
  if (offset < 0 || length < 0 || offset + length > buffer.length) {
    throw new Error(`Malformed ${label}.`);
  }
}

export function isExactTahoeTrustDiagnostic(macosVersion, diagnostic) {
  if (!macosVersion.startsWith("26.")) return false;
  const lines = diagnostic.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.length === 2
    && lines[0].endsWith(": CSSMERR_TP_NOT_TRUSTED")
    && lines[1] === "In architecture: arm64";
}

export function extractCodeSignatureCms(executable) {
  requireRange(executable, 0, 32, "Mach-O header");
  if (executable.readUInt32LE(0) !== MH_MAGIC_64) {
    throw new Error("iOS executable is not a thin 64-bit Mach-O binary.");
  }
  const commandCount = executable.readUInt32LE(16);
  let commandOffset = 32;
  let signatureOffset;
  let signatureSize;
  for (let index = 0; index < commandCount; index += 1) {
    requireRange(executable, commandOffset, 8, "Mach-O load command");
    const command = executable.readUInt32LE(commandOffset);
    const commandSize = executable.readUInt32LE(commandOffset + 4);
    requireRange(executable, commandOffset, commandSize, "Mach-O load command");
    if (command === LC_CODE_SIGNATURE) {
      requireRange(executable, commandOffset, 16, "code-signature command");
      signatureOffset = executable.readUInt32LE(commandOffset + 8);
      signatureSize = executable.readUInt32LE(commandOffset + 12);
      break;
    }
    commandOffset += commandSize;
  }
  if (signatureOffset === undefined || signatureSize === undefined) {
    throw new Error("iOS executable has no embedded code signature.");
  }
  requireRange(executable, signatureOffset, signatureSize, "embedded code signature");
  if (executable.readUInt32BE(signatureOffset) !== CSMAGIC_EMBEDDED_SIGNATURE) {
    throw new Error("iOS executable has an invalid code-signature superblob.");
  }
  const superblobLength = executable.readUInt32BE(signatureOffset + 4);
  const slotCount = executable.readUInt32BE(signatureOffset + 8);
  requireRange(executable, signatureOffset, superblobLength, "code-signature superblob");
  requireRange(executable, signatureOffset + 12, slotCount * 8, "code-signature index");
  for (let index = 0; index < slotCount; index += 1) {
    const entryOffset = signatureOffset + 12 + index * 8;
    if (executable.readUInt32BE(entryOffset) !== CSSLOT_SIGNATURESLOT) continue;
    const blobOffset = signatureOffset + executable.readUInt32BE(entryOffset + 4);
    requireRange(executable, blobOffset, 8, "CMS signature blob");
    if (executable.readUInt32BE(blobOffset) !== CSMAGIC_BLOBWRAPPER) {
      throw new Error("iOS executable has an invalid CMS signature wrapper.");
    }
    const blobLength = executable.readUInt32BE(blobOffset + 4);
    requireRange(executable, blobOffset, blobLength, "CMS signature blob");
    return executable.subarray(blobOffset + 8, blobOffset + blobLength);
  }
  throw new Error("iOS executable has no CMS signature slot.");
}

export function certificateRecordsFromPem(pem) {
  const blocks = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) ?? [];
  return blocks.map((block) => {
    const certificate = new X509Certificate(block);
    return {
      fingerprint256: certificate.fingerprint256,
      issuer: certificate.issuer,
      subject: certificate.subject,
    };
  });
}

export function fingerprintDerCertificate(base64Der) {
  return new X509Certificate(Buffer.from(base64Der, "base64")).fingerprint256;
}

export function selectProfileAuthorizedSigner(certificates, profileFingerprints, teamId) {
  if (certificates.length !== 1) {
    throw new Error("App code signature must have exactly one CMS signer.");
  }
  const matches = certificates.filter((certificate) => (
    profileFingerprints.includes(certificate.fingerprint256)
    && certificate.subject.includes(teamId)
    && /(?:Apple|iPhone) Distribution:/i.test(certificate.subject)
    && /Apple Worldwide Developer Relations/i.test(certificate.issuer)
  ));
  if (matches.length !== 1) {
    throw new Error("App signing certificate is not uniquely authorized by the provisioning profile.");
  }
  return matches[0];
}

export function hasAppleProvisioningProfileSigner(certificates) {
  return certificates.length === 1
    && /Apple.*Provisioning Profile Signing/i.test(certificates[0].subject)
    && /Apple/i.test(certificates[0].issuer);
}

export function profileAuthorizesAssociatedDomain(domains, host) {
  return domains.includes("*") || domains.includes(`applinks:${host}`);
}
