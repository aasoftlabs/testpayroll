import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { confirmed } = await request.json();

    if (!confirmed) {
      return NextResponse.json(
        { error: "Confirmation required" },
        { status: 400 }
      );
    }

    // Get profile to find the admin email
    const profileRef = adminDb.collection("companies").doc("main-profile");
    const profileSnap = await profileRef.get();

    if (profileSnap.exists) {
      const { hrEmail } = profileSnap.data();
      if (hrEmail) {
        try {
          const { adminAuth } = await import("@/lib/firebaseAdmin");
          const user = await adminAuth.getUserByEmail(hrEmail);
          if (user) {
            await adminAuth.deleteUser(user.uid);
            console.log(`Successfully deleted auth user: ${hrEmail}`);
          }
        } catch (authError) {
          console.error("Error deleting auth user:", authError);
          // Continue to delete profile even if auth deletion fails
          // or user not found (already deleted)
        }
      }
    }

    // Delete the company profile
    await profileRef.delete();

    return NextResponse.json({
      success: true,
      message: "Company profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company profile:", error);
    return NextResponse.json(
      { error: "Failed to delete company profile. Please try again." },
      { status: 500 }
    );
  }
}
