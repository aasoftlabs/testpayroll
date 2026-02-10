# Changelog

All notable changes to the TechSer Payroll project will be documented in this file.

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
