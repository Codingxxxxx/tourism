import { NextRequest, NextResponse } from "next/server";

/**
 *  handle proxy google image (from both browser and server side image) to google
 * @param req 
 * @returns 
 */
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
        "Cache-Control": "public, max-age=72000", // Cache for 20 hours
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