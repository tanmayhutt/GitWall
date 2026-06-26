import { NextRequest, NextResponse } from "next/server";
import { fetchContributions, GitHubError } from "@/github";
import { renderWallpaper } from "@/render";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const user = searchParams.get("user");
  const theme = searchParams.get("theme") || "classic";
  const statsParam = searchParams.get("stats");
  const shape = searchParams.get("shape") === "circle" ? "circle" : "box";

  if (!user) {
    return NextResponse.json(
      { error: "Missing required parameter: user" },
      { status: 400 }
    );
  }

  const stats = statsParam !== "false";
  const cacheKey = `preview:${user}:${theme}:${stats}:${shape}`;

  try {
    let png = getCached(cacheKey);
    if (!png) {
      const calendar = await fetchContributions(user);
      png = renderWallpaper(calendar, {
        theme,
        device: "preview",
        stats,
        user,
        shape,
      });
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
    console.error(`Error generating preview for ${user}:`, message);
    return NextResponse.json({ error: message }, { status });
  }
}
