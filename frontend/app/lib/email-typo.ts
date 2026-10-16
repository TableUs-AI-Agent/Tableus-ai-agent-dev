/**
 * A mistyped mail domain means the sign-in code never arrives, so catch the
 * common slips (gmail.cm, gmial.com, hotmail.co) and offer the fix.
 */
const DOMAINS = ["gmail.com", "icloud.com", "yahoo.com", "hotmail.com", "outlook.com", "me.com", "live.com", "aol.com"];
const SLIPPED_COM = ["c", "co", "cm", "om", "con", "comm", "cmo", "ocm", "vom", "xom"];
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "icoud.com": "icloud.com",
  "iclod.com": "icloud.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

export function suggestEmail(address: string): string | null {
  const at = address.lastIndexOf("@");
  if (at < 1) return null;
  const local = address.slice(0, at);
  const domain = address.slice(at + 1).toLowerCase();
  if (DOMAINS.includes(domain)) return null;
  // Otherwise the right provider with a slipped ".com": gmail.cm, gmail.co, gmail.comm.
  const [name, ending] = [domain.slice(0, domain.indexOf(".")), domain.slice(domain.indexOf(".") + 1)];
  const fixed = TYPOS[domain]
    ?? (SLIPPED_COM.includes(ending) ? DOMAINS.find((known) => known === `${name}.com`) : undefined);
  return fixed ? `${local}@${fixed}` : null;
}
