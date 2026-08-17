const express  = require("express");
const router   = express.Router();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Very small helper to avoid header-injection via newlines in the "from" name.
const sanitizeLine = (str = "") => String(str).replace(/[\r\n]+/g, " ").trim();

// POST /api/support/send
router.post("/support/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, message: "Email and message are required." });
    }

    const safeName    = sanitizeLine(name || "Anonymous user");
    const safeEmail   = sanitizeLine(email);
    const safeMessage = String(message).trim();

    if (!safeMessage) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    await transporter.sendMail({
      from: `"Vëlox Support Form" <${process.env.GMAIL_USER}>`,
      to: process.env.SUPPORT_RECEIVER_EMAIL || process.env.GMAIL_USER,
      replyTo: safeEmail, 
      subject: `New support message from ${safeName}`,
      text: `From: ${safeName} <${safeEmail}>\n\n${safeMessage}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px">
          <h2 style="margin-bottom:4px;">New Support Message</h2>
          <p style="color:#6b7280;font-size:13px;margin-top:0;">Vëlox — Support Form</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px;">Name</td><td style="padding:6px 0;font-size:14px;">${safeName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:6px 0;font-size:14px;">${safeEmail}</td></tr>
          </table>
          <div style="background:#f9fafb;border-radius:12px;padding:16px;font-size:14px;line-height:1.6;color:#111827;white-space:pre-wrap;">${safeMessage}</div>
        </div>
      `,
    });

    res.json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Support email error:", err);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
});

module.exports = router;