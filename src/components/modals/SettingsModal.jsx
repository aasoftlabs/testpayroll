import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building2,
  Server,
  Lock,
  Plus,
  Trash2,
  ArrowDown,
  Upload,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";
import ConfirmModal from "./ConfirmModal";

const SYSTEM_FIELDS = [
  { label: "Employee Code", value: "Emp Code", required: true },
  { label: "Employee Name", value: "Name", required: true },
  { label: "Email", value: "Email", required: true },
  { label: "Department", value: "Department", required: true },
  { label: "Designation", value: "Designation", required: true },
  { label: "Location", value: "Location", required: true },
  { label: "Bank Account Number", value: "Bank Account", required: true },
  { label: "IFSC Code", value: "IFSC", required: true },
  { label: "ESIC Number", value: "ESIC No", required: true },
  { label: "PF Number", value: "PF No", required: true },
  { label: "UAN Number", value: "UAN No", required: true },
  { label: "Joining Date", value: "DOJ", required: true },
  // Earnings
  { label: "Basic Salary", value: "BASIC", required: true },
  { label: "Dearness Allowance (D.A.)", value: "DA", required: false },
  { label: "HRA", value: "HRA", required: true },
  { label: "Conveyance Allowance", value: "CONV ALW", required: true },
  { label: "Medical Allowance", value: "MED ALW", required: true },
  { label: "Other Allowance", value: "OTHER ALW", required: true },
  { label: "Distance Allowance", value: "DIST ALW", required: true },
  { label: "Arrears", value: "ARREARS", required: true },
  { label: "Earned Salary (Gross)", value: "GROSS SALARY", required: true },
  // Deductions
  { label: "Provident Fund", value: "PROV.FUND", required: true },
  { label: "Voluntary PF (VPF)", value: "VPF", required: true },
  { label: "Professional Tax", value: "P.Tax", required: true },
  { label: "ESI", value: "ESI", required: true }, // Dependent on eligibility
  { label: "TDS/Income Tax", value: "TDS", required: true },
  { label: "Staff Loan", value: "STAFF LOAN", required: true },
  { label: "Salary Advance", value: "SAL ADV", required: true },
  { label: "Labour Welfare Fund (LWF)", value: "LWF", required: true },
  { label: "Mobile/Other Deduction", value: "MOBILE_DED", required: true },
  { label: "Other Deduction", value: "OTHER_DED", required: true },
  { label: "Medical Insurance", value: "MEDICAL_INS", required: true },
  { label: "Total Deductions", value: "TTL DED", required: true },
  { label: "Net Salary", value: "NET SALARY", required: true },
  // Attendance (Used in PDF)
  { label: "Days Paid", value: "Days Paid", required: true },
  { label: "Paid Offs", value: "Pd.Off", required: false },
  { label: "LWP/Absent", value: "LWP/Absent", required: false },
];

export const DEFAULT_COLUMNS = [
  { id: "1", header: "S.No.", systemField: "", showOnDashboard: false },
  {
    id: "2",
    header: "EMP CODE",
    systemField: "Emp Code",
    showOnDashboard: true,
  },
  {
    id: "3",
    header: "EMPLOYEE NAME",
    systemField: "Name",
    showOnDashboard: true,
  },
  {
    id: "4",
    header: "ACCOUNT NUMBER",
    systemField: "Bank Account",
    showOnDashboard: false,
  },
  { id: "5", header: "BANK NAME", systemField: "", showOnDashboard: false },
  { id: "6", header: "BRANCH NAME", systemField: "", showOnDashboard: false },
  { id: "7", header: "IFSC CODE", systemField: "IFSC", showOnDashboard: false },
  {
    id: "8",
    header: "DESIGNATION",
    systemField: "Designation",
    showOnDashboard: true,
  },
  {
    id: "9",
    header: "DEPARTMENT",
    systemField: "Department",
    showOnDashboard: true,
  },
  { id: "10", header: "DOJ", systemField: "DOJ", showOnDashboard: true },
  {
    id: "11",
    header: "LOCATION",
    systemField: "Location",
    showOnDashboard: true,
  },
  { id: "12", header: "EMAIL", systemField: "Email", showOnDashboard: true },
  {
    id: "13",
    header: "ESI IP NO.",
    systemField: "ESIC No",
    showOnDashboard: false,
  },
  { id: "14", header: "PF NO.", systemField: "PF No", showOnDashboard: false },
  { id: "15", header: "UAN NO.", systemField: "", showOnDashboard: false },
  { id: "16", header: "BASIC", systemField: "BASIC", showOnDashboard: false },
  { id: "17", header: "DA", systemField: "DA", showOnDashboard: false },
  { id: "18", header: "HRA", systemField: "HRA", showOnDashboard: false },
  {
    id: "19",
    header: "CONV ALW",
    systemField: "CONV ALW",
    showOnDashboard: false,
  },
  {
    id: "20",
    header: "MED ALW",
    systemField: "MED ALW",
    showOnDashboard: false,
  },
  {
    id: "21",
    header: "OTHER ALW",
    systemField: "OTHER ALW",
    showOnDashboard: false,
  },
  {
    id: "22",
    header: "DIST ALW",
    systemField: "DIST ALW",
    showOnDashboard: false,
  },
  {
    id: "23",
    header: "ARREARS",
    systemField: "ARREARS",
    showOnDashboard: false,
  },
  { id: "24", header: "GROSS SALARY", systemField: "", showOnDashboard: false },
  {
    id: "25",
    header: "PRESENT DAYS",
    systemField: "Days Paid",
    showOnDashboard: false,
  },
  // New Defaults matching User's Excel
  {
    id: "26",
    header: "EARNED SALARY",
    systemField: "GROSS SALARY",
    showOnDashboard: false,
  },
  { id: "27", header: "VPF", systemField: "VPF", showOnDashboard: false },
  {
    id: "28",
    header: "STAFF LOAN",
    systemField: "STAFF LOAN",
    showOnDashboard: false,
  },
  {
    id: "29",
    header: "SAL ADV",
    systemField: "SAL ADV",
    showOnDashboard: false,
  },
  { id: "30", header: "LWF", systemField: "LWF", showOnDashboard: false },
  {
    id: "31",
    header: "MOBILE/ OTHER DED",
    systemField: "MOBILE_DED",
    showOnDashboard: false,
  },
  {
    id: "32",
    header: "OTHER DEDUCTION",
    systemField: "OTHER_DED",
    showOnDashboard: false,
  },
  {
    id: "33",
    header: "MEDICAL INSURANCE",
    systemField: "MEDICAL_INS",
    showOnDashboard: false,
  },
  {
    id: "34",
    header: "TTL DED",
    systemField: "TTL DED",
    showOnDashboard: false,
  },
  {
    id: "35",
    header: "NET SALARY",
    systemField: "NET SALARY",
    showOnDashboard: true,
  },
];

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        // Also check if clicking inside the portal content (simple way is checking if target is inside a specific id/class, but simplistic 'click outside' on document usually handles it if we stop propagation on portal click, or just rely on state)
        // Actually with portal, the event.target might be in the portal.
        // We need to check if click is outside BOTH container AND portal.
        // Easier: The Portal content will capture its own clicks. We only close if click is "outside".
        // But event bubbling from Portal goes to React tree, so containerRef check might actually work if we wrap Portal in something?
        // No, physical DOM click outside.

        // Let's rely on standard logic: if we click "backdrop" (document), close.
        // But clicking inside Portal? event.target will be the portal element.
        // containerRef won't contain it.
        // So we need a ref for the dropdown menu too if we want to be precise.
        // Hack: Add class to dropdown and check closest.
        /*
                 - **Secondary Actions**: "Reset", "Upload Sample", and "New Column" use a clean **White/Slate** theme.
                 - **Action Buttons**:
                     - **"New Column"**: Uses a **Green Hover** effect for positive creation action.
                     - **"Upload Sample"**: Uses a **Purple Hover** effect for distinction.
                 - **Tabs**: Active tabs now underline with your Brand Color.
                */
        if (!event.target.closest(".custom-select-dropdown")) {
          setIsOpen(false);
        }
      }
    };

    const handleScroll = (event) => {
      // Check if scroll is coming from the dropdown itself
      if (
        event.target.classList?.contains?.("custom-select-dropdown") ||
        event.target.closest?.(".custom-select-dropdown")
      ) {
        return;
      }
      setIsOpen(false);
    };

    // Update handling:
    // If open, we add listener.
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Also close on scroll to avoid detached floating menu, but ignore inner scrolls
      document.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", () => setIsOpen(false));
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`w-full px-2 py-1 text-sm border rounded outline-none cursor-pointer flex items-center justify-between bg-white ${
          value
            ? "border-indigo-300 text-indigo-700 bg-indigo-50/50"
            : "border-slate-200 text-slate-600"
        }`}
        onClick={handleToggle}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ArrowDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} opacity-50`}
        />
      </div>

      {isOpen &&
        createPortal(
          <div
            className="custom-select-dropdown fixed z-9999 bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
            style={{
              top: coords.top + 4, // Add a little gap
              left: coords.left,
              width: coords.width,
              maxHeight: "240px",
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div
              className="px-3 py-2 text-slate-400 text-xs hover:bg-slate-50 cursor-pointer border-b border-slate-50"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
            >
              -- Ignore --
            </div>
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 flex items-center justify-between transition-colors ${
                  option.disabled
                    ? "opacity-50 cursor-not-allowed bg-slate-50"
                    : ""
                } ${option.value === value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"}`}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
              >
                <span className="truncate pr-2">
                  {option.prefix}
                  {option.label}
                  {option.suffix}
                </span>
                {option.value === value && (
                  <span className="text-indigo-600 shrink-0">✓</span>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  companyProfile,
  onUpdateProfile,
  verifyEmail,
  resetPassword,
  onRequestDelete,
  showToast,
}) {
  const [settingsTab, setSettingsTab] = useState("account");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    companyName: companyProfile?.name || "",
    companyAddress: companyProfile?.address || "",
    userName: companyProfile?.userName || "",
    logoFile: null,
    logoPreview: companyProfile?.logoUrl || "",
    brandColor: companyProfile?.brandColor || "#3b82f6",
    password: companyProfile?.password || "",
    confirmPassword: companyProfile?.password || "",
    smtpHost: companyProfile?.smtpHost || "",
    smtpPort: companyProfile?.smtpPort || "",
    smtpUser: companyProfile?.smtpUser || "",
    smtpPassword: companyProfile?.smtpPassword || "",
    smtpSecure: companyProfile?.smtpSecure || false,
    columnMapping: companyProfile?.columnMapping || DEFAULT_COLUMNS,
    titleRows: companyProfile?.titleRows || 0,
    monthCell: companyProfile?.monthCell || "",
    yearCell: companyProfile?.yearCell || "",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  // Update form when companyProfile changes
  useEffect(() => {
    if (companyProfile) {
      setSettingsForm((prev) => ({
        ...prev,
        companyName: companyProfile.name || "",
        companyAddress: companyProfile.address || "",
        userName: companyProfile.userName || "",
        logoPreview: companyProfile.logoUrl || "",
        brandColor: companyProfile.brandColor || "#3b82f6",
        password: companyProfile.password || "",
        confirmPassword: companyProfile.password || "",
        smtpHost: companyProfile.smtpHost || "",
        smtpPort: companyProfile.smtpPort || "",
        smtpUser: companyProfile.smtpUser || "",
        smtpPassword: companyProfile.smtpPassword || "",
        smtpSecure: companyProfile.smtpSecure || false,
        columnMapping: companyProfile.columnMapping || DEFAULT_COLUMNS,
        titleRows: companyProfile.titleRows || 0,
        monthCell: companyProfile.monthCell || "",
        yearCell: companyProfile.yearCell || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyProfile]);

  // Reset tab to 'account' when modal opens
  // Reset tab to 'account' when modal opens and lock body scroll
  useEffect(() => {
    if (isOpen) {
      setSettingsTab("account");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const updateColumn = (index, field, value) => {
    const newCols = [...settingsForm.columnMapping];
    newCols[index] = { ...newCols[index], [field]: value };
    setSettingsForm({ ...settingsForm, columnMapping: newCols });
  };

  const removeColumn = (index) => {
    const newCols = settingsForm.columnMapping.filter((_, i) => i !== index);
    setSettingsForm({ ...settingsForm, columnMapping: newCols });
  };

  const addColumn = () => {
    const newCol = {
      id: Date.now().toString(),
      header: "New Column",
      systemField: "",
      showOnDashboard: false,
    };
    setSettingsForm({
      ...settingsForm,
      columnMapping: [...settingsForm.columnMapping, newCol],
    });
  };

  const handleSettingsLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm({
          ...settingsForm,
          logoFile: file,
          logoPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Get all data as arrays to handle indexing manually
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const titleRows = settingsForm.titleRows || 0;
      const headerRowIndex = titleRows; // 0-based index of the header row

      if (jsonData.length <= headerRowIndex) {
        showToast(
          "File contains fewer rows than the specified Title Rows to Skip.",
          "error",
        );
        return;
      }

      const headers = jsonData[headerRowIndex];

      if (!headers || !Array.isArray(headers)) {
        showToast("Could not detect headers in the specified row.", "error");
        return;
      }

      // Generate new mapping based on detected headers
      const newMapping = headers.map((header, index) => {
        // Try to auto-match with existing system fields if name is similar
        // or preserve existing mapping if it matches the header name
        const cleanHeader = String(header || `Column ${index + 1}`).trim();

        // Check if we have an existing system mapping for this EXACT header name
        const existing = settingsForm.columnMapping.find(
          (c) => c.header === cleanHeader,
        );

        // User Request: Do not auto-prefill. Default to Ignore.
        // We typically preserve 'existing' if the user is reloading the same file to just add a column,
        // but if they want "Ignore for all", maybe they want to clear existing too?
        // The prompt says "do not select on prfill basis keep select --ignore-- for all when user reset".
        // We'll keep 'existing' if it matches exactly (safe), but DISABLE the fuzzy matching.

        let systemField = existing ? existing.systemField : "";
        let showOnDashboard = existing ? existing.showOnDashboard : false;

        // REMOVED: Heuristic matching block

        return {
          id: Date.now().toString() + index,
          header: cleanHeader,
          index: index, // CRITICAL: Save Index
          systemField: systemField,
          showOnDashboard: showOnDashboard,
        };
      });

      setSettingsForm((prev) => ({
        ...prev,
        columnMapping: newMapping,
      }));
      showToast("Columns detected and mapped from sample file!", "success");
    };
    reader.readAsBinaryString(file);
  };

  const handleResetMapping = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Mapping",
      message:
        "Are you sure you want to reset the column mapping to defaults? This will clear all custom indices and mappings.",
      type: "warning",
      onConfirm: () => {
        setSettingsForm((prev) => ({
          ...prev,
          columnMapping: [],
          titleRows: 0,
        }));
        showToast("All mappings cleared", "success");
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const handleSave = () => {
    // Validate Data Format if that tab was touched or just generally before save
    // We only enforcing mandatory fields if we are saving column mapping

    const missingFields = [];
    SYSTEM_FIELDS.forEach((field) => {
      if (field.required) {
        // Check if this system field is mapped in current settings
        const isMapped = settingsForm.columnMapping.some(
          (col) => col.systemField === field.value,
        );
        if (!isMapped) {
          missingFields.push(field.label);
        }
      }
    });

    if (missingFields.length > 0) {
      showToast(
        `Missing mandatory fields: ${missingFields.join(", ")}`,
        "error",
      );
      // If we are not on the data_format tab, maybe switch to it?
      // For now just error is enough to block save
      if (settingsTab !== "data_format") {
        setSettingsTab("data_format");
      }
      return;
    }

    onUpdateProfile(settingsForm);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ "--brand-color": settingsForm.brandColor || "#4f46e5" }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Settings Tabs */}
        <div className="flex border-b border-slate-200 px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <button
            onClick={() => setSettingsTab("account")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              settingsTab === "account"
                ? "border-(--brand-color) text-(--brand-color)"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setSettingsTab("branding")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              settingsTab === "branding"
                ? "border-(--brand-color) text-(--brand-color)"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Branding
          </button>
          <button
            onClick={() => setSettingsTab("smtp")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              settingsTab === "smtp"
                ? "border-(--brand-color) text-(--brand-color)"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            SMTP Config
          </button>
          <button
            onClick={() => setSettingsTab("data_format")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              settingsTab === "data_format"
                ? "border-(--brand-color) text-(--brand-color)"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Excel Format
          </button>
          <button
            onClick={() => setSettingsTab("security")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              settingsTab === "security"
                ? "border-(--brand-color) text-(--brand-color)"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Security
          </button>
        </div>

        <div className="p-6 min-h-[300px]">
          {/* Account Tab */}
          {settingsTab === "account" && (
            <div className="space-y-6">
              {/* Email Verification Status */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-700">
                    Email Status
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${user?.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {user?.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <p className="text-sm text-slate-800 font-medium mb-3">
                  {user?.email}
                </p>
                {!user?.emailVerified && (
                  <button
                    onClick={async () => {
                      if (isVerifyingEmail) return;
                      setIsVerifyingEmail(true);
                      try {
                        await verifyEmail();
                        showToast(
                          "Verification email sent to " + user.email,
                          "success",
                        );
                      } catch (e) {
                        console.error("Verification Error:", e);
                        if (
                          e.code === "auth/too-many-requests" ||
                          e.message?.includes("TOO_MANY_ATTEMPTS_TRY_LATER")
                        ) {
                          showToast(
                            "Too many attempts. Please check your inbox or try again later.",
                            "error",
                          );
                        } else {
                          showToast("Error: " + e.message, "error");
                        }
                      } finally {
                        setIsVerifyingEmail(false);
                      }
                    }}
                    disabled={isVerifyingEmail}
                    className={`text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer ${isVerifyingEmail ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isVerifyingEmail
                      ? "Sending..."
                      : "Send Verification Email"}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      User Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={settingsForm.userName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          userName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.companyName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Company Address
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.companyAddress}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        companyAddress: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {settingsTab === "branding" && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border">
                      {settingsForm.logoPreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settingsForm.logoPreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </>
                      ) : (
                        <Building2 className="text-slate-400" size={24} />
                      )}
                    </div>
                    <label className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition shadow-sm">
                      Change Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSettingsLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsForm.brandColor}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          brandColor: e.target.value,
                        })
                      }
                      className="w-10 h-10 p-1 rounded border cursor-pointer"
                    />
                    <span className="text-sm font-mono text-slate-600">
                      {settingsForm.brandColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SMTP Tab */}
          {settingsTab === "smtp" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg flex items-start gap-3 mb-4">
                <Server className="text-amber-600 mt-0.5" size={18} />
                <p className="text-xs text-amber-800">
                  Configure or update your SMTP server details for email
                  delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SMTP Host
                  </label>
                  <div className="relative">
                    <Server
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="smtp.example.com"
                      value={settingsForm.smtpHost}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          smtpHost: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SMTP Port
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                      #
                    </div>
                    <input
                      type="text"
                      placeholder="587"
                      value={settingsForm.smtpPort}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          smtpPort: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="email@example.com"
                    value={settingsForm.smtpUser}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        smtpUser: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="password"
                      placeholder="SMTP Password"
                      value={settingsForm.smtpPassword}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          smtpPassword: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="modalSmtpSecure"
                  checked={settingsForm.smtpSecure}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      smtpSecure: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="modalSmtpSecure"
                  className="text-sm text-slate-700"
                >
                  Use Secure Connection (SSL/TLS)
                </label>
              </div>
            </div>
          )}

          {/* Data Format Tab */}
          {settingsTab === "data_format" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Title Rows to Skip
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Number of rows to skip at the top of the Excel file before
                    the header row starts. (e.g., if headers are on Row 3, skip
                    2 rows).
                  </p>
                  <div className="flex items-end gap-4">
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.titleRows}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          titleRows: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-24 px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Month and Year Cell Mapping (Optional)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Specify exact cell coordinates for Month and
                    Year values. If set, the system will extract these values
                    from the uploaded file.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        Month Cell
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. C2"
                        value={settingsForm.monthCell || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            monthCell: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        Year Cell
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. D3"
                        value={settingsForm.yearCell || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            yearCell: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <div className="col-span-1 text-center">Idx</div>
                    <div className="col-span-4">Excel Header</div>
                    <div className="col-span-3">System Field</div>
                    <div className="col-span-2 text-center">Dashboard</div>
                    <div className="col-span-2 text-center">Actions</div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {settingsForm.columnMapping.map((col, index) => (
                      <div
                        key={col.id}
                        className="grid grid-cols-12 gap-2 p-3 border-b border-slate-100 items-center hover:bg-slate-50"
                      >
                        {/* Order / Index */}
                        <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                          <span className="text-xs font-bold text-slate-400">
                            {col.index !== undefined ? col.index + 1 : "-"}
                          </span>
                        </div>

                        {/* Header Name */}
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={col.header}
                            onChange={(e) =>
                              updateColumn(index, "header", e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        {/* System Field Select */}
                        <div className="col-span-3">
                          <CustomSelect
                            value={col.systemField}
                            onChange={(val) =>
                              updateColumn(index, "systemField", val)
                            }
                            placeholder="-- Ignore --"
                            options={SYSTEM_FIELDS.map((field) => {
                              // Check if mapped by anyone (including self, to show status in list)
                              const isMapped = settingsForm.columnMapping.some(
                                (c) => c.systemField === field.value,
                              );
                              // Check if mapped by OTHERS (to disable if unique required, though user seems properly ok with duplicates, we just show indicator)
                              // User asked to SHOW TICK if mapped using "prefix". They didn't explicitly say disable.
                              // Previous code had: disabled={isMapped}.
                              // But isMapped included "c.id !== col.id" check.
                              // If I want to allow re-selecting self, I should allow it.
                              const isMappedByOther =
                                settingsForm.columnMapping.some(
                                  (c) =>
                                    c.systemField === field.value &&
                                    c.id !== col.id,
                                );

                              return {
                                value: field.value,
                                label: field.label,
                                prefix: isMapped ? "✓ " : "", // Show tick if mapped by ANYONE (so I know it's taken)
                                suffix: field.required ? " *" : "",
                                disabled: isMappedByOther, // Disable if taken - REVERTED per user request
                              };
                            })}
                          />
                        </div>

                        {/* Show on Dashboard Checkbox */}
                        <div className="col-span-2 flex justify-center">
                          <input
                            type="checkbox"
                            checked={col.showOnDashboard || false}
                            onChange={(e) =>
                              updateColumn(
                                index,
                                "showOnDashboard",
                                e.target.checked,
                              )
                            }
                            style={{ accentColor: "var(--brand-color)" }}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>

                        {/* Remove */}
                        <div className="col-span-2 text-center">
                          <button
                            onClick={() => removeColumn(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {settingsTab === "security" && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  Need to change your password? We can send you a secure link to
                  reset it.
                </p>
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        "Send password reset email to " + user.email + "?",
                      )
                    ) {
                      try {
                        await resetPassword(user.email);
                        showToast("Password reset email sent!", "success");
                      } catch (e) {
                        showToast("Error: " + e.message, "error");
                      }
                    }
                  }}
                  className="px-4 py-2 bg-white text-blue-600 font-medium text-sm rounded border border-blue-200 shadow-sm hover:bg-blue-50 transition cursor-pointer"
                >
                  Send Password Reset Email
                </button>
              </div>

              {/* Delete Company Profile Section */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-bold text-red-900 mb-2">
                  Delete Company Profile
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  Permanently delete your company profile and all associated
                  data. This action cannot be undone and requires OTP
                  verification.
                </p>
                <button
                  onClick={() => {
                    if (typeof onRequestDelete === "function") {
                      onRequestDelete();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded shadow-sm hover:bg-red-700 transition cursor-pointer"
                >
                  Delete Company Profile
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:justify-between gap-3 rounded-b-xl items-center">
          {/* Left Group: Excel Actions (Visible only on data_format) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {settingsTab === "data_format" && (
              <>
                <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition shadow-sm order-1">
                  <Upload size={16} />
                  Upload Sample
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleSampleUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleResetMapping}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-sm font-medium rounded-lg transition shadow-sm order-2"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button
                  onClick={addColumn}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-700 text-sm font-medium rounded-lg transition shadow-sm order-3"
                  title="Add New Column"
                >
                  <Plus size={16} />
                  New Column
                </button>
              </>
            )}
          </div>

          {/* Right Group: Main Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer text-center order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-(--brand-color) hover:brightness-90 rounded-lg shadow-sm transition cursor-pointer order-1 sm:order-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Nested Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
