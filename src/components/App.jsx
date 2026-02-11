"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { generatePDF, generatePDFBase64 } from "@/utils/pdfGenerator";
import {
  LogOut,
  Settings,
  Eye,
  Download,
  CheckSquare,
  Square,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Components
import SettingsModal, { DEFAULT_COLUMNS } from "./modals/SettingsModal";
import PayslipPreviewModal from "./modals/PayslipPreviewModal";
import ConfirmModal from "./modals/ConfirmModal";
import EmployeeDetailsModal from "./modals/EmployeeDetailsModal";
import OTPVerificationModal from "./modals/OTPVerificationModal";
import LoginForm from "./auth/LoginForm";
import SetupWizard from "./auth/SetupWizard";
import ImportCard from "./dashboard/ImportCard";
import PayrollSummary from "./dashboard/PayrollSummary";
import Footer from "./layout/Footer";
import Toast from "./ui/Toast";

export default function App() {
  const [currentView, setCurrentView] = useState("loading");
  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing system...",
  );
  const [setupStep, setSetupStep] = useState(1);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [sendingProgress, setSendingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [isSending, setIsSending] = useState(false);
  const { user, login, signup, logout, loading, verifyEmail, resetPassword } =
    useAuth();
  // Add this new state near your other state declarations
const [failedEmails, setFailedEmails] = useState([]);
  // Form states
  const [setupForm, setSetupForm] = useState({
    companyName: "",
    companyAddress: "",
    businessPhone: "",
    logoFile: null,
    logoPreview: "",
    brandColor: "#3b82f6",
    adminEmail: "",
    password: "",
    confirmPassword: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: false,
  });

  const [loginPassword, setLoginPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag to prevent overwriting local storage on init
  const hasCheckedProfile = useRef(false); // Track if we've checked profile to prevent redundant checks
  const prevUserRef = useRef(user); // Track previous user to detect auth state changes

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [viewingEmployee, setViewingEmployee] = useState(null); // For Payslip Preview PDF Modal
  const [viewDetailsEmployee, setViewDetailsEmployee] = useState(null); // For Full Details Modal

  // Payroll Period State (Extracted from Excel or Default)
  const [payrollMonth, setPayrollMonth] = useState("");
  const [payrollYear, setPayrollYear] = useState("");
  const [isPeriodFromExcel, setIsPeriodFromExcel] = useState(false);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  // Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleRequestDelete = () => {
    setIsSettingsOpen(false);
    setIsOTPModalOpen(true);
  };

  const handleOTPVerified = async (verified) => {
    if (!verified) {
      setIsOTPModalOpen(false);
      return;
    }

    try {
      const response = await fetch("/api/delete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOTPModalOpen(false);
        showToast("Company profile deleted successfully", "success");

        // Log out and redirect to setup
        setTimeout(async () => {
          await logout();
          setCurrentView("setup");
          setCompanyProfile(null);
        }, 2000);
      } else {
        setIsOTPModalOpen(false);
        showToast(data.error || "Failed to delete profile", "error");
      }
    } catch (error) {
      showToast(
        "Error deleting profile: " + (error.message || "Unknown error"),
        "error",
      );
      setIsOTPModalOpen(false);
      showToast("Network error. Please try again.", "error");
    }
  };

  // Load persisted data on mount
  useEffect(() => {
    // 1. Load Employees
    const savedData = localStorage.getItem("techser_payroll_data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setEmployees(parsedData);
        }
      } catch (error) {
        showToast("Failed to load local data: " + error.message, "error");
      }
    }

    // 2. Load Period (Month/Year)
    const savedPeriod = localStorage.getItem("techser_payroll_period");
    let periodLoaded = false;

    if (savedPeriod) {
      try {
        const parsedPeriod = JSON.parse(savedPeriod);
        if (parsedPeriod.month && parsedPeriod.year) {
          setPayrollMonth(parsedPeriod.month);
          setPayrollYear(parsedPeriod.year);
          setIsPeriodFromExcel(parsedPeriod.isFromExcel || false);
          periodLoaded = true;
        }
      } catch (error) {
        console.error("Failed to load saved period", error);
      }
    }

    // Default if not loaded
    if (!periodLoaded) {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      setPayrollMonth(date.toLocaleString("default", { month: "long" }));
      setPayrollYear(date.getFullYear().toString());
      setIsPeriodFromExcel(false);
    }

    setIsDataLoaded(true);
  }, []);

  // Save data to local storage whenever it changes
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("techser_payroll_data", JSON.stringify(employees));

      // Save Period
      localStorage.setItem(
        "techser_payroll_period",
        JSON.stringify({
          month: payrollMonth,
          year: payrollYear,
          isFromExcel: isPeriodFromExcel,
        }),
      );
    }
  }, [employees, payrollMonth, payrollYear, isPeriodFromExcel, isDataLoaded]);

  const checkCompanyProfile = async () => {
    try {
      setLoadingMessage("Checking company profile...");

      const profileRef = doc(db, "companies", "main-profile");
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setCompanyProfile(data);

        if (user) {
          setCurrentView("dashboard");
        } else {
          setCurrentView("login");
        }
      } else {
        setCurrentView("setup");
      }
    } catch (error) {
      setCurrentView("setup");
    }
  };

  // Check for existing company profile on load
  useEffect(() => {
    // Reset check flag when user auth state changes (login/logout)
    if (prevUserRef.current !== user) {
      hasCheckedProfile.current = false;
      prevUserRef.current = user;
    }

    // Only check profile once per user state
    if (!loading && !hasCheckedProfile.current) {
      hasCheckedProfile.current = true;

      // If user is logged in and we already have a profile, skip Firestore check
      if (user && companyProfile) {
        setCurrentView("dashboard");
        return;
      }

      checkCompanyProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Update Brand Color CSS Variable
  useEffect(() => {
    if (companyProfile?.brandColor) {
      document.documentElement.style.setProperty(
        "--brand-color",
        companyProfile.brandColor,
      );
    } else {
      document.documentElement.style.setProperty("--brand-color", "#4f46e5"); // Default Indigo
    }
  }, [companyProfile]);

  const handleSetupSubmit = async () => {
    try {
      if (setupStep === 1) {
        if (!setupForm.companyName || !setupForm.companyAddress) {
          setErrorMessage("Please fill in all required fields");
          return;
        }
        setSetupStep(2);
        setErrorMessage("");
        return;
      }

      if (setupStep === 2) {
        setSetupStep(3);
        setErrorMessage("");
        return;
      }

      if (setupStep === 3) {
        if (setupForm.password !== setupForm.confirmPassword) {
          setErrorMessage("Passwords do not match");
          return;
        }

        if (setupForm.password.length < 6) {
          setErrorMessage("Password must be at least 6 characters");
          return;
        }

        setSetupStep(4);
        setErrorMessage("");
        return;
      }

      let logoUrl = setupForm.logoPreview || "";

      const profile = {
        name: setupForm.companyName.trim(),
        address: setupForm.companyAddress.trim(),
        hrEmail: setupForm.adminEmail.trim(),
        logoUrl,
        logoUrl,
        brandColor: setupForm.brandColor,
        senderName: setupForm.companyName.trim(),
        smtpHost: setupForm.smtpHost?.trim() || "",
        smtpPort: setupForm.smtpPort?.trim() || "",
        smtpUser: setupForm.smtpUser?.trim() || "",
        smtpPassword: setupForm.smtpPassword || "",
        smtpSecure: setupForm.smtpSecure || false,
      };

      await signup(setupForm.adminEmail.trim(), setupForm.password);
      await setDoc(doc(db, "companies", "main-profile"), profile);
      setCompanyProfile(profile);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Logo Upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSetupForm({
          ...setupForm,
          logoFile: file,
          logoPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (updatedSettings) => {
    try {
      if (!updatedSettings.companyName || !updatedSettings.companyAddress) {
        alert("Company Name and Address are required");
        return;
      }

      const updatedProfile = {
        ...companyProfile,
        name: updatedSettings.companyName,
        address: updatedSettings.companyAddress,
        userName: updatedSettings.userName,
        brandColor: updatedSettings.brandColor,
        logoUrl: updatedSettings.logoPreview || companyProfile.logoUrl,
        smtpHost: updatedSettings.smtpHost,
        smtpPort: updatedSettings.smtpPort,
        smtpUser: updatedSettings.smtpUser,
        smtpPassword: updatedSettings.smtpPassword,
        smtpSecure: updatedSettings.smtpSecure,
        smtpSecure: updatedSettings.smtpSecure,
        columnMapping:
          updatedSettings.columnMapping || companyProfile.columnMapping,
        titleRows: updatedSettings.titleRows || 0,
        monthCell: updatedSettings.monthCell || "",
        yearCell: updatedSettings.yearCell || "",
      };
      await setDoc(doc(db, "companies", "main-profile"), updatedProfile, {
        merge: true,
      });
      setCompanyProfile(updatedProfile);
      setIsSettingsOpen(false);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast("Error updating profile: " + error.message, "error");
    }
  };

  const handleLogin = async () => {
    try {
      if (!companyProfile?.hrEmail) {
        setErrorMessage(
          "System Error: No admin email found. Please contact support or reset.",
        );
        return;
      }
      await login(companyProfile.hrEmail, loginPassword);
      setErrorMessage("");
      showToast("Login successful", "success");
    } catch (error) {
      // Only log unexpected errors to keep console clean in dev/prod
      if (
        error.code !== "auth/invalid-credential" &&
        error.code !== "auth/wrong-password"
      ) {
        showToast("System Error: " + error.message, "error");
      }

      let msg = "";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        msg = "Incorrect password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later.";
      } else {
        msg = "Login failed: " + error.message;
      }
      setErrorMessage(msg);
      showToast(msg, "error");
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Extract Month/Year if configured
      let extractedMonth = "";
      let extractedYear = "";
      let fromExcel = false;

      if (companyProfile?.monthCell && companyProfile?.yearCell) {
        const monthCell = worksheet[companyProfile.monthCell];
        const yearCell = worksheet[companyProfile.yearCell];

        if (monthCell && yearCell) {
          // Start with raw values
          let mVal = monthCell.v;
          let yVal = yearCell.v;

          // Parse Month
          if (typeof mVal === "number") {
            // Assume 1-12
            if (mVal >= 1 && mVal <= 12) {
              const date = new Date();
              date.setMonth(mVal - 1);
              extractedMonth = date.toLocaleString("default", {
                month: "long",
              });
            }
          } else if (typeof mVal === "string") {
            extractedMonth = mVal.trim();
          }

          // Parse Year
          extractedYear = String(yVal).trim();

          if (extractedMonth && extractedYear) {
            fromExcel = true;
          }
        }
      }

      // Set Period
      if (fromExcel) {
        setPayrollMonth(extractedMonth);
        setPayrollYear(extractedYear);
        setIsPeriodFromExcel(true);
        showToast(
          `Period Detected: ${extractedMonth} ${extractedYear}`,
          "success",
        );
      } else {
        // Fallback to default if not detected or not configured
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        setPayrollMonth(date.toLocaleString("default", { month: "long" }));
        setPayrollYear(date.getFullYear().toString());
        setIsPeriodFromExcel(false);
      }

      // Get all data as arrays (header: 1) to use index-based mapping
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Determine start row (Title Rows + 1 for Header Row) -> Data starts after that
      const titleRows = companyProfile?.titleRows || 0;
      const dataStartRow = titleRows + 1; // 0-based index where data starts

      if (jsonData.length <= dataStartRow) {
        showToast("File data not found. Check 'Title Rows' setting.", "error");
        return;
      }

      // Extract only data rows
      const dataRows = jsonData.slice(dataStartRow);

      const processedData = dataRows
        .map((row, index) => {
          // If row is empty, skip or handle (map might return empty object which we can filter later if needed, but here we process)
          if (!row || row.length === 0) return {};

          const getVal = (key) => {
            // 1. Try to find mapping by system field
            if (companyProfile?.columnMapping) {
              const col = companyProfile.columnMapping.find(
                (c) => c.systemField === key,
              );
              if (col) {
                // PRIORITIZE INDEX IF AVAILABLE
                if (col.index !== undefined && col.index !== null) {
                  return row[col.index];
                }
                // Fallback to Header Name (legacy or if index missing)?
                // With array mode, we only have indices. So we CANNOT use header name lookup on 'row'.
                // We must rely on index.
                return undefined;
              }
            }
            // 2. Fallback: If no mapping, we can't guess index for "BASIC" etc.
            return undefined;
          };

          const basic = Number(getVal("BASIC") || 0);
          const da = Number(getVal("DA") || 0);
          const hra = Number(getVal("HRA") || 0);
          const conv = Number(getVal("CONV ALW") || 0);
          const med = Number(getVal("MED ALW") || 0);
          const other = Number(getVal("OTHER ALW") || 0);
          const distAlw = Number(getVal("DIST ALW") || 0);
          const arrears = Number(getVal("ARREARS") || 0);
          const pf = Number(getVal("PROV.FUND") || 0);
          const pt = Number(getVal("P.Tax") || 0);
          const esi = Number(getVal("ESI") || 0); // ESIC No is usually the ID, ESI is the amount. Mapping might be tricky if names overlap.
          const tds = Number(getVal("TDS") || 0);

          // New Deductions
          const vpf = Number(getVal("VPF") || 0);
          const staffLoan = Number(getVal("STAFF LOAN") || 0);
          const salAdv = Number(getVal("SAL ADV") || 0);
          const lwf = Number(getVal("LWF") || 0);
          const mobileDed = Number(getVal("MOBILE_DED") || 0);
          const otherDed = Number(getVal("OTHER_DED") || 0);
          const medicalIns = Number(getVal("MEDICAL_INS") || 0);

          // Check for User-provided Totals to override calculation
          const userGross = Number(getVal("GROSS SALARY") || 0);
          const userTotalDed = Number(getVal("TTL DED") || 0);
          const userNet = Number(getVal("NET SALARY") || 0);

          let gross = basic + da + hra + conv + med + other + distAlw + arrears;
          let deductions =
            pf +
            pt +
            esi +
            tds +
            vpf +
            staffLoan +
            salAdv +
            lwf +
            mobileDed +
            otherDed +
            medicalIns;

          // Override if user provided explicitly
          if (userGross > 0) gross = userGross;
          if (userTotalDed > 0) deductions = userTotalDed;

          // Use mapped Net Salary directly (User request: don't calculate)
          let netPay = userNet;

          // Difference Check
          const calculatedNet = gross - deductions;
          const mismatch = Math.abs(calculatedNet - netPay) > 1.0; // Allow 1.0 tolerance

          // Fallback only if absolutely creating a new record and no net provided?
          // No, sticking to user instruction: "don't calculate"
          // if (netPay === 0) netPay = gross - deductions;

          // Construct mapped object
          const mappedEmp = {};
          mappedEmp["__autoSerial"] = index + 1;

          // Populate Mapped Fields (for display in table dynamic columns)
          if (companyProfile?.columnMapping) {
            companyProfile.columnMapping.forEach((col) => {
              if (col.systemField) {
                // Map system field -> value at index
                if (col.index !== undefined) {
                  mappedEmp[col.systemField] = row[col.index];
                }
              } else {
                // Map Header Name -> value at index (for non-system columns displayed on dashboard)
                if (col.index !== undefined) {
                  mappedEmp[col.header] = row[col.index];
                }
              }
            });
          }

          // Explicitly set calculated/standard fields
          mappedEmp["Net Pay"] = netPay;
          mappedEmp["BASIC"] = basic;
          mappedEmp["DA"] = da;
          mappedEmp["HRA"] = hra;
          mappedEmp["CONV ALW"] = conv;
          mappedEmp["MED ALW"] = med;
          mappedEmp["OTHER ALW"] = other;
          mappedEmp["DIST ALW"] = distAlw;
          mappedEmp["ARREARS"] = arrears;
          mappedEmp["PROV.FUND"] = pf;
          mappedEmp["P.Tax"] = pt;
          mappedEmp["ESI"] = esi;
          mappedEmp["TDS"] = tds;
          mappedEmp["VPF"] = vpf;
          mappedEmp["STAFF LOAN"] = staffLoan;
          mappedEmp["SAL ADV"] = salAdv;
          mappedEmp["LWF"] = lwf;
          mappedEmp["MOBILE_DED"] = mobileDed;
          mappedEmp["OTHER_DED"] = otherDed;
          mappedEmp["MEDICAL_INS"] = medicalIns;
          mappedEmp["TTL DED"] = userTotalDed;
          mappedEmp["NET SALARY"] = userNet;
          mappedEmp["GROSS SALARY"] = userGross;
          mappedEmp["__mismatch"] = mismatch;
          mappedEmp["__calculatedNet"] = calculatedNet;

          // Handle Date (DOJ)
          const dojVal = getVal("DOJ");
          if (dojVal) {
            // If it comes from Excel as number (serial), handle it?
            // Usually raw value is fine if string.
            // For serial date (common in Index mode readout if type is not string):
            if (typeof dojVal === "number") {
              // Convert Excel serial to date if needed, or just store.
              // EmployeeDetailsModal handles formatExcelDate. So passing number is fine!
              mappedEmp["DOJ"] = dojVal;
            } else {
              mappedEmp["DOJ"] = dojVal;
            }
          }

          return mappedEmp;
        })
        .filter(
          (emp) =>
            emp &&
            Object.keys(emp).length > 0 &&
            (emp["Net Pay"] !== undefined || emp["Name"] || emp["Emp Code"]),
        ); // Basic filter for empty rows

      setEmployees(processedData);
      showToast(
        `Successfully imported ${processedData.length} employees`,
        "success",
      );
    };
    reader.readAsBinaryString(file);
  };

  const handleReset = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Payroll Data",
      message:
        "Are you sure you want to reset all payroll data? This will remove all imported employees and cannot be undone.",
      type: "danger",
      onConfirm: () => {
        setEmployees([]);
        setSelectedEmployees([]);
        setIsPeriodFromExcel(false); // Reset period origin
        // Reset to default period
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        setPayrollMonth(date.toLocaleString("default", { month: "long" }));
        setPayrollYear(date.getFullYear().toString());

        showToast("Payroll data has been reset.", "success");
      },
    });
  };

  const handleDownloadSingle = (employee) => {
    // Use Global Period
    const doc = generatePDF(
      employee,
      payrollMonth,
      payrollYear,
      companyProfile,
    );
    doc.save(
      `Payslip_${employee.Name || "Employee"}_${payrollMonth}_${payrollYear}.pdf`,
    );
  };

  const handleView = (employee) => {
    setViewingEmployee(employee);
  };

  const handleRowClick = (employee) => {
    setViewDetailsEmployee(employee);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((_, idx) => idx));
    }
  };

  const toggleSelect = (index) => {
    if (selectedEmployees.includes(index)) {
      setSelectedEmployees(selectedEmployees.filter((i) => i !== index));
    } else {
      setSelectedEmployees([...selectedEmployees, index]);
    }
  };

  // const executeSendPayslips_old = async () => {
  //   const targetIndices =
  //     selectedEmployees.length > 0
  //       ? selectedEmployees
  //       : employees.map((_, i) => i);
  //   if (targetIndices.length === 0) return;

  //   setIsSending(true);
  //   setSendingProgress({ current: 0, total: targetIndices.length });

  //   // Use Global Period
  //   const month = payrollMonth;
  //   const year = payrollYear;

  //   for (let i = 0; i < targetIndices.length; i++) {
  //     const empIndex = targetIndices[i];
  //     const employee = employees[empIndex];
  //     setSendingProgress({ current: i + 1, total: targetIndices.length });

  //     try {
  //       const pdfBase64 = generatePDFBase64(
  //         employee,
  //         month,
  //         year,
  //         companyProfile,
  //       );

  //       const response = await fetch("/api/send-email", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           employeeName: employee.Name,
  //           employeeEmail: employee.Email,
  //           pdfBase64,
  //           month,
  //           year,
  //           netSalary: employee["Net Pay"],
  //           designation: employee.Designation,
  //           brandColor: companyProfile?.brandColor,
  //           companyName: companyProfile?.name,
  //         }),
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         showToast(
  //           `Failed to send email to ${employee.Email}: ` +
  //             (errorData.details || errorData.error),
  //           "error",
  //         );
  //       }
  //     } catch (error) {
  //       showToast(
  //         `Error sending to ${employee.Name}: ` + error.message,
  //         "error",
  //       );
  //     }
  //   }

  //   setIsSending(false);
  //   showToast("All payslips sent successfully!", "success");
  // };


  
const ErrorSummaryModal = ({ isOpen, onClose, failedList }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 text-amber-600">
          <AlertTriangle size={24} />
          <h3 className="text-xl font-bold">Email Sending Summary</h3>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 text-sm mb-4">
            The following {failedList.length} email(s) could not be sent. Please check their email addresses or SMTP settings.
          </p>
          
          <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
            <ul className="divide-y divide-slate-200">
              {failedList.map((error, idx) => (
                <li key={idx} className="p-3 text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={() => {
              const text = failedList.join('\n');
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard!");
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Copy List
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium white bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const executeSendPayslips = async () => {
    const targetIndices = selectedEmployees.length > 0 ? selectedEmployees : employees.map((_, i) => i);
    if (targetIndices.length === 0) return;

    setIsSending(true);
    setFailedEmails([]); // Clear state
    let localFailures = []; // TRACK LOCALLY to trigger modal immediately
    setSendingProgress({ current: 0, total: targetIndices.length });

    const BATCH_SIZE = 5;
    const MAX_RETRIES = 3;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < targetIndices.length; i += BATCH_SIZE) {
      const currentBatch = targetIndices.slice(i, i + BATCH_SIZE);

      await Promise.all(currentBatch.map(async (empIndex) => {
        const employee = employees[empIndex];
        let attempt = 0;
        let success = false;

        // Validation
        if (!employee.Email || employee.Email.trim() === "") {
          localFailures.push(`${employee.Name || 'Unknown'} (Missing Email)`);
          return;
        }

        while (attempt < MAX_RETRIES && !success) {
          try {
            const pdfBase64 = generatePDFBase64(employee, payrollMonth, payrollYear, companyProfile);
            const res = await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                employeeName: employee.Name,
                employeeEmail: employee.Email,
                pdfBase64,
                month: payrollMonth,
                year: payrollYear,
                netSalary: employee["Net Pay"],
                brandColor: companyProfile?.brandColor,
                companyName: companyProfile?.name,
              }),
            });
            if (!res.ok) throw new Error("SMTP Error");
            success = true;
          } catch (err) {
            attempt++;
            if (attempt < MAX_RETRIES) await delay(2000 * attempt);
            else localFailures.push(`${employee.Name} (SMTP Failed)`);
          }
        }
      }));

      const progress = Math.min(i + BATCH_SIZE, targetIndices.length);
      setSendingProgress({ current: progress, total: targetIndices.length });
      if (progress < targetIndices.length) await delay(1000);
    }

    // FINALIZATION
    setFailedEmails(localFailures);
    setIsSending(false);

    if (localFailures.length > 0) {
      setIsErrorModalOpen(true); // TRIGGER MODAL
      showToast(`${localFailures.length} issues found.`, "warning");
    } else {
      showToast("All payslips sent successfully!", "success");
    }
  };

  const sendPayslips = () => {
    const count =
      selectedEmployees.length > 0
        ? selectedEmployees.length
        : employees.length;
    if (count === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Send Payslips via Email",
      message: `Are you sure you want to send payslips to ${count} employee(s)? This will send emails immediately to their registered addresses.`,
      type: "warning",
      onConfirm: () => executeSendPayslips(),
    });
  };

  const handleBulkDownload = async () => {
    const targetIndices =
      selectedEmployees.length > 0
        ? selectedEmployees
        : employees.map((_, i) => i);
    if (targetIndices.length === 0) return;

    const zip = new JSZip();
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear().toString();
    const folderName = `Payslips_${month}_${year}`;
    const folder = zip.folder(folderName);

    targetIndices.forEach((empIndex) => {
      const employee = employees[empIndex];
      const doc = generatePDF(employee, month, year, companyProfile);
      const pdfData = doc.output("arraybuffer");
      const safeName = (employee.Name || "Employee").replace(
        /[^a-z0-9]/gi,
        "_",
      );
      const fileName = `Payslip_${safeName}.pdf`;
      folder.file(fileName, pdfData);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folderName}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Failed to create zip file: " + error.message, "error");
    }
  };

  const handleDownloadTemplate = () => {
    let headers = [];
    let row1 = {};

    // Use custom column mapping if available
    if (
      companyProfile?.columnMapping &&
      companyProfile.columnMapping.length > 0
    ) {
      headers = companyProfile.columnMapping.map((col) => col.header);

      // Generate dummy row based on mapping
      companyProfile.columnMapping.forEach((col) => {
        const header = col.header;
        const sysField = col.systemField;

        // Default values for common fields
        if (sysField === "Emp Code") row1[header] = "EMP001";
        else if (sysField === "Name") row1[header] = "John Doe";
        else if (sysField === "Email") row1[header] = "john@example.com";
        else if (sysField === "Department") row1[header] = "IT";
        else if (sysField === "Designation") row1[header] = "Developer";
        else if (sysField === "Location") row1[header] = "Headquarters";
        // Earnings
        else if (sysField === "BASIC") row1[header] = 50000;
        else if (sysField === "D A") row1[header] = 2000;
        else if (sysField === "HRA") row1[header] = 20000;
        else if (sysField === "CONV ALW") row1[header] = 5000;
        else if (sysField === "MED ALW") row1[header] = 2000;
        else if (sysField === "OTHER ALW") row1[header] = 3000;
        else if (sysField === "DIST ALW") row1[header] = 1500;
        else if (sysField === "ARREARS") row1[header] = 500;
        // Deductions
        else if (sysField === "PROV.FUND") row1[header] = 1800;
        else if (sysField === "P.Tax") row1[header] = 200;
        else if (sysField === "ESI") row1[header] = 500;
        else if (sysField === "TDS") row1[header] = 1000;
        // Identifiers
        else if (sysField === "ESIC No") row1[header] = "ESIC001";
        else if (sysField === "PF No") row1[header] = "PF001";
        else if (sysField === "Bank Account") row1[header] = "1234567890";
        else if (sysField === "IFSC") row1[header] = "BANK000123";
        else if (sysField === "UAN No") row1[header] = "100000000000";
        else if (sysField === "DOJ") row1[header] = "12/01/2026";
        // Attendance
        else if (sysField === "Days Paid") row1[header] = 30;
        else if (sysField === "Pd.Off") row1[header] = 0;
        else if (sysField === "LWP/Absent") row1[header] = 0;
        // Fallback for unmapped or generic columns
        else row1[header] = "";
      });
    } else {
      // Default headers logic removed to force using mapping or creating a default mapping
      // However, to be safe, if for some reason mapping is missing, we provide a raw default
      // But aligned with the DEFAULT_COLUMNS structure order if possible.
      // For now, we'll just replicate the DEFAULT_COLUMNS order manually if no profile mapping exists.
      headers = [
        "S.No.",
        "EMP CODE",
        "EMPLOYEE NAME",
        "ACCOUNT NUMBER",
        "BANK NAME",
        "BRANCH NAME",
        "IFSC CODE",
        "DESIGNATION",
        "DEPARTMENT",
        "DOJ",
        "LOCATION",
        "EMAIL",
        "ESI IP NO.",
        "PF NO.",
        "UAN NO.",
        "BASIC",
        "DA",
        "HRA",
        "CONV \n ALW",
        "MED \n ALW",
        "OTHER\n ALW",
        "DIST\n ALW",
        "ARREARS",
        "GROSS\n SALARY",
        "PRESENT \n DAYS",
      ];

      row1 = {
        "S.No.": "1",
        "EMP CODE": "EMP001",
        "EMPLOYEE NAME": "John Doe",
        "ACCOUNT NUMBER": "1234567890",
        "BANK NAME": "Test Bank",
        "BRANCH NAME": "Main",
        "IFSC CODE": "BANK001",
        DESIGNATION: "Dev",
        DEPARTMENT: "IT",
        DOJ: "12/01/2026",
        LOCATION: "HQ",
        EMAIL: "john@example.com",
        "ESI IP NO.": "ESIC001",
        "PF NO.": "PF001",
        "UAN NO.": "UAN001",
        BASIC: 50000,
        DA: 2000,
        HRA: 20000,
        "CONV \n ALW": 5000,
        "MED \n ALW": 2000,
        "OTHER\n ALW": 3000,
        "DIST\n ALW": 1000,
        ARREARS: 500,
        "GROSS\n SALARY": 80000,
        "PRESENT \n DAYS": 30,
      };
    }

    const ws = XLSX.utils.json_to_sheet([row1], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "payroll_template.xlsx");
  };

  // ========== RENDER VIEWS ==========

  if (currentView === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -top-[40%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-blue-100 blur-3xl opacity-30 animate-blob"></div>
        </div>
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium animate-pulse">
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  if (currentView === "setup") {
    return (
      <SetupWizard
        step={setupStep}
        setStep={setSetupStep}
        setupForm={setupForm}
        setSetupForm={setSetupForm}
        errorMessage={errorMessage}
        handleSetupSubmit={handleSetupSubmit}
        handleLogoUpload={handleLogoUpload}
      />
    );
  }

  if (currentView === "login") {
    return (
      <>
        <LoginForm
          handleLogin={handleLogin}
          loginPassword={loginPassword}
          setLoginPassword={(value) => {
            setLoginPassword(value);
            if (errorMessage) setErrorMessage("");
          }}
          errorMessage={errorMessage}
          companyProfile={companyProfile}
          resetPassword={resetPassword}
          showToast={showToast}
        />
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-32 ">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              {companyProfile?.logoUrl ? (
                <div className="w-32 h-16 mx-auto flex items-center justify-center overflow-hidden relative">
                  <Image
                    src={companyProfile.logoUrl}
                    alt="Logo"
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
              )}
            </div>

            {/* Right Actions - Profile Dropdown */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center gap-2 hover:bg-slate-100 pl-2 pr-1 py-1 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border font-semibold text-xs transition-colors"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand-color), white 90%)",
                      borderColor:
                        "color-mix(in srgb, var(--brand-color), white 80%)",
                      color: "var(--brand-color)",
                    }}
                  >
                    {user?.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="hidden md:block text-left mr-1">
                    <p
                      className="font-semibold leading-none"
                      style={{ color: "var(--brand-color)" }}
                    >
                      {companyProfile?.userName || "Admin"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsSettingsOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <Settings size={16} className="text-slate-400" />
                          Settings
                        </button>
                      </div>

                      <div className="border-t border-slate-50 py-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          <LogOut size={16} className="text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-8 md:px-12 lg:px-32 w-full mx-auto">
        {employees.length === 0 ? (
          <ImportCard
            onUpload={handleExcelUpload}
            onDownloadTemplate={handleDownloadTemplate}
          />
        ) : (
          <>
            <PayrollSummary
              employees={employees}
              onReset={handleReset}
              onSendAll={sendPayslips}
              onDownloadAll={handleBulkDownload}
              isSending={isSending}
              sendingProgress={sendingProgress}
              selectedCount={selectedEmployees.length}
              payrollMonth={payrollMonth}
              payrollYear={payrollYear}
              isPeriodFromExcel={isPeriodFromExcel}
            />

            {/* Employee Table */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-200">
              <div className="">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className="sticky top-16 z-40 border-b border-slate-200 shadow-sm transition-colors"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-color), white 95%)",
                      }}
                    >
                      <th className="px-4 py-3 w-12 text-center">
                        <button
                          onClick={toggleSelectAll}
                          className="text-slate-400 hover:text-(--brand-color) transition cursor-pointer"
                        >
                          {selectedEmployees.length === employees.length &&
                          employees.length > 0 ? (
                            <CheckSquare
                              size={18}
                              className="text-(--brand-color)"
                            />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
                      {/* Dynamic Columns */}
                      {companyProfile?.columnMapping
                        ?.filter((col) => col.showOnDashboard)
                        .map((col) => {
                          const isEssential =
                            col.systemField === "Emp Code" ||
                            col.systemField === "Name";

                          let responsiveClass = "hidden md:table-cell";
                          if (col.systemField === "Email")
                            responsiveClass = "hidden 2xl:table-cell";
                          else if (col.systemField === "Location")
                            responsiveClass = "hidden xl:table-cell";
                          else if (col.systemField === "Department")
                            responsiveClass = "hidden lg:table-cell";

                          return (
                            <th
                              key={col.id}
                              className={`px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap ${isEssential ? "" : responsiveClass}`}
                            >
                              {col.header}
                            </th>
                          );
                        })}
                      <th className="px-4 py-3 text-xs font-semibold text-slate-700 text-right uppercase tracking-wider">
                        Net Pay
                      </th>
                      <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-700 text-right uppercase tracking-wider w-16">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.map((emp, index) => {
                      const isSelected = selectedEmployees.includes(index);
                      return (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(emp)}
                          className={`transition-colors cursor-pointer ${isSelected ? "bg-[color-mix(in_srgb,var(--brand-color),white_90%)]" : "hover:bg-[color-mix(in_srgb,var(--brand-color),white_95%)]"}`}
                        >
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(index);
                              }}
                              className="text-slate-400 hover:text-(--brand-color) transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare
                                  size={18}
                                  className="text-(--brand-color)"
                                />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          </td>
                          {/* Dynamic Cells */}
                          {companyProfile?.columnMapping
                            ?.filter((col) => col.showOnDashboard)
                            .map((col) => {
                              let val = "";
                              if (
                                col.systemField &&
                                emp[col.systemField] !== undefined
                              ) {
                                val = emp[col.systemField];
                              } else {
                                val = emp[col.header];
                              }

                              const isEssential =
                                col.systemField === "Emp Code" ||
                                col.systemField === "Name";

                              let responsiveClass = "hidden md:table-cell";
                              if (col.systemField === "Email")
                                responsiveClass = "hidden 2xl:table-cell";
                              else if (col.systemField === "Location")
                                responsiveClass = "hidden xl:table-cell";
                              else if (col.systemField === "Department")
                                responsiveClass = "hidden lg:table-cell";

                              return (
                                <td
                                  key={col.id}
                                  className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap ${isEssential ? "" : responsiveClass}`}
                                >
                                  {col.systemField === "Email" ? (
                                    <div className="flex items-center gap-2">
                                      {val}
                                      {val &&
                                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                          val,
                                        ) && (
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
                                    </div>
                                  ) : (
                                    val
                                  )}
                                </td>
                              );
                            })}
                          <td
                            className={`px-4 py-3 text-sm font-semibold text-right ${emp["__mismatch"] ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            <div className="flex items-center justify-end gap-2">
                              {emp["__mismatch"] && (
                                <div className="group relative">
                                  <AlertTriangle
                                    size={16}
                                    className="text-amber-500 cursor-help"
                                  />
                                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50 whitespace-normal text-left">
                                    Mismatch! System Calculated:{" "}
                                    {formatCurrency(emp["__calculatedNet"])}
                                  </div>
                                </div>
                              )}
                              {formatCurrency(emp["Net Pay"])}
                            </div>
                          </td>
                          <td className="hidden md:flex px-4 py-3 items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(emp);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadSingle(emp);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Download Payslip"
                            >
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer
        companyName={companyProfile?.name}
        brandColor={companyProfile?.brandColor}
      />

      <EmployeeDetailsModal
        employee={viewDetailsEmployee}
        onClose={() => setViewDetailsEmployee(null)}
        payrollMonth={payrollMonth}
        payrollYear={payrollYear}
      />

      {/* View Payslip Modal */}
      <PayslipPreviewModal
        viewingEmployee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onDownload={handleDownloadSingle}
        companyProfile={companyProfile}
        payrollMonth={payrollMonth}
        payrollYear={payrollYear}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        companyProfile={companyProfile}
        onUpdateProfile={handleUpdateProfile}
        verifyEmail={verifyEmail}
        resetPassword={resetPassword}
        onRequestDelete={handleRequestDelete}
        showToast={showToast}
      />

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleOTPVerified}
        userEmail={user?.email}
      />
      <ErrorSummaryModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        failedList={failedEmails} 
      />
    </div>
  );
  
}
