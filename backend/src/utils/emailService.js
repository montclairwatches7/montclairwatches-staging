const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("🔍 Email Service Initializing...");
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ GMAIL credentials (EMAIL_USER/EMAIL_PASS) missing in .env! Emails will fail.");
} else {
  console.log(`✅ Gmail SMTP configured for: ${process.env.EMAIL_USER}`);
}

const sendOrderUpdateEmail = async (userEmail, orderId, newStatus) => {
  const statusColors = {
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  const mailOptions = {
    from: {
      address: process.env.EMAIL_USER || "hello@demomailtrap.co",
      name: "Montclair Luxury"
    },
    to: userEmail,
    subject: `Order Update: #${orderId} has been updated to ${newStatus.toUpperCase()}`,
    category: "Order Update",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #b87333; text-align: center;">Montclair Luxury</h2>
        <p>Dear Client,</p>
        <p>The protocols for your acquisition <strong>#${orderId}</strong> have been updated.</p>
        <div style="background: ${statusColors[newStatus] || "#000"}; color: white; padding: 10px; text-align: center; border-radius: 5px; font-weight: bold; text-transform: uppercase;">
          Status: ${newStatus}
        </div>
        <p style="margin-top: 20px;">You can track the live status of your timepiece in your dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">This is an automated transmission. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${userEmail} for Order #${orderId}`);
  } catch (error) {
    console.error("Email Dispatch Error:", error);
  }
};

const sendOTPEmail = async (userEmail, otp) => {
  const mailOptions = {
    from: {
      address: process.env.EMAIL_USER || "hello@demomailtrap.co",
      name: "Montclair Security"
    },
    to: userEmail,
    subject: "Security Access Code",
    category: "Security",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #b87333; text-align: center;">Montclair Security</h2>
        <p>A request has been initiated to reset your security credentials.</p>
        <p>Your one-time authentication code is:</p>
        <div style="background: #f4f4f4; color: #b87333; padding: 20px; text-align: center; border-radius: 5px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">This code will expire in 5 minutes. If you did not request this, please ignore this transmission.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">This is an automated transmission. Please do not reply.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP successfully dispatched to ${userEmail}`);
    console.debug("Mailtrap Response Info:", info);
  } catch (error) {
    console.error("❌ OTP Dispatch Error Details:", {
      message: error.message,
      code: error.code,
      response: error.response,
      recipient: userEmail
    });
    throw error;
  }
};

module.exports = { sendOrderUpdateEmail, sendOTPEmail };
