import { NextResponse } from "next/server";
import { fetchContributions, GitHubError } from "@/github";
import { renderWallpaper, type RenderOptions } from "@/render";
import { getCached, setCache } from "@/lib/cache";

// Shared fetch → cache → render → respond → error-map flow used by both the
// /api/wallpaper and /api/preview routes. Keeping it in one place means caching,
// status mapping, and response headers can only ever change in lockstep.
export async function buildWallpaperResponse(
  user: string,
  cacheKey: string,
  options: RenderOptions,
  label: string
): Promise<NextResponse> {
  try {
    let png = getCached(cacheKey);
    if (!png) {
      const calendar = await fetchContributions(user);
      png = renderWallpaper(calendar, options);
      setCache(cacheKey, png);
    }

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
        "Content-Length": String(png.length),
      },
    });
  } catch (err: unknown) {
    const status = err instanceof GitHubError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error generating ${label} for ${user}:`, message);
    return NextResponse.json({ error: message }, { status });
  }
}
