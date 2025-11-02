import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Shield,
  Lock,
  FileText,
  Upload,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SecurityTestingPage() {
  const [activeTab, setActiveTab] = useState("encryption");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const { data: user } = useUser();

  // Form states for different testing scenarios
  const [encryptionData, setEncryptionData] = useState({
    operation: "encrypt",
    data: "",
    purpose: "testing",
  });

  const [fileData, setFileData] = useState({
    file_name: "",
    file_type: "image/jpeg",
    file_size: 0,
    upload_purpose: "other",
    file_url: "",
  });

  const [auditData, setAuditData] = useState({
    action_type: "security_test",
    action_description: "",
    risk_level: "low",
  });

  const [showSensitiveData, setShowSensitiveData] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access security testing
          </p>
        </div>
      </div>
    );
  }

  const handleEncryptionTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/encryption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encryptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Encryption test failed");
      }

      const data = await response.json();
      setResults({ ...results, encryption: data });
    } catch (err) {
      console.error("Encryption test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate file size based on type
      const simulatedSize = fileData.file_type.includes("pdf")
        ? 2048000
        : 1024000;

      const response = await fetch("/api/file-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fileData,
          file_size: simulatedSize,
          file_url: `https://example.com/uploads/${fileData.file_name}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "File upload test failed");
      }

      const data = await response.json();
      setResults({ ...results, fileUpload: data });
    } catch (err) {
      console.error("File upload test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auditData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Audit test failed");
      }

      const data = await response.json();
      setResults({ ...results, audit: data });
    } catch (err) {
      console.error("Audit test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "encryption", label: "Data Encryption", icon: Lock },
    { id: "fileUpload", label: "File Upload", icon: Upload },
    { id: "audit", label: "Audit Logging", icon: Activity },
    { id: "injection", label: "Injection Tests", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security Testing Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test various security features and vulnerabilities in a controlled
            environment
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {tabs.find((t) => t.id === activeTab)?.label} Test
            </h2>

            {activeTab === "encryption" && (
              <form onSubmit={handleEncryptionTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Operation
                  </label>
                  <select
                    value={encryptionData.operation}
                    onChange={(e) =>
                      setEncryptionData({
                        ...encryptionData,
                        operation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="encrypt">Encrypt Data</option>
                    <option value="decrypt">Decrypt Data</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data to Process
                  </label>
                  <textarea
                    value={encryptionData.data}
                    onChange={(e) =>
                      setEncryptionData({
                        ...encryptionData,
                        data: e.target.value,
                      })
                    }
                    placeholder="Enter data to encrypt/decrypt..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Processing..." : "Run Encryption Test"}
                </button>
              </form>
            )}

            {activeTab === "fileUpload" && (
              <form onSubmit={handleFileUploadTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={fileData.file_name}
                    onChange={(e) =>
                      setFileData({ ...fileData, file_name: e.target.value })
                    }
                    placeholder="test-file.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File Type
                  </label>
                  <select
                    value={fileData.file_type}
                    onChange={(e) =>
                      setFileData({ ...fileData, file_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="image/jpeg">JPEG Image</option>
                    <option value="image/png">PNG Image</option>
                    <option value="application/pdf">PDF Document</option>
                    <option value="text/plain">Text File</option>
                    <option value="application/javascript">
                      JavaScript File (dangerous)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Purpose
                  </label>
                  <select
                    value={fileData.upload_purpose}
                    onChange={(e) =>
                      setFileData({
                        ...fileData,
                        upload_purpose: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="other">Other</option>
                    <option value="profile_picture">Profile Picture</option>
                    <option value="identity_document">Identity Document</option>
                    <option value="bank_statement">Bank Statement</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Testing..." : "Test File Upload"}
                </button>
              </form>
            )}

            {activeTab === "audit" && (
              <form onSubmit={handleAuditTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Action Type
                  </label>
                  <input
                    type="text"
                    value={auditData.action_type}
                    onChange={(e) =>
                      setAuditData({
                        ...auditData,
                        action_type: e.target.value,
                      })
                    }
                    placeholder="security_test"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={auditData.action_description}
                    onChange={(e) =>
                      setAuditData({
                        ...auditData,
                        action_description: e.target.value,
                      })
                    }
                    placeholder="Description of the security test performed..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={auditData.risk_level}
                    onChange={(e) =>
                      setAuditData({ ...auditData, risk_level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Create Audit Log"}
                </button>
              </form>
            )}

            {activeTab === "injection" && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        SQL Injection Test Vectors
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          Try these in login forms or transaction descriptions:
                        </p>
                        <ul className="mt-2 space-y-1 font-mono text-xs">
                          <li>• ' OR 1=1 --</li>
                          <li>• admin'--</li>
                          <li>• ' UNION SELECT * FROM users --</li>
                          <li>• '; DROP TABLE transactions; --</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        XSS Test Vectors
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>Try these in form inputs:</p>
                        <ul className="mt-2 space-y-1 font-mono text-xs">
                          <li>• &lt;script&gt;alert('XSS')&lt;/script&gt;</li>
                          <li>• &lt;img src=x onerror=alert('XSS')&gt;</li>
                          <li>• javascript:alert('XSS')</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Test Results
              </h2>
              {results[activeTab] && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>

            {results[activeTab] ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Response Data
                    </h3>
                    <button
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                    >
                      {showSensitiveData ? (
                        <EyeOff className="w-4 h-4 mr-1" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      {showSensitiveData ? "Hide" : "Show"} Sensitive Data
                    </button>
                  </div>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
                    {showSensitiveData
                      ? JSON.stringify(results[activeTab], null, 2)
                      : JSON.stringify(
                          { ...results[activeTab], result: "[HIDDEN]" },
                          null,
                          2,
                        )}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No test results yet. Run a test to see results here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Testing Guidelines */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Security Testing Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Authentication Tests
              </h3>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Test weak password policies</li>
                <li>• Try brute force attacks</li>
                <li>• Check session management</li>
                <li>• Test account lockout mechanisms</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Input Validation Tests
              </h3>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• SQL injection in forms</li>
                <li>• XSS in user inputs</li>
                <li>• File upload vulnerabilities</li>
                <li>• Parameter tampering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
