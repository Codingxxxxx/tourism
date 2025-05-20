import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const photoUrl = req.nextUrl.searchParams.get('photoUrl');

  if (!photoUrl) {
    return NextResponse.json(
      { error: "Photo URL is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
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
    return NextResponse.json(
      { error: "Error fetching image" },
      { status: 500 },
    );
  }
}