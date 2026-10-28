/**
 * Shared Cryptographic & PII Protection Primitives (Web Crypto API - Edge Compatible)
 * Complies with Decree 13/2023/ND-CP (Cross-cutting X3) & Immutable Audit Seals (G1, G6)
 */

/**
 * Computes an immutable SHA-256 hex digest using standard Web Crypto API.
 */
export async function calculateSha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a farmer's phone number with a mandatory secret salt (PII_HASH_SALT from root .env).
 * Never stores or logs plaintext phone numbers in compliance with Decree 13/2023/ND-CP.
 */
export async function hashFarmerPhonePii(phone: string, secretSalt: string): Promise<string> {
  const normalizedSalt = secretSalt?.trim();
  if (!normalizedSalt || normalizedSalt.length < 16) {
    throw new Error(
      'Missing or weak PII_HASH_SALT: Secret salt (>= 16 chars) must be provided via root .env or Worker secret bindings.'
    );
  }
  const normalizedPhone = phone.replace(/\D+/g, '');
  if (normalizedPhone.length < 8) {
    throw new Error('Invalid phone number format for PII hashing.');
  }
  return calculateSha256(`agridata_pii_v1:${normalizedSalt}:${normalizedPhone}`);
}

