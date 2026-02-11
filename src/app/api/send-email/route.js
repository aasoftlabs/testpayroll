import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// 1. PERSISTENT TRANSPORTER
// Defining this outside the handler allows connection pooling to work
let transporter = null;

const getTransporter = (config) => {
  // If transporter doesn't exist, create it with pooling enabled
  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,                // CRITICAL: Reuses connections
      maxConnections: 5,         // Matches your frontend batch size
      maxMessages: 100,          // Rotates connection after 100 emails to prevent timeouts
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        // Only reject unauthorized in production with valid certs
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
      connectionTimeout: 10000,  // 10 seconds
      greetingTimeout: 5000,     // 5 seconds
    });
  }
  return transporter;
};

export async function POST(request) {
  try {
    const {
      employeeName,
      employeeEmail,
      pdfBase64,
      month,
      year,
      netSalary,
      brandColor,
      companyName,
    } = await request.json();

    // Basic Validation
    if (!employeeEmail || !pdfBase64 || !employeeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. SMTP CONFIGURATION
    // Use Environment Variables as fallback
    let smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      secure: process.env.SMTP_SECURE === "true",
    };

    // Fetch from Firestore if available
    try {
      const { adminDb } = await import("@/lib/firebaseAdmin");
      const profileDoc = await adminDb.collection("companies").doc("main-profile").get();
      if (profileDoc.exists) {
        const data = profileDoc.data();
        if (data.smtpHost) {
          smtpConfig = {
            host: data.smtpHost,
            port: parseInt(data.smtpPort || "587"),
            user: data.smtpUser,
            pass: data.smtpPassword,
            secure: data.smtpSecure === true,
          };
        }
      }
    } catch (e) {
      console.warn("Using environment variables for SMTP");
    }

    // 3. GET POOLED TRANSPORTER
    const activeTransporter = getTransporter(smtpConfig);

    // 4. PREPARE ATTACHMENT
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(base64Data, "base64");

    // 5. EMAIL TEMPLATE
    const displayCompany = companyName || "Your Company Name";
    const formattedSalary = Number(netSalary || 0).toLocaleString("en-IN");

    const mailOptions = {
      from: `"${displayCompany} HR" <${smtpConfig.user}>`,
      to: employeeEmail,
      subject: `Payslip for ${month} ${year} - ${employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: ${brandColor || '#1e293b'};">Salary Payslip</h2>
          <p>Dear <b>${employeeName}</b>,</p>
          <p>Please find attached your payslip for the month of <b>${month} ${year}</b>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #eee;"><b>Net Salary Credited</b></td>
              <td style="padding: 10px; border: 1px solid #eee;">₹ ${formattedSalary}</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #666;">This is an automated email. Please contact the HR department for any discrepancies.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="text-align: center; font-size: 11px; color: #999;">&copy; ${year} ${displayCompany}</p>
        </div>
      `,
      attachments: [
        {
          filename: `Payslip_${employeeName.replace(/\s+/g, "_")}_${month}_${year}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // 6. SEND
    const info = await activeTransporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });

  } catch (error) {
    console.error("Critical Mail Error:", error.message);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}