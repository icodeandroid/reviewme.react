import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  CloudArrowDownIcon,
  LinkIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/16/solid";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import { useAuth0 } from "@auth0/auth0-react";

const GoogleReviews = () => {
  const { user } = useAuth0();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  // const [refreshing, setRefreshing] = useState(false);
  // const [loadingProfiles, setLoadingProfiles] = useState(false);
  // const [lastImportCount, setLastImportCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch connection status and reviews on component mount
  useEffect(() => {
    if (user) {
      fetchConnectionStatus();
      fetchGoogleReviews();
    }
  }, [user]);



  // Real API call to fetch connection status
  const fetchConnectionStatus = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get(
        API_PATHS.GOOGLE.CONNECTION_STATUS
      );
      setConnectionStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
      setError("Failed to load connection status");
      setConnectionStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  // Real API call to fetch Google reviews
  const fetchGoogleReviews = async (showRefreshToast = false) => {
    try {
      setError(null);

      const response = await axiosInstance.get(API_PATHS.GOOGLE.FETCH_REVIEWS);
      setGoogleReviews(response.data.reviews || []);

      if (showRefreshToast) {
        toast.success("Google reviews refreshed!");
      }
    } catch (error) {
      console.error("Failed to fetch Google reviews:", error);
      if (showRefreshToast) {
        toast.error("Failed to refresh reviews");
      }
      setGoogleReviews([]);
    } finally {
      if (showRefreshToast) setLoading(false);
    }
  };

  // Real OAuth connection flow
  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      // Get OAuth URL from backend
      const response = await axiosInstance.get(
        API_PATHS.GOOGLE.CONNECT_GOOGLE_ACCOUNT
      );
      const authUrl = response.data.authUrl;

      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        "google-oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      // Poll for popup closure and connection completion
      const pollInterval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(pollInterval);
          setConnecting(false);

          // Wait a moment for backend processing
          setTimeout(async () => {
            try {
              // Check connection progress
              const progressResponse = await axiosInstance.get(
                API_PATHS.GOOGLE.CONNECTION_PROGRESS
              );
              if (progressResponse.data.isConnected) {
                toast.success(
                  "Google Business Profile connected! Importing reviews..."
                );
                await fetchConnectionStatus();
                // Wait a bit for auto-import to complete
                setTimeout(async () => {
                  await fetchGoogleReviews();
                }, 2000);
              } else if (progressResponse.data.isProcessing) {
                toast.loading("Connection still processing...", {
                  duration: 3000,
                });
                // Poll again after a delay
                setTimeout(() => fetchConnectionStatus(), 3000);
              } else {
                toast.error("Connection failed. Please try again.");
              }
            } catch (error) {
              console.error("Connection check failed:", error);
              const errorMsg = error.response?.data?.message || "Failed to verify connection status";
              toast.error(errorMsg);
            }
          }, 1000);
        }
      }, 1000);

      // Cleanup if user doesn't complete OAuth
      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(pollInterval);
          setConnecting(false);
        }
      }, 300000); // 5 minutes timeout
    } catch (error) {
      console.error("Failed to initiate Google connection:", error);
      const errorMsg = error.response?.data?.message || "Failed to start Google connection";
      toast.error(errorMsg);
      setConnecting(false);
    }
  };



  // Real API call to import reviews
  const handleImportReviews = async () => {
    try {
      setImporting(true);
      setError(null);

      const currentCount = googleReviews.length;

      const response = await axiosInstance.post(
        API_PATHS.GOOGLE.IMPORT_REVIEWS
      );

      // Refresh the reviews list
      await fetchGoogleReviews();

      const newReviewsCount = response.data.reviewsImported;
      
      if (newReviewsCount === 0) {
        toast('No new reviews found', {
          icon: 'ℹ️',
          duration: 3000,
        });
      } else {
        toast.success(
          `Imported ${newReviewsCount} new Google review${newReviewsCount > 1 ? 's' : ''}!`
        );
      }

      // setLastImportCount(newReviewsCount);
    } catch (error) {
      console.error("Failed to import Google reviews:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to import Google reviews";
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  // Real API call to disconnect
  const handleDisconnect = async () => {
    try {
      setError(null);

      const response = await axiosInstance.delete(
        API_PATHS.GOOGLE.DISCONNECT_GOOGLE_ACCOUNT
      );
      toast.success(
        response.data.message || "Google Business Profile disconnected"
      );
      setConnectionStatus({ connected: false });
      setGoogleReviews([]);
    } catch (error) {
      console.error("Failed to disconnect Google:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to disconnect Google Business Profile";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04A4FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#04A4FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                Google Reviews Integration
              </h1>
              <p className="text-white/90 text-lg font-medium">
                Import and display your Google Business reviews alongside
                TrueTestify reviews
              </p>
            </div>
            {connectionStatus?.connected && connectionStatus?.locationId && (
              <div className="mt-6 lg:mt-0">
                <button
                  onClick={() => {
                    const placeId = connectionStatus.locationId.split('/').pop();
                    window.open(`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`, '_blank');
                  }}
                  className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-white font-medium"
                >
                  View Business Location
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl ${
                  connectionStatus?.connected ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {connectionStatus?.connected ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                  Google Business Profile
                </h2>
                <p className="text-gray-500">
                  {connectionStatus?.connected 
                    ? connectionStatus?.needsLocationSelection 
                      ? "Connected - Location Selection Required" 
                      : "Connected" 
                    : "Not Connected"}
                </p>
                {connectionStatus?.businessName && (
                  <p className="text-sm text-gray-400">
                    Business: {connectionStatus.businessName}
                  </p>
                )}
              </div>
            </div>

            {connectionStatus?.connected ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleImportReviews}
                  disabled={importing}
                  className="flex items-center px-4 py-2 bg-[#04A4FF] text-white rounded-lg hover:bg-[#0394E6] transition-colors disabled:opacity-50"
                >
                  {importing ? (
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                  )}
                  {importing ? "Importing..." : "Import New Reviews"}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center px-6 py-3 bg-[#04A4FF] text-white rounded-lg hover:bg-[#0394E6] transition-colors disabled:opacity-50"
              >
                {connecting ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-5 h-5 mr-2" />
                )}
                {connecting ? "Connecting..." : "Connect Google Business"}
              </button>
            )}
          </div>

          {connectionStatus?.connected && connectionStatus.connectedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                Connected on{" "}
                {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                {" • "}
                Reviews are automatically synced
              </p>
            </div>
          )}
        </motion.div>



        {/* Google Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              Imported Google Reviews ({googleReviews.length})
            </h2>
          </div>

          {googleReviews.length > 0 ? (
            <div className="space-y-4">
              {googleReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                        {review.reviewerName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                      Google
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CloudArrowDownIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                No Google Reviews Yet
              </h3>
              <p className="text-gray-500 mb-6">
                {connectionStatus?.connected
                  ? 'Click "Import Reviews" to fetch your Google Business reviews'
                  : "Connect your Google Business Profile to import reviews"}
              </p>
              {!connectionStatus?.connected && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="text-left">
                      <p className="text-orange-700 font-medium text-sm">
                        Setup Required
                      </p>
                      <p className="text-orange-600 text-sm mt-1">
                        Connect your Google Business Profile to automatically
                        import and display your existing reviews.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-[#04A4FF] rounded-2xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            How Google Reviews Integration Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>1</div>
              <div className="text-sm opacity-90">
                Connect your Google Business Profile with one click
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>2</div>
              <div className="text-sm opacity-90">
                Reviews are automatically imported and synced
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>3</div>
              <div className="text-sm opacity-90">
                Display alongside TrueTestify reviews on your public page
              </div>
            </div>
          </div>
        </motion.div>


      </div>
    </div>
  );
};

export default GoogleReviews;
