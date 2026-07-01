import { NextRequest, NextResponse } from "next/server";
import { otpService } from "@/services/otp.service";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 }
    );
  }

  const ttl = await otpService.getOtpTtl(email.toLowerCase().trim());

  return NextResponse.json({
    success: true,
    ttl,
  });
}