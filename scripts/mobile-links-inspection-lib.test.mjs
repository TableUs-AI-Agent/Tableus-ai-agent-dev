import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  certificateRecordsFromPem,
  extractCodeSignatureCms,
  fingerprintDerCertificate,
  hasAppleProvisioningProfileSigner,
  isExactTahoeTrustDiagnostic,
  profileAuthorizesAssociatedDomain,
  selectProfileAuthorizedSigner,
} from "./mobile-links-inspection-lib.mjs";

function openssl(args) {
  const result = spawnSync("openssl", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}

function signedMachO(cms) {
  const signatureOffset = 48;
  const blobOffset = 20;
  const blobLength = 8 + cms.length;
  const superblobLength = blobOffset + blobLength;
  const executable = Buffer.alloc(signatureOffset + superblobLength);
  executable.writeUInt32LE(0xfeedfacf, 0);
  executable.writeUInt32LE(1, 16);
  executable.writeUInt32LE(0x1d, 32);
  executable.writeUInt32LE(16, 36);
  executable.writeUInt32LE(signatureOffset, 40);
  executable.writeUInt32LE(superblobLength, 44);
  executable.writeUInt32BE(0xfade0cc0, signatureOffset);
  executable.writeUInt32BE(superblobLength, signatureOffset + 4);
  executable.writeUInt32BE(1, signatureOffset + 8);
  executable.writeUInt32BE(0x10000, signatureOffset + 12);
  executable.writeUInt32BE(blobOffset, signatureOffset + 16);
  executable.writeUInt32BE(0xfade0b01, signatureOffset + blobOffset);
  executable.writeUInt32BE(blobLength, signatureOffset + blobOffset + 4);
  cms.copy(executable, signatureOffset + blobOffset + 8);
  return executable;
}

test("Tahoe trust fallback accepts only the exact two-line arm64 diagnostic", () => {
  const exact = "/tmp/TableUs.app: CSSMERR_TP_NOT_TRUSTED\nIn architecture: arm64";
  assert.equal(isExactTahoeTrustDiagnostic("26.6", exact), true);
  assert.equal(isExactTahoeTrustDiagnostic("15.6", exact), false);
  assert.equal(isExactTahoeTrustDiagnostic("26.6", `${exact}\nresource envelope is obsolete`), false);
  assert.equal(isExactTahoeTrustDiagnostic("26.6", "/tmp/TableUs.app: CSSMERR_TP_NOT_TRUSTED"), false);
});

test("extracts only the CMS signature slot from a thin arm64 Mach-O", () => {
  const cms = Buffer.from([0x30, 0x03, 0x02, 0x01, 0x01]);
  assert.deepEqual(extractCodeSignatureCms(signedMachO(cms)), cms);
  assert.throws(() => extractCodeSignatureCms(Buffer.alloc(32)), /thin 64-bit Mach-O/);
});

test("requires one Apple distribution signer authorized by the profile", () => {
  const signer = {
    fingerprint256: "AA:BB",
    issuer: "CN=Apple Worldwide Developer Relations Certification Authority",
    subject: "CN=Apple Distribution: TableUs (6MHJN5V9UJ)",
  };
  assert.equal(selectProfileAuthorizedSigner([signer], ["AA:BB"], "6MHJN5V9UJ"), signer);
  assert.throws(() => selectProfileAuthorizedSigner([signer], ["CC:DD"], "6MHJN5V9UJ"), /not uniquely authorized/);
  assert.throws(() => selectProfileAuthorizedSigner([signer, signer], ["AA:BB"], "6MHJN5V9UJ"), /exactly one CMS signer/);
  const unrelatedActualSigner = { ...signer, fingerprint256: "CC:DD", subject: "CN=Other Signer" };
  assert.throws(
    () => selectProfileAuthorizedSigner([unrelatedActualSigner], [signer.fingerprint256], "6MHJN5V9UJ"),
    /not uniquely authorized/,
  );
});

test("binds the actual CMS SignerInfo instead of a legitimate-looking extra certificate", (context) => {
  if (spawnSync("openssl", ["version"]).status !== 0) {
    context.skip("OpenSSL is unavailable");
    return;
  }
  const directory = mkdtempSync(join(tmpdir(), "tableus-cms-signer-test-"));
  try {
    const caKey = join(directory, "ca.key");
    const caCert = join(directory, "ca.pem");
    const authorizedKey = join(directory, "authorized.key");
    const authorizedCsr = join(directory, "authorized.csr");
    const authorizedCert = join(directory, "authorized.pem");
    const actualKey = join(directory, "actual.key");
    const actualCert = join(directory, "actual.pem");
    const content = join(directory, "content.txt");
    const cms = join(directory, "message.cms");
    const signerOutput = join(directory, "actual-signer.pem");
    const authorizedDer = join(directory, "authorized.der");
    openssl(["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", caKey, "-out", caCert, "-subj", "/CN=Apple Worldwide Developer Relations Certification Authority", "-days", "1"]);
    openssl(["req", "-newkey", "rsa:2048", "-nodes", "-keyout", authorizedKey, "-out", authorizedCsr, "-subj", "/CN=Apple Distribution: TableUs (6MHJN5V9UJ)"]);
    openssl(["x509", "-req", "-in", authorizedCsr, "-CA", caCert, "-CAkey", caKey, "-CAcreateserial", "-out", authorizedCert, "-days", "1"]);
    openssl(["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", actualKey, "-out", actualCert, "-subj", "/CN=Other Signer", "-days", "1"]);
    writeFileSync(content, "signed content");
    openssl(["cms", "-sign", "-binary", "-in", content, "-signer", actualCert, "-inkey", actualKey, "-certfile", authorizedCert, "-outform", "DER", "-out", cms]);
    openssl(["cms", "-verify", "-inform", "DER", "-in", cms, "-noverify", "-no_content_verify", "-content", "/dev/null", "-signer", signerOutput, "-out", "/dev/null"]);
    openssl(["x509", "-in", authorizedCert, "-outform", "DER", "-out", authorizedDer]);
    const actualSigners = certificateRecordsFromPem(readFileSync(signerOutput, "utf8"));
    const authorizedFingerprint = fingerprintDerCertificate(readFileSync(authorizedDer).toString("base64"));
    assert.equal(actualSigners.length, 1);
    assert.match(actualSigners[0].subject, /Other Signer/);
    assert.throws(
      () => selectProfileAuthorizedSigner(actualSigners, [authorizedFingerprint], "6MHJN5V9UJ"),
      /not uniquely authorized/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("requires an Apple provisioning-profile CMS signer and exact domain authorization", () => {
  const appleProfileSigner = {
    issuer: "CN=Apple Worldwide Developer Relations Certification Authority",
    subject: "CN=Apple iPhone OS Provisioning Profile Signing",
  };
  assert.equal(hasAppleProvisioningProfileSigner([appleProfileSigner]), true);
  assert.equal(hasAppleProvisioningProfileSigner([{ subject: "CN=Unrelated Signer", issuer: "CN=Apple Root CA" }]), false);
  assert.equal(hasAppleProvisioningProfileSigner([appleProfileSigner, appleProfileSigner]), false);
  assert.equal(profileAuthorizesAssociatedDomain(["applinks:links.table-us.com"], "links.table-us.com"), true);
  assert.equal(profileAuthorizesAssociatedDomain(["*"], "links.table-us.com"), true);
  assert.equal(profileAuthorizesAssociatedDomain(["applinks:other.example"], "links.table-us.com"), false);
});
