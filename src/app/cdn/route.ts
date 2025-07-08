import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const photoUrl = req.nextUrl.searchParams.get("photoUrl");

  // Validate photoUrl to prevent SSRF or abuse
  if (
    !photoUrl ||
    !photoUrl.startsWith("https://maps.googleapis.com/maps/api/place/photo")
  ) {
    return new NextResponse(null, {
      status: 400,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  try {
    const response = await fetch(photoUrl);

    if (!response.ok) {
      return new NextResponse(null, {
        status: 404,
        headers: {
          "Cache-Control": "public, max-age=3600",
          Vary: "Accept-Encoding",
        },
      });
    }

    console.log("DOWNLOAD_GOOGLE_IMAGE:", photoUrl);

    // Stream the response body directly
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=72000",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error: any) {
    console.error("Error fetching image:", error.message || error);

    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=3600",
        Vary: "Accept-Encoding",
      },
    });
  }
}
