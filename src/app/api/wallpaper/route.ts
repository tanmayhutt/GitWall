import { NextRequest, NextResponse } from "next/server";
import { fetchContributions, GitHubError } from "@/github";
import { renderWallpaper } from "@/render";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const user = searchParams.get("user");
  const theme = searchParams.get("theme") || "classic";
  const statsParam = searchParams.get("stats");
  const device = searchParams.get("device") || "iphone14";
  const shape = searchParams.get("shape") === "circle" ? "circle" : "box";

  // Custom width/height override (for Android devices)
  const customWidth = searchParams.get("width");
  const customHeight = searchParams.get("height");

  if (!user) {
    return NextResponse.json(
      { error: "Missing required parameter: user" },
      { status: 400 }
    );
  }

  const stats = statsParam !== "false";
  const cacheKey = customWidth && customHeight
    ? `${user}:${theme}:${stats}:custom:${customWidth}x${customHeight}:${shape}`
    : `${user}:${theme}:${stats}:${device}:${shape}`;

  try {
    let png = getCached(cacheKey);
    if (!png) {
      const calendar = await fetchContributions(user);
      if (customWidth && customHeight) {
        png = renderWallpaper(calendar, {
          theme, stats, user, shape,
          customWidth: parseInt(customWidth),
          customHeight: parseInt(customHeight),
        });
      } else {
        png = renderWallpaper(calendar, { theme, device, stats, user, shape });
      }
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
    console.error(`Error generating wallpaper for ${user}:`, message);
    return NextResponse.json({ error: message }, { status });
  }
}
