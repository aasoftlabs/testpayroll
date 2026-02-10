import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { numberToWords } from "@/lib/utils";

export const generatePDFContent = (
  doc,
  employee,
  month,
  year,
  companyProfile
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Helper to clean currency for PDF formatting (removes ₹)
  const formatMoney = (amount) => {
    if (!amount) return "0.00";
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --- Header Section ---
  let currentY = 15;

  // Logo (Left)
  if (companyProfile?.logoUrl) {
    try {
      doc.addImage(companyProfile.logoUrl, "PNG", margin, currentY, 40, 25);
    } catch (error) {
      console.log("Logo loading skipped", error);
    }
  }

  // Company Details (Right of Logo or Center)
  const headerTextX = companyProfile?.logoUrl ? margin + 45 : margin;

  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246); // Blue color for Company Name
  doc.setFont("helvetica");
  doc.text(
    (
      companyProfile?.name || "TECHSER POWER SOLUTIONS PRIVATE LIMITED"
    ).toUpperCase(),
    headerTextX,
    currentY + 11
  );

  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70); // Dark Gray for address
  doc.setFont("helvetica", "bold");
  const address =
    companyProfile?.address ||
    "Techser House, #12/1, MES Road 5th Cross, Shararadamba Nagar, Jalahalli, Bengaluru - 13";
  doc.text(address, headerTextX, currentY + 16);

  currentY += 30; // Reduced gap

  // --- Employee Details Grid (Compact) ---
  autoTable(doc, {
    startY: currentY,
    head: [],
    body: [
      [
        "PaySlip",
        employee["Serial No"] || "1",
        "Payslip for the month",
        `${month} - ${year}`,
        "Branch",
        employee["Location"] || "",
      ],
      [
        "Emp Code",
        employee["Emp Code"] || "",
        "Employee Name",
        employee.Name || "",
        "AC No.",
        employee["Bank Account"] || "",
      ],
      [
        "Department",
        employee.Department || "",
        "Designation",
        employee.Designation || "",
        "",
        "",
      ],
      [
        "ESIC No",
        employee["ESIC No"] || "",
        "PF No",
        employee["PF No"] || "",
        "",
        "",
      ],
    ],
    theme: "plain", // Clean look
    styles: {
      fontSize: 8, // Slightly larger to match typical readability
      cellPadding: 1.5,
      textColor: [70, 70, 70], // Default grey
      font: "helvetica", // Explicitly set font
      overflow: "visible",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 25, textColor: [70, 70, 70] }, // PaySlip / Emp Code labels
      1: { cellWidth: 30 },
      2: { fontStyle: "bold", cellWidth: 40, textColor: [70, 70, 70] }, // Month / Name labels
      3: { cellWidth: 40 },
      4: { fontStyle: "bold", cellWidth: 20, textColor: [70, 70, 70] }, // Branch / AC labels
      5: { cellWidth: 35 },
    },
    didParseCell: function (data) {
      // Apply Colors based on reference
      // Month (Row 0, Col 3): Green
      if (data.row.index === 0 && data.column.index === 3) {
        data.cell.styles.textColor = [0, 128, 0];
      }
      // Branch (Row 0, Col 5): Green
      if (data.row.index === 0 && data.column.index === 5) {
        data.cell.styles.textColor = [0, 128, 0];
      }
      // Employee Name (Row 1, Col 3): Green
      if (data.row.index === 1 && data.column.index === 3) {
        data.cell.styles.textColor = [0, 128, 0];
      }
      // AC No (Row 1, Col 5): Blue
      if (data.row.index === 1 && data.column.index === 5) {
        data.cell.styles.textColor = [59, 130, 246];
      }
      // AC No (Row 1, Col 5): Blue (if desired, or black) - User said "color text"
      // Let's keep AC No value Blue as per previous code, or if unknown, Black.
      // Reference usually has Name/Branch colored.

      // Department (Row 2, Col 1): Orange
      if (data.row.index === 2 && data.column.index === 1) {
        data.cell.styles.textColor = [255, 100, 0]; // Bright Orange
      }

      // Designation can be standard
    },
  });

  currentY = doc.lastAutoTable.finalY + 2; // Reduced gap

  // --- Separator Line ---
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // --- Attendance Strip (Compact) ---
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);

  let xPos = margin;
  doc.text("Days Paid", xPos, currentY + 3);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(59, 130, 246); // Blue
  doc.text(String(employee["Days Paid"] || "0.00"), xPos + 20, currentY + 3);

  xPos += 60;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Pd.Off", xPos, currentY + 3);
  doc.setFont("helvetica", "normal");
  doc.text(String(employee["Pd.Off"] || "0.00"), xPos + 15, currentY + 3);

  xPos += 60;
  doc.setFont("helvetica", "bold");
  doc.text("LWP/Absent", xPos, currentY + 3);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(239, 68, 68); // Red
  doc.text(
    String(employee["LWP/Absent"] || "0.00 / 0.00"),
    xPos + 25,
    currentY + 3
  );

  currentY += 8; // Reduced gap

  // --- Financial Table (Compact) ---
  // Helper to check if value is valid (not 0, not empty, not "-")
  const isValid = (val) => {
    const num = Number(val);
    return val && val !== "-" && !isNaN(num) && num > 0;
  };

  const earnings = [];
  if (isValid(employee.BASIC))
    earnings.push({ label: "BASIC", val: employee.BASIC });

  // Add D A if > 0
  if (isValid(employee["D A"])) {
    earnings.push({ label: "D A", val: employee["D A"] });
  }

  // Standard Earnings
  if (isValid(employee.HRA)) earnings.push({ label: "HRA", val: employee.HRA });
  if (isValid(employee["CONV ALW"]))
    earnings.push({ label: "CONV ALW", val: employee["CONV ALW"] });
  if (isValid(employee["MED ALW"]))
    earnings.push({ label: "MED ALW", val: employee["MED ALW"] });
  if (isValid(employee["OTHER ALW"]))
    earnings.push({ label: "OTHER ALW", val: employee["OTHER ALW"] });

  // Add DIST ALW if > 0
  if (isValid(employee["DIST ALW"])) {
    earnings.push({ label: "DIST ALW", val: employee["DIST ALW"] });
  }

  // Add ARREARS if > 0
  if (isValid(employee["ARREARS"])) {
    earnings.push({ label: "ARREARS", val: employee["ARREARS"] });
  }

  const deductions = [];
  if (isValid(employee["PROV.FUND"]))
    deductions.push({ label: "PROV.FUND", val: employee["PROV.FUND"] });
  if (isValid(employee["P.Tax"]))
    deductions.push({ label: "P.Tax", val: employee["P.Tax"] });

  if (employee["ESI"] && Number(employee["ESI"]) > 0) {
    deductions.push({ label: "ESI", val: employee["ESI"] });
  }
  if (employee["TDS"] && Number(employee["TDS"]) > 0) {
    deductions.push({ label: "TDS", val: employee["TDS"] });
  }

  // New Deductions
  if (employee["VPF"] && Number(employee["VPF"]) > 0) {
    deductions.push({ label: "VPF", val: employee["VPF"] });
  }
  if (employee["STAFF LOAN"] && Number(employee["STAFF LOAN"]) > 0) {
    deductions.push({ label: "Staff Loan", val: employee["STAFF LOAN"] });
  }
  if (employee["SAL ADV"] && Number(employee["SAL ADV"]) > 0) {
    deductions.push({ label: "Salary Advance", val: employee["SAL ADV"] });
  }
  if (employee["LWF"] && Number(employee["LWF"]) > 0) {
    deductions.push({ label: "LWF", val: employee["LWF"] });
  }
  if (employee["MOBILE_DED"] && Number(employee["MOBILE_DED"]) > 0) {
    deductions.push({ label: "Mobile/Other", val: employee["MOBILE_DED"] });
  }
  if (employee["OTHER_DED"] && Number(employee["OTHER_DED"]) > 0) {
    deductions.push({ label: "Other Ded.", val: employee["OTHER_DED"] });
  }
  if (employee["MEDICAL_INS"] && Number(employee["MEDICAL_INS"]) > 0) {
    deductions.push({ label: "Med. Insurance", val: employee["MEDICAL_INS"] });
  }

  const maxRows = Math.max(earnings.length, deductions.length);
  const tableBody = [];

  for (let i = 0; i < maxRows; i++) {
    const earn = earnings[i] || { label: "", val: "" };
    const ded = deductions[i] || { label: "", val: "" };
    tableBody.push([
      earn.label,
      earn.val ? formatMoney(earn.val) : "",
      ded.label,
      ded.val ? formatMoney(ded.val) : "",
    ]);
  }

  // Calculate Totals based on what's in the table to ensure it matches
  // BUT override with Excel values if they exist (per User request to trust Excel)
  let totalEarnings = earnings.reduce(
    (acc, curr) => acc + (Number(curr.val) || 0),
    0
  );
  if (employee["GROSS SALARY"] && Number(employee["GROSS SALARY"]) > 0) {
    totalEarnings = Number(employee["GROSS SALARY"]);
  }

  let totalDeductions = deductions.reduce(
    (acc, curr) => acc + (Number(curr.val) || 0),
    0
  );
  if (employee["TTL DED"] && Number(employee["TTL DED"]) > 0) {
    totalDeductions = Number(employee["TTL DED"]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        "Earnings",
        { content: "Amount", styles: { halign: "right" } },
        "Deductions & Recoveries",
        { content: "Amount", styles: { halign: "right" } },
      ],
    ],
    body: tableBody.map((row) => [
      row[0],
      row[1].replace("₹", "").trim(), // Ensure no ₹ from previous format if any
      row[2],
      row[3].replace("₹", "").trim(),
    ]),
    foot: [
      [
        {
          content: "Amount Total :",
          styles: { halign: "right", fontStyle: "bold", valign: "middle" },
        },
        {
          content: formatMoney(totalEarnings),
          styles: { fontStyle: "bold", halign: "right", valign: "middle" },
        },
        {
          content: "Amount Total :",
          styles: { halign: "right", valign: "middle", fontStyle: "bold" },
        },
        {
          content: formatMoney(totalDeductions),
          styles: { fontStyle: "bold", halign: "right", valign: "middle" },
        },
      ],
      [
        { content: "", colSpan: 1 }, // Blank space for earnings side
        { content: "", colSpan: 1 }, // Blank space for earnings side
        {
          content: "Net Pay :",
          styles: {
            halign: "right",
            valign: "middle",
            fontStyle: "bold",
            textColor: [70, 70, 70],
            fontSize: 9,
          }, // Slightly larger for emphasis
        },
        {
          content: formatMoney(employee["Net Pay"] || 0),
          styles: {
            halign: "right",
            valign: "middle",
            fontStyle: "bold",
            textColor: [70, 70, 70],
            fontSize: 9,
          }, // Black and larger for Net Pay
        },
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 }, // Very compact vertical padding
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [60, 60, 60],
      fontStyle: "bold",
      minCellHeight: 5,
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [40, 40, 40],
      minCellHeight: 8,
    }, // White footer background
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 50 },
      3: { cellWidth: 40, halign: "right" },
    },
  });

  // --- Net Pay & Words ---
  currentY = doc.lastAutoTable.finalY + 5; // Attach to bottom of table

  // Amount In Words (Bottom Left)
  const amountInWords = numberToWords(employee["Net Pay"] || 0);
  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, currentY, pageWidth - margin * 2, 7); // Words Box
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(`Net Pay : ${amountInWords} Rupees`, margin + 2, currentY + 5);

  return doc;
};

export const generatePDF = (employee, month, year, companyProfile) => {
  const doc = new jsPDF();
  return generatePDFContent(doc, employee, month, year, companyProfile);
};

export const generatePDFBase64 = (employee, month, year, companyProfile) => {
  const doc = new jsPDF();
  generatePDFContent(doc, employee, month, year, companyProfile);
  return doc.output("datauristring").split(",")[1];
};
