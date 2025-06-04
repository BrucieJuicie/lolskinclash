// lolskinclash\utils\sendEmail.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to, token) { // [cite: 295]
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`; // [cite: 295]
  
  // Using the more informative HTML content and ensuring it matches the functionality
  const emailHtml = `
    <p>You requested a password reset for your LoL Skin Clash account.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await resend.emails.send({ // [cite: 296]
    from: process.env.RESET_EMAIL_SENDER, // [cite: 296] Make sure this is set in your .env.local file
    to: [to], // Ensure 'to' is an array as per resend documentation [cite: 10]
    subject: 'Reset your LoL Skin Clash password', // Subject from forgot-password route [cite: 10]
    html: emailHtml, // [cite: 297, 10]
  });
}