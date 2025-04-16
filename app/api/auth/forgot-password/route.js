// app/api/auth/send-reset-email/route.js

import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { message: "No user found with that email." },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

  user.resetToken = token;
  user.resetTokenExpiry = tokenExpires;
  await user.save();

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "LoL Skin Clash <noreply@lolskinclash.com>",
      to: [email],
      subject: "Reset your LoL Skin Clash password",
      html: `<p>Click the link below to reset your password:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link will expire in 1 hour.</p>`
    });

    return NextResponse.json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json(
      { message: "Failed to send reset email." },
      { status: 500 }
    );
  }
}
