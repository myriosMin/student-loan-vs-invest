import { NextResponse } from "next/server";

let cache: { date: string; sora: number } | null = null;

export async function GET() {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  if (cache?.date === today) {
    return NextResponse.json({ sora: cache.sora, tflRate: +(cache.sora + 1.5).toFixed(3) });
  }

  try {
    const res = await fetch("https://housingloansg.com/hl/charts/sibor-sora-rates", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.google.com/search?q=singapore+sora+rate+today",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const idx = html.indexOf("3 Mth");
    if (idx === -1) throw new Error("Could not find '3 Mth' in page");

    const snippet = html.slice(idx, idx + 300);
    const match = snippet.match(/([0-9]+\.[0-9]+)/);
    if (!match) throw new Error("Could not extract SORA rate from snippet");

    const sora = parseFloat(match[1]);
    if (isNaN(sora)) throw new Error("Parsed NaN for SORA rate");

    cache = { date: today, sora };
    return NextResponse.json({ sora, tflRate: +(sora + 1.5).toFixed(3) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
