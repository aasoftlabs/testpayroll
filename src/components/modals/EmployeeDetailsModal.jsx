import React from "react";
import { X, User, Briefcase, Calculator, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function EmployeeDetailsModal({
  employee,
  onClose,
  payrollMonth,
  payrollYear,
}) {
  if (!employee) return null;

  // Helper to format Excel serial date
  const formatExcelDate = (serial) => {
    if (!serial) return "-";
    // Excel base date is Dec 30, 1899
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, "0");
    const day = String(date_info.getDate()).padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  const getCategory = (key) => {
    const lowerKey = key.toLowerCase();

    // Internal/Technical fields
    if (lowerKey.startsWith("__")) {
      return "hidden";
    }

    // Hidden Fields (duplicates or explicitly requested to hide)
    const normalizedKey = lowerKey.replace(/\s+/g, " ").trim();
    if (
      [
        "basic",
        "other alw",
        "dist alw",
        "da",
        "net pay",
        "net salary",
      ].includes(lowerKey) || // Hide logic handled below or explicit hide
      (lowerKey.includes("gross salary") && lowerKey !== "gross salary")
    ) {
      // Special handling for Net Pay to render it separately with style
      if (["net pay", "net salary"].includes(lowerKey)) return "net_pay_custom";
      return "hidden";
    }

    // Personal Details
    if (
      ["name", "dob", "mobile", "email", "location", "pan"].includes(lowerKey)
    ) {
      return "personal";
    }

    // Employment Details
    if (
      [
        "emp code",
        "designation",
        "department",
        "doj",
        "days paid",
        "uan no",
        "esic no",
        "pf no",
      ].includes(lowerKey)
    ) {
      return "employment";
    }

    // Bank Details
    if (["bank name", "bank account", "ifsc"].includes(lowerKey)) {
      return "bank";
    }

    // Summary Statistics
    if (["gross", "ctc"].includes(lowerKey)) {
      return "summary";
    }

    // Default to Financial for everything else (Allowances etc)
    return "financial";
  };

  const entries = Object.entries(employee);
  const personalDetails = entries.filter(
    ([key]) => getCategory(key) === "personal",
  );
  const employmentDetails = entries.filter(
    ([key]) => getCategory(key) === "employment",
  );
  const bankDetails = entries.filter(([key]) => getCategory(key) === "bank");
  const financialDetails = entries.filter(
    ([key]) => getCategory(key) === "financial",
  );
  const netPayDetails = entries.filter(
    ([key]) => getCategory(key) === "net_pay_custom",
  );

  // Reorder: Ensure Arrears comes before Gross Salary
  const grossIndex = financialDetails.findIndex(
    ([key]) => key.toLowerCase() === "gross salary",
  );
  const arrearsIndex = financialDetails.findIndex(
    ([key]) => key.toLowerCase() === "arrears",
  );

  if (grossIndex !== -1 && arrearsIndex !== -1 && arrearsIndex > grossIndex) {
    const [arrearsEntry] = financialDetails.splice(arrearsIndex, 1);
    financialDetails.splice(grossIndex, 0, arrearsEntry);
  }

  const summaryDetails = entries.filter(
    ([key]) => getCategory(key) === "summary",
  );

  const formatLabel = (key) => {
    // Normalize key: lowercase, trim, replace underscores with spaces, collapse multiple spaces
    const normalized = key
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const keyMap = {
      "mobile ded": "Mobile Deduction",
      "other ded": "Other Deduction",
      "medical ins": "Medical Insurance",
      "prov.fund": "Provident Fund",
      "p.tax": "Professional Tax",
      "esic no": "ESIC Number",
      "pf no": "PF Number",
      "uan no": "UAN Number",
      "med alw": "Medical Allowance",
      "conv alw": "Conveyance Allowance",
      "dist alw": "Distance Allowance",
      "other alw": "Other Allowance",
      "other allowance": "Other Allowance",
      "sal adv": "Salary Advance",
      "staff loan": "Staff Loan",
      lwf: "Labour Welfare Fund",
      doj: "Joining Date",
      dob: "Date of Birth",
      "ttl ded": "Total Deductions",
      "gross salary": "Earned Salary (Gross)",
      basic: "Basic Salary",
      da: "Dearness Allowance (D.A.)",
      hra: "HRA",
      esi: "ESI",
      vpf: "VPF",
      arrears: "Arrears",
      "total (basic+da)": "Total (Basic + DA)",
      "days paid": "Days Paid",
      "net salary": "Net Salary",
      "net pay": "Net Pay",
      "present days": "Present Days",
    };

    if (keyMap[normalized]) {
      return keyMap[normalized];
    }

    // Fallback: Title Case
    return normalized
      .split(" ")
      .map((word) => {
        // Keep acronyms like HRA, DA, PF if they appear as standalone words?
        // Better to just Title Case everything for consistency unless mapped.
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  const DetailRow = ({ label, value, highlight = false }) => {
    let displayValue = value;
    const lowerLabel = label.toLowerCase();

    // Auto-highlight specific fields
    const shouldHighlight =
      highlight || ["gross salary", "ttl ded"].includes(lowerLabel);

    // Handle Date formatting for DOB and DOJ
    if (
      (lowerLabel === "dob" || lowerLabel === "doj") &&
      typeof value === "number"
    ) {
      displayValue = formatExcelDate(value);
    }
    // Handle currency vs number formatting
    else if (
      typeof value === "number" &&
      !lowerLabel.includes("no") &&
      !lowerLabel.includes("account") &&
      !lowerLabel.includes("days paid")
    ) {
      displayValue = formatCurrency(value);
    }

    return (
      <div
        className={`flex justify-between items-center py-2 border-b border-slate-50 last:border-0 ${shouldHighlight ? "bg-indigo-50 -mx-2 px-2 rounded-lg" : ""}`}
      >
        <span className="text-sm text-slate-500 font-medium capitalize">
          {formatLabel(label)}
        </span>
        <span
          className={`text-sm font-semibold flex items-center gap-2 ${shouldHighlight ? "text-indigo-600" : "text-slate-800"}`}
        >
          {displayValue}
          {lowerLabel === "email" &&
            displayValue &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(displayValue) && (
              <div className="group relative">
                <AlertTriangle
                  size={16}
                  className="text-amber-500 cursor-help"
                />
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50 whitespace-normal text-left">
                  Invalid Email Format
                </div>
              </div>
            )}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden relative z-10 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {employee.Name}
              </h2>
              <p className="text-sm text-slate-500">
                {employee.Designation} • {employee.Department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Personal & Bank Details */}
            <div className="space-y-8">
              {/* Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b-2 border-indigo-500 w-fit pb-1">
                  <User size={16} />
                  <span>Personal Details</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {personalDetails.map(([key, value]) => (
                    <DetailRow key={key} label={key} value={value} />
                  ))}
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b-2 border-purple-500 w-fit pb-1">
                  <Calculator size={16} />
                  <span>Bank Details</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {bankDetails.map(([key, value]) => (
                    <DetailRow key={key} label={key} value={value} />
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Employment Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b-2 border-blue-500 w-fit pb-1">
                <Briefcase size={16} />
                <span>Employment Details</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {employmentDetails.map(([key, value]) => (
                  <DetailRow key={key} label={key} value={value} />
                ))}

                {/* Inject Total Days and LOP if not present in map */}
                {(() => {
                  // Calculate Total Days
                  const m =
                    payrollMonth ||
                    new Date().toLocaleString("default", { month: "long" });
                  const y = payrollYear || new Date().getFullYear().toString();

                  const getDaysInMonth = (mName, yStr) => {
                    return new Date(
                      yStr,
                      new Date(Date.parse(mName + " 1, " + yStr)).getMonth() +
                        1,
                      0,
                    ).getDate();
                  };

                  const totalDays = getDaysInMonth(m, y);

                  // Calculate LOP
                  let daysPaidVal = 0;
                  // Find "Days Paid" from entire employee object case-insensitive
                  const daysPaidKey = Object.keys(employee).find(
                    (k) => k.toLowerCase() === "days paid",
                  );
                  if (daysPaidKey) {
                    daysPaidVal = parseFloat(employee[daysPaidKey] || 0);
                  }

                  const lop = totalDays - daysPaidVal;

                  return (
                    <>
                      <DetailRow
                        key="total_days"
                        label="Total Days"
                        value={String(totalDays)}
                      />
                      <DetailRow
                        key="lop"
                        label="LOP"
                        value={String(parseFloat(lop.toFixed(2)))}
                      />
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Column 3: Financial & Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b-2 border-emerald-500 w-fit pb-1">
                <Calculator size={16} />
                <span>Payroll Breakdown</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {financialDetails.map(([key, value]) => (
                  <DetailRow key={key} label={key} value={value} />
                ))}
                {summaryDetails.map(([key, value]) => (
                  <DetailRow
                    key={key}
                    label={key}
                    value={value}
                    highlight={true}
                  />
                ))}

                {/* Specialized Net Pay Section - Only show unique/first instance */}
                {netPayDetails.length > 0 &&
                  (() => {
                    const [key, value] = netPayDetails[0];
                    return (
                      <div
                        key={key}
                        className={`mt-4 p-4 rounded-xl border-2 ${employee["__mismatch"] ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-100"}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`text-sm font-bold ${employee["__mismatch"] ? "text-amber-800" : "text-emerald-800"}`}
                          >
                            {formatLabel(key)}
                          </span>
                          <span
                            className={`text-xl font-bold ${employee["__mismatch"] ? "text-amber-700" : "text-emerald-700"}`}
                          >
                            {formatCurrency(value)}
                          </span>
                        </div>
                        {employee["__mismatch"] && (
                          <div className="mt-2 pt-2 border-t border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                            <div className="mt-0.5 shrink-0">⚠️</div>
                            <div>
                              <span className="font-semibold block">
                                Calculation Mismatch detected!
                              </span>
                              System calculated:{" "}
                              <span className="font-mono">
                                {formatCurrency(employee["__calculatedNet"])}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
