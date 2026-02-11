import React from "react";
import { Download, X } from "lucide-react";
import { generatePDFBase64 } from "@/utils/pdfGenerator";

export default function PayslipPreviewModal({
  viewingEmployee,
  onClose,
  onDownload,
  companyProfile,
  payrollMonth,
  payrollYear,
}) {
  if (!viewingEmployee) return null;

  // Use passed props, or fallback to default if missing (though they should be passed)
  const month =
    payrollMonth || new Date().toLocaleString("default", { month: "long" });
  const year = payrollYear || new Date().getFullYear().toString();

  // Generate Base64 for the iframe
  // We compute this on the fly when the component renders or changes employee.
  const pdfBase64 = generatePDFBase64(
    viewingEmployee,
    month,
    year,
    companyProfile,
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            Payslip Preview: {viewingEmployee.Name}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => onDownload(viewingEmployee)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition cursor-pointer"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 p-4 overflow-hidden">
          <iframe
            src={`data:application/pdf;base64,${pdfBase64}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full rounded-lg border border-slate-300 bg-white"
            title="Payslip Preview"
          />
        </div>
      </div>
    </div>
  );
}
