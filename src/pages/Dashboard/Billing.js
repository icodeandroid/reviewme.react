import { useState } from "react";
import toast from "react-hot-toast";

const plans = [
  {
    name: "Starter",
    price: "Free",
    features: ["Up to 100 reviews", "1 widget", "Basic analytics", "Email support"],
    color: "border-gray-200",
    btn: "bg-gray-800",
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: ["Unlimited reviews", "5 widgets", "Advanced analytics", "AI sentiment analysis", "Priority support"],
    color: "border-orange-500",
    btn: "bg-orange-500",
  },
  {
    name: "Enterprise",
    price: "$99/mo",
    features: ["Everything in Pro", "Unlimited widgets", "Custom branding", "API access", "Dedicated support"],
    color: "border-purple-500",
    btn: "bg-purple-600",
  },
];

const Billing = () => {
  const [current] = useState("Starter");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Billing & Plans</h1>
      <p className="text-gray-500">You are currently on the <span className="font-semibold text-orange-500">{current}</span> plan.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white rounded-xl shadow border-2 ${plan.color} p-6 space-y-4`}>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
              <p className="text-3xl font-bold text-gray-900 mt-1">{plan.price}</p>
            </div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">?</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => toast.success(`${plan.name} plan selected! (Demo mode)`)}
              className={`w-full py-2.5 ${plan.btn} text-white rounded-lg text-sm font-semibold hover:opacity-90 transition`}
            >
              {current === plan.name ? "Current Plan" : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;


