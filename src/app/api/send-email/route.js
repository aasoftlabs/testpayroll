import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const {
      employeeName,
      employeeEmail,
      pdfBase64,
      month,
      year,
      netSalary,
      designation,
      brandColor,
      companyName,
    } = await request.json();

    // 1. Validate required fields
    if (!employeeEmail || !pdfBase64 || !employeeName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Default company name if not provided
    const displayCompanyName =
      companyName || "Techser Power Solutions Pvt. Ltd.";

    // 2. CRITICAL FIX: Clean the Base64 string
    // This removes the "data:application/pdf;base64," prefix if it exists
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(base64Data, "base64");

    // 3. Fetch SMTP details from Firestore
    let smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      secure: process.env.SMTP_SECURE === "true",
    };

    try {
      const { adminDb } = await import("@/lib/firebaseAdmin");
      const profileDoc = await adminDb
        .collection("companies")
        .doc("main-profile")
        .get();
      if (profileDoc.exists) {
        const data = profileDoc.data();
        if (data.smtpHost) {
          smtpConfig = {
            host: data.smtpHost,
            port: parseInt(data.smtpPort || "587"),
            user: data.smtpUser,
            pass: data.smtpPassword,
            secure: data.smtpSecure === true, // Ensure boolean
          };
        }
      }
    } catch (e) {
      console.warn("Failed to fetch SMTP settings from DB, using fallback:", e);
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: {
        // Warning: Set this to true in production if you have valid certs
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
      connectionTimeout: 10000,
    });

    // 4. Prepare email content
    const subject = `Salary Slip - ${month} ${year} - ${employeeName}`;
    const formattedSalary = netSalary
      ? Number(netSalary).toLocaleString("en-IN")
      : "0";

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <style>
          :root {
            color-scheme: light;
          }
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333 !important; 
            background-color: #f4f4f4 !important; 
            margin: 0; 
            padding: 0; 
            -webkit-font-smoothing: antialiased;
          }
          .container { 
            max-width: 900px; 
            margin: 40px auto; 
            background: #ffffff !important; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
            overflow: hidden; 
            border: 1px solid #e5e7eb; 
          }
          .header { background: #1e293b !important; color: #ffffff !important; padding: 24px 30px; border-bottom: 4px solid ${brandColor}; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; color: #ffffff !important; }
          .content { padding: 40px 30px; background: #ffffff !important; color: #333333 !important; }
          .table-container { margin: 25px 0; border-radius: 6px; overflow: hidden; background: #ffffff !important; }
          .info-table { width: 100%; border-collapse: collapse; background: #ffffff !important; }
          .info-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #333333 !important; }
          .info-table tr:last-child td { border-bottom: none; }
          .label { color: #6b7280 !important; font-weight: 500; width: 150px; background: #f9fafb !important; }
          .value { color: #111827 !important; font-weight: 600; }
          .footer { background: #f9fafb !important; padding: 20px; border-top: 1px solid #e5e7eb; }
          
          /* Dark Mode Overrides */
          @media (prefers-color-scheme: dark) {
            body { background-color: #f4f4f4 !important; color: #333333 !important; }
            .container { background-color: #ffffff !important; color: #333333 !important; }
            .content { background-color: #ffffff !important; color: #333333 !important; }
            .label { background-color: #f9fafb !important; color: #6b7280 !important; }
            .value { color: #111827 !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Salary Statement</h1>
          </div>
          <div class="content">
            <p style="margin-top: 0; color: #374151;">Dear <strong>${employeeName}</strong>,</p>
            <p style="color: #4b5563;">Your salary for the month of <strong>${month} ${year}</strong> has been successfully processed and credited.</p>
            
            <div class="table-container">
              <table class="info-table">
                <tr>
                  <td class="label">Pay Period: </td>
                  <td class="value">${month} ${year}</td>
                </tr>
                <tr>
                  <td class="label">Designation: </td>
                  <td class="value">${designation || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Net Payable: </td>
                  <td class="value" style="color: #059669;">₹${formattedSalary}</td>
                </tr>
              </table>
            </div>

            <p style="color: #4b5563; font-size: 14px;">Please find your detailed payslip attached to this email for your records.</p>
            
          </div>
          <div class="footer">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="color: #6b7280; font-size: 14px;">
                  &copy; ${year} <span style="color: ${brandColor}; font-weight: 600;">${displayCompanyName}</span> All rights reserved.
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    // 5. Send email
    const info = await transporter.sendMail({
      from: `"HR Department" <${smtpConfig.user}>`,
      to: employeeEmail,
      subject: subject,
      html: htmlBody,
      attachments: [
        {
          filename: `Payslip_${employeeName.replace(
            /\s+/g,
            "_"
          )}_${month}_${year}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email sent to ${employeeEmail}`,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
