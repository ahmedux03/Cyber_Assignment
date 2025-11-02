import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertTriangle,
  Filter,
  Search,
} from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const { data: user } = useUser();

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: "transfer",
    amount: "",
    description: "",
    recipient_account: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url =
        filterType === "all"
          ? "/api/transactions"
          : `/api/transactions?type=${filterType}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTransaction,
          amount: parseFloat(newTransaction.amount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transaction creation failed");
      }

      // Reset form and refresh transactions
      setNewTransaction({
        transaction_type: "transfer",
        amount: "",
        description: "",
        recipient_account: "",
      });
      setShowCreateForm(false);
      await fetchTransactions();
    } catch (err) {
      console.error("Transaction creation error:", err);
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="w-5 h-5 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case "transfer":
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Transactions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and manage your financial transactions
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
                <option value="payment">Payments</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Create Transaction Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New Transaction
              </h2>
              <form onSubmit={createTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={newTransaction.transaction_type}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        transaction_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="transfer">Transfer</option>
                    <option value="payment">Payment</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50000"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transaction description"
                  />
                </div>

                {(newTransaction.transaction_type === "transfer" ||
                  newTransaction.transaction_type === "payment") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Recipient Account
                    </label>
                    <input
                      type="text"
                      value={newTransaction.recipient_account}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          recipient_account: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Account number (10-20 characters, letters and numbers)"
                      pattern="[A-Z0-9]{10,20}"
                      required
                    />
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {createLoading ? "Creating..." : "Create Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading transactions...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No transactions found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Create your first transaction to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                          {transaction.transaction_type}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Ref: {transaction.reference_number}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.transaction_type === "deposit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.transaction_type === "deposit" ? "+" : "-"}
                        ${transaction.amount}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.transaction_status)}`}
                      >
                        {transaction.transaction_status}
                      </span>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {transaction.recipient_account && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      To: {transaction.recipient_account}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
