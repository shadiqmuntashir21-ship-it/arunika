import p0 from "@/lib/brand-assets/wordmark-0";
import p1 from "@/lib/brand-assets/wordmark-1";
import p2 from "@/lib/brand-assets/wordmark-2";
import p3 from "@/lib/brand-assets/wordmark-3";

export const dynamic = "force-static";

export function GET(){
  const bytes = new Uint8Array(Buffer.from(p0 + p1 + p2 + p3, "base64"));
  return new Response(bytes,{
    headers:{
      "Content-Type":"image/webp",
      "Cache-Control":"public, max-age=31536000, immutable"
    }
  });
}
