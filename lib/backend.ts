export const SUPABASE_URL = "https://rtexlmnivcfksmplsfno.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uKlz5pFmnxytCLVGZOOB-w_qvkTluia";
export const PRODUCT_CODE = "ARUNIKA";

async function postFunction(name: string, body: unknown, token?: string) {
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_PUBLISHABLE_KEY,
  };
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ ok:false, code:"INVALID_RESPONSE" }));
  if (!res.ok && data?.ok !== false) throw new Error(data?.message || data?.code || "REQUEST_FAILED");
  return data;
}

export async function purchasePublic(action: string, payload: Record<string,unknown> = {}) {
  return postFunction("purchase-public", { action, productCode: PRODUCT_CODE, ...payload });
}

export async function adminLogin(pin: string) {
  return postFunction("admin-login", { pin, productCode: PRODUCT_CODE });
}

export async function adminOrders(token: string, action: string, payload: Record<string,unknown> = {}) {
  return postFunction("admin-orders", { action, productCode: PRODUCT_CODE, ...payload }, token);
}

export async function adminLicenses(token: string, action: string, payload: Record<string,unknown> = {}) {
  return postFunction("admin-license", { action, productCode: PRODUCT_CODE, ...payload }, token);
}

export async function adminConfig(token: string, action: string, payload: Record<string,unknown> = {}) {
  return postFunction("admin-config", { action, productCode: PRODUCT_CODE, ...payload }, token);
}

function hex(bytes: Uint8Array) {
  return Array.from(bytes).map((b)=>b.toString(16).padStart(2,"0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return hex(new Uint8Array(digest));
}

function canonicalPublicJwk(jwk: JsonWebKey) {
  return JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y });
}

export async function activateArunikaLicense(licenseCode: string, activationPin: string) {
  let deviceId = localStorage.getItem("arunika_device_id");
  let privateJwk: JsonWebKey | null = null;
  let publicJwk: JsonWebKey | null = null;

  try {
    const savedPrivate = localStorage.getItem("arunika_device_private_jwk");
    const savedPublic = localStorage.getItem("arunika_device_public_jwk");
    if (savedPrivate && savedPublic) {
      privateJwk = JSON.parse(savedPrivate);
      publicJwk = JSON.parse(savedPublic);
    }
  } catch {}

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("arunika_device_id", deviceId);
  }

  if (!privateJwk || !publicJwk) {
    const pair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    ) as CryptoKeyPair;
    privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
    publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
    localStorage.setItem("arunika_device_private_jwk", JSON.stringify(privateJwk));
    localStorage.setItem("arunika_device_public_jwk", JSON.stringify(publicJwk));
  }

  const thumbprint = await sha256Hex(canonicalPublicJwk(publicJwk));
  const result = await postFunction("license-activate", {
    licenseCode: licenseCode.trim().toUpperCase(),
    productCode: PRODUCT_CODE,
    deviceId,
    deviceName: navigator.userAgent.includes("Mobile") ? "Arunika Mobile" : "Arunika Web",
    publicKey: publicJwk,
    publicKeyThumbprint: thumbprint,
    activationPin: activationPin.trim(),
  });

  if (!result?.ok) throw new Error(result?.message || result?.code || "Aktivasi gagal.");
  localStorage.setItem("arunika_license_certificate", JSON.stringify(result.certificate));
  localStorage.setItem("arunika_license_verification_key", JSON.stringify(result.verificationKey));
  localStorage.setItem("arunika_license_product", String(result.productCode || PRODUCT_CODE));
  localStorage.setItem("arunika_license_activated_at", new Date().toISOString());
  return result;
}

export async function verifyArunikaLicense() {
  const certRaw = localStorage.getItem("arunika_license_certificate");
  const privateRaw = localStorage.getItem("arunika_device_private_jwk");
  if (!certRaw || !privateRaw) return { ok:false, code:"NO_LOCAL_LICENSE" };

  const certificate = JSON.parse(certRaw);
  const privateJwk = JSON.parse(privateRaw) as JsonWebKey;
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateJwk,
    { name:"ECDSA", namedCurve:"P-256" },
    false,
    ["sign"]
  );
  const nonce = crypto.randomUUID() + crypto.randomUUID();
  const payload = new TextEncoder().encode(certificate.signature + "." + nonce);
  const sig = await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"}, privateKey, payload);
  const bytes = new Uint8Array(sig);
  let raw = "";
  for (const b of bytes) raw += String.fromCharCode(b);
  const proof = btoa(raw).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");

  return postFunction("license-verify", { certificate, nonce, proof });
}
