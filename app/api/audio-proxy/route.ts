import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "audio.neurotypeapp.com",
  "mindflow-tts-output",  // S3 bucket prefix
  ".s3.amazonaws.com",
  ".s3.us-east-1.amazonaws.com",
  ".cloudfront.net",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const allowed = ALLOWED_HOSTS.some(
    (h) => parsed.hostname === h || parsed.hostname.endsWith(h)
  );
  if (!allowed) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream ${res.status}` },
      { status: res.status }
    );
  }

  const body = res.body;
  const contentType = res.headers.get("content-type") || "audio/mpeg";
  const contentLength = res.headers.get("content-length");

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=86400",
  };
  if (contentLength) headers["Content-Length"] = contentLength;

  return new NextResponse(body, { status: 200, headers });
}
