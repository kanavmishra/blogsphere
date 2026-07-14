import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // If SMTP environment variables are not fully configured, log to console as fallback
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("\n==================================================");
      console.log("📬 MOCK EMAIL SENT:");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text || html}`);
      console.log("==================================================\n");
      return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"BlogSphere" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✉️ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    // Return mock success so the application flow is not broken during testing/local dev
    return { success: false, error: error.message };
  }
};
