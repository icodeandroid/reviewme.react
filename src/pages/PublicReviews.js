import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ContactInfoCard from "../components/ContactInfoCard";
import HeaderSocialIcons from "../components/HeaderSocialIcons";
import StarRating from "../components/StarRating";
import PublicReviewCard from "../components/PublicReviewCard";
import PublicReviewPreviewModal from "../components/PublicReviewPreviewModal";
import QRCode from "qrcode";
import { QrCodeIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const PublicReviews = ({ businessSlug }) => {
  const { businessName } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [notFound, setNotFound] = useState(false);
 const [reviewFilters, setReviewFilters] = useState({
    video: true,
    audio: false,
    text: false
  }); 
  
  // Fetching Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const response = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE(businessName || businessSlug));
      console.log(response.data);
      
      if (!response.data.business) {
        setNotFound(true);
        return;
      }
      
       setBusiness(response.data.business);
       console.log(response);
      const allReviewsData = response.data.reviews || [];
      setAllReviews(allReviewsData);
      setReviews(allReviewsData); 
        setFormData({
          name: response.data.business.name || '',
          description: response.data.business.description || '',
          industry: response.data.business.industry || '',
          website: response.data.business.website || '',
          contactEmail: response.data.business.contactEmail || '',
          phone: response.data.business.phone || '',
          address: response.data.business.address || '',
          city: response.data.business.city || '',
          state: response.data.business.state || '',
          country: response.data.business.country || '',
          postalCode: response.data.business.postalCode || '',
          companySize: response.data.business.companySize || '',
          foundedYear: response.data.business.foundedYear || '',
          brandColor: response.data.business.brandColor || '#ef7c00',
          thumbnailUrl: response.data.business.thumbnailUrl || '',
          bannerUrl: response.data.business.bannerUrl || '',
          businessHours: typeof response.data.business.businessHours === 'string' ? response.data.business.businessHours : JSON.stringify(response.data.business.businessHours || {}),
          socialLinks: typeof response.data.business.socialLinks === 'string' ? response.data.business.socialLinks : JSON.stringify(response.data.business.socialLinks || {})
        });
    } catch (error) {
      console.error("Failed to load data:", error);
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(error.response?.data?.message || "Could not load business data.");
      }
    } finally {
      setLoading(false);
    }
  };

// Handle filter change
  const handleFilterChange = (type) => {
    if (type === 'all') {
      // Toggle all filters
      const allActive = reviewFilters.video && reviewFilters.audio && reviewFilters.text;
      setReviewFilters({
        video: !allActive,
        audio: !allActive,
        text: !allActive
      });
    } else {
      const newFilters = {
        ...reviewFilters,
        [type]: !reviewFilters[type]
      };
      setReviewFilters(newFilters);
    }
  };

  
// Filter reviews for display based on active filters
  const getFilteredReviews = () => {
    // Check if 'all' filter is active
    const allActive = reviewFilters.video && reviewFilters.audio && reviewFilters.text;
    
    if (allActive) {
      return allReviews;
    }
    
    return allReviews.filter(review => {
      if (review.type === 'video' && reviewFilters.video) return true;
      if (review.type === 'audio' && reviewFilters.audio) return true;
      if ((review.type === 'text' || review.type === 'google') && reviewFilters.text) return true;
      return false;
    });
  };

// Handle view review modal
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

// Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  // Get count for each review type
    const getReviewTypeCount = (type) => {
    if (type === 'all') {
      return allReviews.length;
    }
    if (type === 'text') {
      return allReviews.filter(review => review.type === 'text' || review.type === 'google').length;
    }
    return allReviews.filter(review => review.type === type).length;
  };

  useEffect(() => {
    fetchData(); // eslint-disable-next-line
  }, [businessName, businessSlug]);


 const calculateAverageRating = () => {
    if (allReviews.length === 0) return '0.0';
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };
  const averageRating = calculateAverageRating();
  const displayedReviews = getFilteredReviews();
  useEffect(() => {
    fetchData();
  }, []);

  // Generate QR code
  const publicRecordUrl = `${window.location.origin}/record/${businessName || businessSlug}`;
  
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(publicRecordUrl, {
          margin: 1,
          width: 256,
        });
        if (isMounted) setQrDataUrl(dataUrl);
      } catch (_) {
        // no-op
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [publicRecordUrl]);

  const handleDownloadQr = async () => {
    try {
      const dataUrl = qrDataUrl || (await QRCode.toDataURL(publicRecordUrl, { margin: 1, width: 512 }));
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `truetestify-record-${businessName || businessSlug}.png`;
      link.click();
      toast.success("QR code downloaded.");
    } catch (e) {
      toast.error("Failed to generate QR code");
    }
  };


  const getS3Url = (s3Key) => {
    if (!s3Key) return null;
    if (s3Key.startsWith('http')) return s3Key;
    return `https://truetestify.s3.us-east-1.amazonaws.com/${s3Key}`;
  };

  // 404 Page
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-8">
            <svg className="w-32 h-32 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Business Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The business you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50`} style={{ fontFamily: 'Inter, Poppins, system-ui, sans-serif' }}>
      
      {/* --- NEW HEADER (as per image) --- */}
      <div className="relative">
        {/* Banner Background */}
        {loading ? (
            <Skeleton height={200} />
        ) : (
            <div 
                className="h-48 md:h-64 bg-gray-300 relative group cursor-pointer"
                style={{
                backgroundImage: business?.bannerUrl ? `url(${getS3Url(business.bannerUrl)})` : 'linear-gradient(to right, #6366f1, #a855f7)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
                }}
            >
            </div>
        )}

        {/* Content Overlap Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20">
            
            {/* Left Side: White Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-9xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                
                {/* Left: Logo + Business Info */}
                <div className="flex items-center space-x-4">
                  {/* Logo */}
                  <div className="flex-shrink-0 relative group">
                    {loading ? (
                      <Skeleton circle width={80} height={80} />
                    ) : business?.logoUrl ? (
                      <img
                        src={getS3Url(business.logoUrl)}
                        alt={business.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white">
                        <span className="text-white text-3xl font-bold">
                          {business?.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Business Info */}
                  <div>
                    {loading ? (
                      <>
                        <Skeleton width={250} height={28} className="mb-2" />
                        <Skeleton width={120} height={16} className="mb-2" />
                        <Skeleton width={180} height={20} />
                      </>
                    ) : (
                      <>
                        {/* Business Name */}
                        <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
                        
                        {/* Business Category */}
                        <span className="text-sm text-gray-600 mb-2 block">{business?.industry || 'Business Category'}</span>
                        
                        {/* Rating Display */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-800">{averageRating}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">({allReviews.length} reviews)</span>
                          </div>
                        </div>
                        
                        {/* Add Review Button */}
                        <Link to={`/record/${business?.slug}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Add Review
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Right Side: Social Icons + QR Code (floating) */}
            <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="bg-gray-200 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  title="View QR Code"
                >
                  <QrCodeIcon className="w-11 h-11 text-blue-600" />
                </button>
                <HeaderSocialIcons business={business} />
            </div>

          </div>
        </div>
      </div>
      {/* --- END NEW HEADER --- */}


      {/* --- Main Content Grid (Two Columns) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About the company */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {loading ? (
                <>
                  <Skeleton height={28} width={200} className="mb-4" />
                  <Skeleton count={3} height={16} />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{business?.description || 'Tell customers about your business, what makes you unique, and what they can expect when working with you.'}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Employee Interest (Dynamic rating from backend) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Ratings</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="text-4xl font-bold text-gray-800">{averageRating}</div>
                  <StarRating rating={averageRating} reviewCount={allReviews.length} />
                </div>
                <div className="w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = allReviews.filter(review => review.rating === star).length;
                    const percentage = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-12">{star} star</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{Math.round(percentage)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 sm:mb-0">Customer Reviews</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'video', label: 'Video', color: 'orange', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                    { type: 'audio', label: 'Voice', color: 'purple', icon: 'M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' },
                    { type: 'text', label: 'Text', color: 'green', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { type: 'all', label: 'All', color: 'blue', icon: 'M19 11H5m14-7H3a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z' },
                  ].map(({ type, label, color, icon }) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange(type)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        type === 'all' 
                          ? (reviewFilters.video && reviewFilters.audio && reviewFilters.text)
                            ? `bg-${color}-100 text-${color}-800 border-${color}-200 shadow-sm`
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          : reviewFilters[type]
                            ? `bg-${color}-100 text-${color}-800 border-${color}-200 shadow-sm`
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      <span>{label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        type === 'all'
                          ? (reviewFilters.video && reviewFilters.audio && reviewFilters.text) ? 'bg-white bg-opacity-50' : 'bg-gray-200'
                          : reviewFilters[type] ? 'bg-white bg-opacity-50' : 'bg-gray-200'
                      }`}>
                        {type === 'all' ? allReviews.length : getReviewTypeCount(type)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                      <Skeleton height={200} />
                    </div>
                  ))
                ) : displayedReviews.length > 0 ? (
                  displayedReviews.map((review) => (
                    <PublicReviewCard
                      key={review.id}
                      review={review}
                      onViewReview={handleViewReview}
                    />
                  ))
                ) : (
                  <div className="col-span-1 lg:col-span-2 text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Customer reviews of the selected types will appear here once they're approved.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* --- Right Column --- */}
          <div className="lg:col-span-1">
                        <ContactInfoCard
                          business={business}
                          editing={false}
                          formData={formData}
                          handleInputChange={false}
                          saveField={false}
                          toggleEdit={false}
                          isReadOnly={true}
                          loading={loading}
                          onSaveContact={false}
                        />
          </div>

        </div>
      </div>

      {/* Review Preview Modal */}
      {isModalOpen && selectedReview && (
        <PublicReviewPreviewModal
          review={selectedReview}
          isOpen={isModalOpen}
          onClose={closeModal}
          isReadOnly={false}
        />
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Scan to Leave a Review</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Review QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <QrCodeIcon className="w-16 h-16 mx-auto mb-4" />
                      <div>Generating QR Code...</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Page URL</label>
                <input
                  type="text"
                  value={publicRecordUrl}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800"
                />
              </div>
              
              <button
                onClick={handleDownloadQr}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PublicReviews;