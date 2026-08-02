import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  CreditCard,
  Sparkles,
  Download,
  CheckCircle,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Edit3,
} from "lucide-react";

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  const [clientId, setClientId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
  );
  const [amount, setAmount] = useState("");

  // Tax States
  const [taxMode, setTaxMode] = useState("auto18");
  const [customTaxRate, setCustomTaxRate] = useState("18");
  const [tax, setTax] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceId, setReferenceId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, clientRes, campRes] = await Promise.all([
        API.get("/billing").catch(() => ({ data: { invoices: [] } })),
        API.get("/clients").catch(() => ({ data: { clients: [] } })),
        API.get("/campaigns").catch(() => ({ data: { campaigns: [] } })),
      ]);

      setInvoices(invRes.data.invoices || invRes.data || []);
      setClients(clientRes.data.clients || clientRes.data || []);
      setCampaigns(campRes.data.campaigns || campRes.data || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Billing Data Error]:", err);
      setError("Failed to load billing records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateTax = (baseAmt, mode, rate) => {
    if (!baseAmt || isNaN(baseAmt)) return "0";
    const numAmt = Number(baseAmt);
    if (mode === "auto18") {
      return (numAmt * 0.18).toFixed(2);
    } else if (mode === "custom") {
      const percentage = Number(rate) || 0;
      return (numAmt * (percentage / 100)).toFixed(2);
    }
    return "0";
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    setTax(calculateTax(val, taxMode, customTaxRate));
  };

  const handleTaxModeChange = (mode) => {
    setTaxMode(mode);
    if (mode === "auto18") setCustomTaxRate("18");
    setTax(
      calculateTax(amount, mode, mode === "auto18" ? "18" : customTaxRate),
    );
  };

  const handleCustomRateChange = (rate) => {
    setCustomTaxRate(rate);
    setTax(calculateTax(amount, "custom", rate));
  };

  const handleOpenEdit = (inv) => {
    setIsEditMode(true);
    setCurrentInvoiceId(inv._id);
    setInvoiceNumber(inv.invoiceNumber || "");
    setClientId(inv.clientId?._id || inv.clientId || "");
    setCampaignId(inv.campaignId?._id || inv.campaignId || "");
    setAmount(inv.amount || "");
    setTax(inv.tax || "");
    setPaymentStatus(inv.paymentStatus || "Paid");
    setPaymentMethod(inv.paymentMethod || "Bank Transfer");
    setReferenceId(inv.referenceId || "");
    setDueDate(inv.dueDate ? inv.dueDate.slice(0, 10) : "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentInvoiceId(null);
    setInvoiceNumber(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
    setClientId("");
    setCampaignId("");
    setAmount("");
    setTax("");
    setPaymentStatus("Paid");
    setPaymentMethod("Bank Transfer");
    setReferenceId("");
    setDueDate("");
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!clientId || !invoiceNumber || !amount || !dueDate) {
      alert("Please fill in all mandatory billing fields.");
      return;
    }

    if (
      paymentStatus === "Paid" &&
      paymentMethod !== "Cash" &&
      paymentMethod !== "None" &&
      !referenceId.trim()
    ) {
      alert(
        `Please enter the Reference / Transaction ID for completed payment.`,
      );
      return;
    }

    try {
      const payload = {
        clientId,
        campaignId: campaignId || undefined,
        invoiceNumber: invoiceNumber.trim(),
        amount: Number(amount),
        tax: Number(tax) || 0,
        paymentStatus,
        paymentMethod,
        referenceId:
          paymentStatus === "Paid" &&
          paymentMethod !== "Cash" &&
          paymentMethod !== "None"
            ? referenceId.trim()
            : "",
        dueDate,
      };

      if (isEditMode && currentInvoiceId) {
        await API.put(`/billing/${currentInvoiceId}`, payload);
        alert("Invoice updated successfully!");
      } else {
        await API.post("/billing/create", payload);
        alert("Invoice generated successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("[Invoice Save Error]:", err);
      alert(err.response?.data?.message || "Failed to process invoice action.");
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice record?"))
      return;
    try {
      await API.delete(`/billing/${id}`);
      setInvoices(invoices.filter((inv) => inv._id !== id));
      alert("Invoice deleted successfully.");
    } catch (err) {
      alert("Failed to delete invoice.");
    }
  };

  const handleDownloadPDF = (inv) => {
    const printWindow = window.open("", "_blank");
    const client = inv.clientId || {};
    const campaign = inv.campaignId || {};

    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border-radius: 10px; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
            .company-title { font-size: 26px; font-weight: bold; color: #f97316; }
            .invoice-details { text-align: right; }
            .invoice-details h2 { margin: 0; font-size: 20px; color: #111; }
            .invoice-details p { margin: 4px 0; font-size: 13px; color: #666; }
            .billing-section { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
            .billing-section div { width: 48%; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
            .billing-section h4 { margin: 0 0 8px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #0f172a; color: #fff; text-align: left; padding: 12px; font-size: 13px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
            .totals { margin-top: 25px; float: right; width: 320px; font-size: 14px; }
            .totals .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
            .totals .row.final { font-weight: bold; font-size: 16px; color: #0f172a; border-top: 2px solid #cbd5e1; border-bottom: none; margin-top: 5px; padding-top: 10px; }
            .status-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #16a34a; }
            .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; clear: both; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header-flex">
              <div>
                <div class="company-title">TheAdBook DOOH Engine</div>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Enterprise Digital Out-of-Home Media Solutions</p>
              </div>
              <div class="invoice-details">
                <h2>TAX INVOICE</h2>
                <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
                <p><strong>Date Issued:</strong> ${new Date(inv.createdAt).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(inv.dueDate).toLocaleDateString()}</p>
                <div style="margin-top: 8px;">
                  <span class="status-badge">${inv.paymentStatus}</span>
                </div>
              </div>
            </div>

            <div class="billing-section">
              <div>
                <h4>Billed To (Client / Advertiser):</h4>
                <p><strong>${client.companyName || "N/A"}</strong></p>
                <p>Contact: ${client.clientName || "N/A"}</p>
                <p>Email: ${client.email || "N/A"}</p>
                <p>Phone: ${client.phone || "N/A"}</p>
              </div>
              <div>
                <h4>Payment Details:</h4>
                <p><strong>Campaign:</strong> ${campaign.campaignName || "General Subscription"}</p>
                <p><strong>Payment Mode:</strong> ${inv.paymentMethod || "Bank Transfer"}</p>
                ${inv.referenceId ? `<p><strong>Reference ID:</strong> <span style="font-family: monospace; color: #2563eb;">${inv.referenceId}</span></p>` : "<p><strong>Reference ID:</strong> N/A (Pending / Cash)</p>"}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description of Services</th>
                  <th>Billing Ref</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Programmatic DOOH Ad Space & Media Streaming</strong><br/>
                    <span style="font-size: 11px; color: #64748b;">Campaign slot allocation & programmatic telemetry execution.</span>
                  </td>
                  <td>${campaign.campaignName ? "Campaign ID: " + campaign._id.slice(-6) : "Platform Plan"}</td>
                  <td style="text-align: right; font-weight: bold;">₹${inv.amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="row">
                <span>Subtotal:</span>
                <span>₹${inv.amount?.toLocaleString()}</span>
              </div>
              <div class="row">
                <span>Applied Tax / GST:</span>
                <span>₹${inv.tax?.toLocaleString()}</span>
              </div>
              <div class="row final">
                <span>Total Due:</span>
                <span style="color: #16a34a;">₹${inv.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated official tax invoice issued by TheAdBook Core Engine. No signature required.</p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalBilledRevenue = invoices.reduce(
    (acc, curr) => acc + (Number(curr.totalAmount) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Billing & Client Invoices
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage invoices with payment modes, reference IDs, and custom tax
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/25 cursor-pointer"
        >
          <Plus size={16} /> Generate New Invoice
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-[#111827] via-[#1a2333] to-[#111827] border border-orange-500/30 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles size={13} className="fill-orange-400" /> Active
                Platform Fleet
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Enterprise DOOH Fleet Plan
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Cumulative Billed Revenue:{" "}
              <strong className="text-emerald-400 font-mono text-sm">
                ₹{totalBilledRevenue.toLocaleString()}
              </strong>
            </p>
            <p className="text-xs text-emerald-400 font-semibold mt-3 flex items-center gap-1">
              <ShieldCheck size={15} /> System Licensing Valid till 31 Dec, 2026
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-orange-500" /> Client Campaign
            Invoices & Receipts
          </h3>
          <button
            onClick={fetchData}
            className="p-2 bg-[#0b0f19] hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-xl border border-[#1f2937] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">
                  INVOICE NO & CLIENT
                </th>
                <th className="py-3.5 px-5 font-semibold">LINKED CAMPAIGN</th>
                <th className="py-3.5 px-5 font-semibold">PAYMENT & REF ID</th>
                <th className="py-3.5 px-5 font-semibold">TOTAL AMOUNT</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No invoices generated yet. Click "Generate New Invoice".
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-semibold text-white">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-orange-400 font-medium">
                        {inv.clientId?.companyName || "Client"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-200 font-medium">
                      {inv.campaignId?.campaignName || (
                        <span className="text-gray-500 italic">
                          General Billing
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">
                        {inv.paymentMethod || "Bank Transfer"}
                      </div>
                      <div className="text-[10px] text-blue-400 font-mono">
                        {inv.referenceId ? `Ref: ${inv.referenceId}` : "No Ref"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-emerald-400 font-bold font-mono">
                      ₹{inv.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.paymentStatus === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadPDF(inv)}
                          title="Download Tax Invoice PDF"
                          className="px-2.5 py-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-orange-400 rounded-lg border border-[#1f2937] transition inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <Download size={12} /> PDF
                        </button>
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          title="Edit Invoice"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv._id)}
                          title="Delete Invoice"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-orange-500" />{" "}
                {isEditMode ? "Edit Client Invoice" : "Generate Client Invoice"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Invoice Number (*)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Client / Advertiser (*)
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Choose Client</option>
                  {clients.map((cli) => (
                    <option key={cli._id} value={cli._id}>
                      {cli.companyName} ({cli.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Link Campaign (Optional)
                </label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-mono text-yellow-400"
                >
                  <option value="">No Campaign (General Billing)</option>
                  {campaigns.map((camp) => (
                    <option key={camp._id} value={camp._id}>
                      {camp.campaignName} (₹{camp.budget})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Base Amount (₹) (*)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-300">
                      Tax Mode
                    </label>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleTaxModeChange("auto18")}
                        className={`px-1 py-0.5 rounded cursor-pointer ${taxMode === "auto18" ? "bg-orange-600 text-white font-bold" : "bg-[#0b0f19] text-gray-400 border border-[#1f2937]"}`}
                      >
                        Auto 18%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTaxModeChange("custom")}
                        className={`px-1 py-0.5 rounded cursor-pointer ${taxMode === "custom" ? "bg-orange-600 text-white font-bold" : "bg-[#0b0f19] text-gray-400 border border-[#1f2937]"}`}
                      >
                        Custom %
                      </button>
                    </div>
                  </div>

                  {taxMode === "custom" ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="%"
                        value={customTaxRate}
                        onChange={(e) => handleCustomRateChange(e.target.value)}
                        className="w-14 bg-[#0b0f19] border border-[#1f2937] rounded-xl px-2 py-2.5 text-xs text-white outline-none font-mono text-center focus:border-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Tax"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-2.5 py-2.5 text-xs text-white outline-none font-mono text-emerald-400 focus:border-orange-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono text-emerald-400 focus:border-orange-500"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold text-emerald-400 cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {paymentStatus === "Paid" &&
                paymentMethod !== "Cash" &&
                paymentMethod !== "None" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Reference / Transaction ID (*)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR / UPI Ref / Txn ID"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      required
                      className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                    />
                  </div>
                )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Due Date (*)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 bg-[#0b0f19] text-gray-300 border border-[#1f2937] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  {isEditMode ? "Update Invoice" : "Save & Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
