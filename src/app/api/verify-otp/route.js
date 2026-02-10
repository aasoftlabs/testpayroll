import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { otp } = await request.json();

    // Validate OTP format
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      return NextResponse.json(
        { error: "Invalid OTP format. Please enter a 6-digit code." },
        { status: 400 }
      );
    }

    // Google Sheets configuration
    const SHEET_ID = "148DFawsy7zCyUx7ujWNAh-tqEgsyipM69nlZwnTFsq4";
    const SHEET_NAME = "Profiles";
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

    if (!API_KEY) {
      console.error("Missing GOOGLE_SHEETS_API_KEY environment variable");
      return NextResponse.json(
        { error: "Server configuration error. Please contact administrator." },
        { status: 500 }
      );
    }

    // Fetch data from Google Sheets
    const range = `${SHEET_NAME}!A:G`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Sheets API error:", await response.text());
      return NextResponse.json(
        { error: "Failed to verify OTP. Please try again later." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rows = data.values || [];

    // Skip header row and search for matching OTP
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const code = row[6]; // Column G - Code

      if (!code) continue;

      // Parse code format: "OTP|EXPIRY_TIMESTAMP"
      const [rowOtp, expiryStr] = code.split("|");

      if (rowOtp === otp) {
        // Check expiry
        const expiryTime = parseInt(expiryStr, 10);
        const currentTime = Date.now();

        if (currentTime > expiryTime) {
          return NextResponse.json(
            { error: "OTP has expired. Please request a new one." },
            { status: 403 }
          );
        }

        // OTP is valid and not expired
        return NextResponse.json({
          success: true,
          message: "OTP verified successfully",
        });
      }
    }

    // OTP not found
    return NextResponse.json(
      { error: "Invalid OTP. Please check and try again." },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json(
      { error: "An error occurred during verification. Please try again." },
      { status: 500 }
    );
  }
}
