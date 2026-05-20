import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // In production, integrate with nodemailer or similar
    // For now, log and return success
    console.log("Contact form submission:", { name, email, message });

    // You can integrate with your email here
    // Example: send to matammedia@gmail.com

    return NextResponse.json({
      success: true,
      message: "Aapka paigham mil gaya! Hum jald hi jawab denge.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
