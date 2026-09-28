import { useState } from 'react';

export const useFeatureAccess = (feature) => {
  // Simplified - feature access is handled by billing service on backend
  // Frontend assumes access unless explicitly blocked
  const [hasAccess] = useState(true);
  const [loading] = useState(false);

  return { hasAccess, loading };
};

export const useStorageStatus = () => {
  // Temporary: backend mein billing/storage-status endpoint abhi nahi hai,
  // isliye request bhejne ki jagah default values use ho rahi hain
  const [storageStatus] = useState({
    storageUsageGb: 0.1,
    storageLimitGb: 1,
    usagePercentage: 10,
    isExceeded: false,
    canUpload: true,
  });
  const [loading] = useState(false);

  const refetch = () => {};

  return { storageStatus, loading, refetch };
};