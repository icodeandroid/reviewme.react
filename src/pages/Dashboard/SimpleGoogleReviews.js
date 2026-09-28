import React, { useState } from "react";
import { motion } from "framer-motion";
import { StarIcon, MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import axiosInstance from "../../service/axiosInstanse";
import toast from "react-hot-toast";

const SimpleGoogleReviews = () => {
  const [placeId, setPlaceId] = useState("ChIJMQrEH-dqsz4RbVar5mEdu88"); // Default Place ID
  const [reviews, setReviews] = useState([]);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!placeId.trim()) {
      toast.error("Please enter a Place ID");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/google/simple-reviews/${placeId}`
      );

      setBusinessInfo({
        name: response.data.businessName,
        rating: response.data.averageRating,
        totalReviews: response.data.totalReviews,
      });
      setReviews(response.data.reviews || []);
      toast.success(`Loaded ${response.data.reviews?.length || 0} reviews!`);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch Google reviews"
      );
      setReviews([]);
      setBusinessInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#04A4FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            Simple Google Reviews
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Fetch Google reviews instantly - No OAuth required!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            Enter Google Place ID
          </h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJMQrEH-dqsz4RbVar5mEdu88"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04A4FF] focus:border-transparent"
            />
            <button
              onClick={fetchReviews}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-[#04A4FF] text-white rounded-lg hover:bg-[#0394E6] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Fetch Reviews
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            💡 Find your Place ID:{" "}
            <a
              href="https://developers.google.com/maps/documentation/places/web-service/place-id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#04A4FF] hover:underline"
            >
              Google Place ID Finder
            </a>
          </p>
        </motion.div>

        {/* Business Info */}
        {businessInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                  {businessInfo.name}
                </h2>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(businessInfo.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 font-medium">
                    {businessInfo.rating.toFixed(1)} ({businessInfo.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              Reviews ({reviews.length})
            </h2>

            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {review.profilePhoto && (
                        <img
                          src={review.profilePhoto}
                          alt={review.reviewerName}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
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
                            {review.relativeTime || new Date(review.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
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
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && reviews.length === 0 && !businessInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
          >
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              No Reviews Yet
            </h3>
            <p className="text-gray-500">
              Enter a Google Place ID and click "Fetch Reviews" to get started
            </p>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-[#04A4FF] rounded-2xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>1</div>
              <div className="text-sm opacity-90">
                Get your Google Place ID from Google Maps
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>2</div>
              <div className="text-sm opacity-90">
                Enter the Place ID and click "Fetch Reviews"
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>3</div>
              <div className="text-sm opacity-90">
                View up to 5 most recent Google reviews instantly
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleGoogleReviews;


