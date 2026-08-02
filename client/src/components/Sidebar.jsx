import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  MapPin,
  Megaphone,
  FileText,
  Users,
  BarChart2,
  Calendar,
  CreditCard,
  Bell,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Screens", path: "/screens", icon: Monitor },
  { name: "Locations", path: "/locations", icon: MapPin },
  { name: "Campaigns", path: "/campaigns", icon: Megaphone },
  { name: "Creatives", path: "/creatives", icon: FileText },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Reports", path: "/reports", icon: BarChart2 },
  { name: "Schedule", path: "/schedule", icon: Calendar },
  { name: "Billing", path: "/billing", icon: CreditCard },
  { name: "Users", path: "/users", icon: Users },
  { name: "Alerts", path: "/alerts", icon: Bell },
  { name: "Support", path: "/support", icon: HelpCircle },
];

export default function Sidebar({ isOpen }) {
  const location = useLocation();

  return (
    <aside
      className={`bg-[#111827] border-r border-[#1f2937] flex flex-col justify-between h-screen shrink-0 select-none transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-r-0"
      }`}
    >
      <div className="w-64 flex flex-col h-full justify-between py-4">
        {/* Logo Section with Proper Structure & Bottom Border Divider */}
        <div className="px-6 pb-4 mb-2 border-b border-[#1f2937]/80 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-orange-500 rounded-full"></div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              the <span className="text-orange-500">adbook.</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1.5 font-semibold pl-4">
            DOOH ADVERTISING SOLUTIONS
          </p>
        </div>

        {/* Navigation Menu (Proper Fit & Balanced Spacing) */}
        <nav className="space-y-1 px-3.5 whitespace-nowrap my-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/25 font-semibold"
                    : "text-gray-400 hover:bg-[#1f2937]/60 hover:text-gray-200"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Premium Plan Box */}
        <div className="px-3.5 pt-2 border-t border-[#1f2937]/50">
          <div className="w-full p-3.5 bg-[#0b0f19] border border-[#1f2937] rounded-2xl shadow-inner whitespace-nowrap">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Premium Plan
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2.5 font-normal">
              Valid till 31 Dec, 2027
            </p>
            <button className="w-full py-2 bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
