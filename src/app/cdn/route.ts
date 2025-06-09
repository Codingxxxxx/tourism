import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const photoUrl = req.nextUrl.searchParams.get('photoUrl');

  if (!photoUrl) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache 404 for 1 hour
      },
    });
  }

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) {
      return new NextResponse(null, {
        status: 404,
        headers: {
          "Cache-Control": "public, max-age=3600", // Cache 404 for 1 hour
        },
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache 404 for 1 hour
      },
    });
  }
}