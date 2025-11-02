import { useState } from "react";
import useUser from "@/utils/useUser";
import {
  Home,
  CreditCard,
  Users,
  Activity,
  Settings,
  LogOut,
  Shield,
  FileText,
  Upload,
  Eye,
  Menu,
  X,
} from "lucide-react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const { data: user, loading } = useUser();

  // Redirect to signin if not authenticated
  if (!loading && !user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading secure dashboard...
          </p>
        </div>
      </div>
    );
  }

  const MenuItem = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`
        relative w-full flex items-center h-10 px-6 rounded-lg transition-all duration-150 ease-in-out
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
        ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}
      `}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <div className="absolute left-0 top-0 w-1 h-full bg-blue-600 dark:bg-blue-400 rounded-r-full" />
      )}
      <Icon size={24} strokeWidth={1.5} className="flex-shrink-0" />
      <span className="ml-5 text-[15px] font-normal">{label}</span>
    </button>
  );

  const SectionLabel = ({ children }) => (
    <h3 className="text-[13px] font-light tracking-wide text-gray-500 dark:text-gray-400 mb-5 uppercase">
      {children}
    </h3>
  );

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    if (itemId === "logout") {
      window.location.href = "/account/logout";
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen flex flex-col">
      {/* Brand Block */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-semibold text-gray-900 dark:text-white">
            SecureFintech
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-6 py-8 space-y-8 overflow-y-auto">
        {/* General Section */}
        <div>
          <SectionLabel>General</SectionLabel>
          <div className="space-y-4">
            <MenuItem
              id="dashboard"
              icon={Home}
              label="Dashboard"
              isActive={activeItem === "dashboard"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="transactions"
              icon={CreditCard}
              label="Transactions"
              isActive={activeItem === "transactions"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="profile"
              icon={Users}
              label="Profile"
              isActive={activeItem === "profile"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="audit"
              icon={Activity}
              label="Audit Logs"
              isActive={activeItem === "audit"}
              onClick={handleItemClick}
            />
          </div>
        </div>

        {/* Security Section */}
        <div>
          <SectionLabel>Security</SectionLabel>
          <div className="space-y-4">
            <MenuItem
              id="files"
              icon={Upload}
              label="File Upload"
              isActive={activeItem === "files"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="encryption"
              icon={Shield}
              label="Data Encryption"
              isActive={activeItem === "encryption"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="settings"
              icon={Settings}
              label="Settings"
              isActive={activeItem === "settings"}
              onClick={handleItemClick}
            />
          </div>
        </div>
      </nav>

      {/* Log Out Row */}
      <div className="px-6 pb-8">
        <MenuItem
          id="logout"
          icon={LogOut}
          label="Log out"
          isActive={false}
          onClick={handleItemClick}
        />
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-8">
      {/* Account Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Account Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Account Balance
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              $5,247.83
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available Credit
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              $2,500.00
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Transactions
            </h3>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              3
            </p>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Security Status
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-green-700 dark:text-green-300">
                Account Security: Strong
              </span>
            </div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Verified
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-yellow-500 mr-3" />
              <span className="text-yellow-700 dark:text-yellow-300">
                Identity Verification
              </span>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
              ⚠ Pending
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {[
            { action: "Login", time: "2 minutes ago", status: "success" },
            {
              action: "Transfer to savings",
              time: "1 hour ago",
              status: "success",
            },
            {
              action: "Profile update",
              time: "3 hours ago",
              status: "success",
            },
            {
              action: "Failed login attempt",
              time: "1 day ago",
              status: "warning",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.status === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                }`}
              >
                {activity.status === "success" ? "Success" : "Warning"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black opacity-50 dark:opacity-70"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 h-screen bg-white dark:bg-gray-800 shadow-xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.name || user?.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Your secure financial dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-6">
          <DashboardView />
        </div>
      </div>
    </div>
  );
}
