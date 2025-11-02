import useAuth from "@/utils/useAuth";
import { Shield, LogOut } from "lucide-react";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SecureFintech
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign out of your account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center mb-6">
            <LogOut className="w-8 h-8 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sign Out
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Are you sure you want to sign out of your secure account?
          </p>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Yes, Sign Out
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Your session will be securely terminated
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
