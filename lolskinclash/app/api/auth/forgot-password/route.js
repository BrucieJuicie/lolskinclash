// lolskinclash\app\api\auth\forgot-password\route.js
import { connectDB } from "@/utils/mongodb"; // [cite: 4]
import { User } from "@/models/User"; // [cite: 4]
import { NextResponse } from "next/server"; // [cite: 4]
// Resend import is no longer needed here directly if using the utility
import crypto from "crypto"; // [cite: 5]
import { sendResetEmail } from "@/utils/sendEmail"; // Import the utility

// const resend = new Resend(process.env.RESEND_API_KEY); // No longer needed here

export async function POST(req) { // [cite: 6]
  await connectDB(); // [cite: 6]
  const { email } = await req.json(); // [cite: 6]

  if (!email) { // [cite: 7]
    return NextResponse.json({ message: "Email is required." }, { status: 400 }); // [cite: 7]
  }

  const user = await User.findOne({ email }); // [cite: 7]

  if (!user) { // [cite: 8]
    // Still return a generic message to avoid disclosing whether an email exists
    return NextResponse.json({ message: "If a user with that email exists, a password reset email has been sent." }); // [cite: 8, 11] (Modified for security best practice)
  }

  const token = crypto.randomBytes(32).toString("hex"); // [cite: 9]
  const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now [cite: 9]

  user.resetToken = token; // [cite: 9]
  user.resetTokenExpiry = tokenExpires; // [cite: 9]
  await user.save(); // [cite: 10]

  // const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`; // No longer needed here

  try {
    await sendResetEmail(email, token); // Use the utility function
    return NextResponse.json({ message: "Password reset email sent. Please check your inbox." }); // [cite: 11]
  } catch (error) { // [cite: 11]
    console.error("Resend Error (via sendResetEmail utility):", error); // [cite: 11]
    return NextResponse.json(
      { message: "Failed to send reset email." }, // [cite: 12]
      { status: 500 } // [cite: 12]
    );
  }
}