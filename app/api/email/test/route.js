import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure transporter with secure settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: "forevish.care@gmail.com",
    pass: "bxxf fzeo jzsw qyde", // App password
  },
  tls: {
    // Don't fail on invalid certs
    rejectUnauthorized: false,
  },
});

export async function GET(request) {
  try {
    // Send a test email
    const result = await transporter.sendMail({
      from: '"Forevish Test" <forevish.care@gmail.com>',
      to: "forevish.care@gmail.com", // Send to yourself for testing
      subject: "Test Email from Forevish App",
      text: "This is a test email to verify SMTP settings",
      html: "<b>This is a test email to verify SMTP settings</b>",
    });

    console.log("Test email sent:", result.messageId);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
