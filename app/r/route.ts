// The link in the flyer's QR code: it opens the page right at the registration
// form. Kept short so the printed code stays small and easy to scan. A relative
// Location, because behind Railway's proxy request.url is the internal
// localhost:8080 (see publicBaseUrl in lib/auth.ts).
export async function GET() {
  return new Response(null, {
    status: 307,
    headers: { Location: "/#register" },
  });
}
