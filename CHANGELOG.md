# Changelog

All notable changes to the TechSer Payroll project will be documented in this file.

## [v0.2.7] - 2026-02-01

### Improvements

- **Salary Slip Update**: Changed employee identification field from "EPF No" to "UAN No" (Universal Account Number) in all salary slip PDFs for compliance with current standards.

### Fixes

- Confirmed Firebase email verification and password reset functionality is properly configured.

## [v0.2.6] - 2026-01-20

### Improvements

- **Auto-Payslip Number**: System now automatically generates Payslip Number based on Excel row index (skipping title/headers).
- **Attendance Display**: Added "Total Days" and "LOP" (Loss of Pay) fields to the Employee Details Modal.
- **Email Validation**: Added visual warning indicators (⚠️) for invalid email addresses in both Dashboard and Employee Details Modal.
- **Settings Layout**: Optimized Settings Modal layout by arranging "Title Rows" and "Month/Year Mapping" side-by-side.

### Fixes

- Fixed "Total Days" and "LOP" number formatting in PDF to standard integer format (e.g., "30" instead of "30.00").

## [v0.2.5] - 2026-01-19

### Improvements

- **Data Persistence**: "Payroll Month" and "Payroll Year" selections are now saved to local storage, persisting across page reloads.
- **PDF Styling**: Removed hardcoded colors from PDF headers for a cleaner, professional look.

## [v0.2.4] - 2026-01-18

### Improvements

- **Branding**: Added "Powered by AA SoftLabs" badge to the application footer.
- **Payslip Formatting**: Renamed "LWP/Absent" to "LOP" and reorganized the attendance strip in the PDF.

## [v0.2.3] - 2026-01-13

### Improvements

- **Email Template Refinements:**
  - Enforced "**Light Mode**" (White Paper style) for consistent rendering across all clients.
  - Dynamic **Company Name** and **Brand Color** in the email footer.
  - Improved layout: Increased padding, removed table borders, reduced label column width.
- **UI Enhancements:**
  - **Employee Details Modal**: New 3-column grid layout, categorized fields (Personal, Employment, Bank, Financial).
  - **Action Buttons**: Updated styling for "Reset Data", "Send All", and "Download" with outline-to-solid hover effects.

### Fixes

- Resolved undefined sender address error in email API.
- Fixed duplicate "Gross Salary" field display.

## [v0.2.2] - 2026-01-12

### Improvements

- **Mobile Optimization**: Responsive Employee Table (Hides non-essential columns on small screens).
  - 2-Column Layout for Summary Cards on mobile.
  - Added proper mobile padding.
- **Enhanced UX**: 'Download All' button now dynamically shows 'Download Selected (N)' when employees are selected.

## [v0.2.1] - 2026-01-12

### Improvements

- **Dynamic Release Notes**: Added a dedicated `/releases` page that auto-updates from this CHANGELOG file.

## [v0.2.0] - 2026-01-11

### Improvements

- Configurable Excel Upload: Map any Excel column to system fields explicitly.
- New System Fields: Earned Salary (Gross), VPF, Staff Loan, Salary Advance, LWF, Mobile/Other Deduction, Medical Insurance, Net Salary.
- Intelligent PDF Generation: Hides rows with 0/empty values for a cleaner look.
- PDF Precision: Uses Excel totals (Gross, Total Deductions, Net) directly to ensure zero discrepancies.
- Mandatory Field Validation: Ensures all critical fields are mapped before saving settings.

### Fixes

- Fixed 'Medical Insurance' mapping issue by default mapping to 'Medical Insurance' header.
- Fixed duplicate column issues in default mapping.

## [v0.1.3] - 2026-01-10

### Improvements

- Initial Beta Release
- Basic Excel Upload
- PDF Generation