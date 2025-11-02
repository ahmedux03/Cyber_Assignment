import { useState } from "react";
import useUser from "@/utils/useUser";
import {
  Shield,
  Lock,
  FileText,
  Upload,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Users,
  Eye,
  Server,
} from "lucide-react";

export default function OverviewPage() {
  const { data: user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view security overview
          </p>
        </div>
      </div>
    );
  }

  const securityFeatures = [
    {
      id: "authentication",
      title: "User Authentication",
      description: "Secure login with password hashing and session management",
      icon: Lock,
      status: "implemented",
      tests: [
        "Password strength validation",
        "SQL injection in login forms",
        "Session hijacking attempts",
        "Brute force protection",
      ],
      endpoint: "/account/signin",
    },
    {
      id: "transactions",
      title: "Financial Transactions",
      description:
        "Secure transaction processing with validation and audit logging",
      icon: CreditCard,
      status: "implemented",
      tests: [
        "Amount manipulation attacks",
        "Parameter tampering",
        "Transaction replay attacks",
        "SQL injection in transaction data",
      ],
      endpoint: "/transactions",
    },
    {
      id: "profile",
      title: "Profile Management",
      description:
        "User profile updates with input validation and sanitization",
      icon: Users,
      status: "implemented",
      tests: [
        "XSS in profile fields",
        "Input validation bypass",
        "Access control testing",
        "Data injection attacks",
      ],
      endpoint: "/api/profile",
    },
    {
      id: "encryption",
      title: "Data Encryption",
      description:
        "AES-256 encryption/decryption for sensitive data protection",
      icon: Shield,
      status: "implemented",
      tests: [
        "Encryption key exposure",
        "Weak cipher attacks",
        "Data integrity testing",
        "Encryption bypass attempts",
      ],
      endpoint: "/security-testing",
    },
    {
      id: "file-upload",
      title: "File Upload Security",
      description: "Secure file uploads with type validation and size limits",
      icon: Upload,
      status: "implemented",
      tests: [
        "Malicious file upload",
        "File type bypass",
        "Path traversal attacks",
        "Executable file uploads",
      ],
      endpoint: "/security-testing",
    },
    {
      id: "audit-logs",
      title: "Audit Logging",
      description: "Comprehensive activity tracking and security monitoring",
      icon: Activity,
      status: "implemented",
      tests: [
        "Log injection attacks",
        "Audit bypass attempts",
        "Log tampering",
        "Information disclosure",
      ],
      endpoint: "/security-testing",
    },
  ];

  const testCategories = [
    {
      category: "Authentication Security",
      color: "blue",
      tests: [
        "Weak password policy testing",
        "SQL injection in login forms",
        "Session management flaws",
        "Account lockout bypass",
        "Password reset vulnerabilities",
      ],
    },
    {
      category: "Input Validation",
      color: "green",
      tests: [
        "Cross-site scripting (XSS)",
        "SQL injection in forms",
        "Command injection",
        "Path traversal attacks",
        "Parameter pollution",
      ],
    },
    {
      category: "Authorization & Access Control",
      color: "purple",
      tests: [
        "Privilege escalation",
        "Direct object references",
        "Missing function level access control",
        "Cross-site request forgery (CSRF)",
        "API endpoint authorization",
      ],
    },
    {
      category: "Data Protection",
      color: "orange",
      tests: [
        "Encryption strength testing",
        "Sensitive data exposure",
        "Data integrity verification",
        "Information leakage in errors",
        "Insecure data storage",
      ],
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      green:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
      purple:
        "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
      orange:
        "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security Testing Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive FinTech security testing environment with 20+ manual
            test scenarios
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Security Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      {feature.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {feature.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Scenarios:
                    </h4>
                    <ul className="space-y-1">
                      {feature.tests.map((test, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-600 dark:text-gray-400 flex items-center"
                        >
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {test}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={feature.endpoint}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Test Now <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Manual Testing Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testCategories.map((category, index) => (
              <div
                key={index}
                className={`rounded-lg p-6 border ${getColorClasses(category.color)}`}
              >
                <h3 className="text-lg font-semibold mb-4">
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.tests.map((test, testIndex) => (
                    <li key={testIndex} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 opacity-60" />
                      {test}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            API Testing Endpoints
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                {
                  method: "POST",
                  endpoint: "/api/auth/signin",
                  description: "User authentication",
                },
                {
                  method: "GET",
                  endpoint: "/api/transactions",
                  description: "Fetch user transactions",
                },
                {
                  method: "POST",
                  endpoint: "/api/transactions",
                  description: "Create new transaction",
                },
                {
                  method: "GET",
                  endpoint: "/api/profile",
                  description: "Get user profile",
                },
                {
                  method: "PUT",
                  endpoint: "/api/profile",
                  description: "Update user profile",
                },
                {
                  method: "POST",
                  endpoint: "/api/encryption",
                  description: "Encrypt/decrypt data",
                },
                {
                  method: "POST",
                  endpoint: "/api/file-upload",
                  description: "Upload files",
                },
                {
                  method: "GET",
                  endpoint: "/api/audit-logs",
                  description: "View audit logs",
                },
                {
                  method: "POST",
                  endpoint: "/api/audit-logs",
                  description: "Create audit entry",
                },
              ].map((api, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          api.method === "GET"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : api.method === "POST"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                        }`}
                      >
                        {api.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {api.endpoint}
                      </code>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {api.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Testing Checklist */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                20+ Manual Security Tests to Perform
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    High Priority Tests:
                  </h3>
                  <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>1. SQL injection in login form</li>
                    <li>2. XSS in transaction descriptions</li>
                    <li>3. File upload with malicious files</li>
                    <li>4. Password policy bypass</li>
                    <li>5. Session hijacking attempts</li>
                    <li>6. Parameter tampering in transactions</li>
                    <li>7. Direct object reference exploitation</li>
                    <li>8. CSRF token bypass</li>
                    <li>9. Encryption key exposure</li>
                    <li>10. Privilege escalation testing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Additional Tests:
                  </h3>
                  <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>11. Path traversal in file uploads</li>
                    <li>12. Command injection in forms</li>
                    <li>13. Information disclosure in errors</li>
                    <li>14. Audit log tampering</li>
                    <li>15. Rate limiting bypass</li>
                    <li>16. Data validation bypass</li>
                    <li>17. Authentication bypass attempts</li>
                    <li>18. Insecure data storage</li>
                    <li>19. API endpoint enumeration</li>
                    <li>20. Business logic vulnerabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
