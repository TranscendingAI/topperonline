import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    // Get PIN from environment variable
    const correctPin = process.env.PIN_CODE || "1234";

    if (pin === correctPin) {
      // PIN is correct - set authentication cookie
      const response = NextResponse.json({ success: true });
      
      // Set a secure, httpOnly cookie that expires in 8 hours
      response.cookies.set("suburban_toppers_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });

      return response;
    } else {
      // PIN is incorrect
      return NextResponse.json(
        { success: false, error: "Incorrect PIN" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
