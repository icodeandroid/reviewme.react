import { useState } from "react";

const useSubscription = () => {
  const [subscriptionData] = useState({
    plan: "Starter",
    status: "active",
    trialDaysLeft: 30,
    tier: "free",
  });

  return { subscriptionData, loading: false, error: null };
};

export default useSubscription;


