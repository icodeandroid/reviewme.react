import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ShieldCheckIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const [allowTextReviews, setAllowTextReviews] = useState(true);
  const [allowVideoReviews, setAllowVideoReviews] = useState(true);
  const [allowAudioReviews, setAllowAudioReviews] = useState(true);
  const [moderation, setModeration] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved!");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4">
          <ShieldCheckIcon className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Review Settings</h2>
        </div>

        {[
          { label: "Allow Text Reviews", value: allowTextReviews, set: setAllowTextReviews },
          { label: "Allow Video Reviews", value: allowVideoReviews, set: setAllowVideoReviews },
          { label: "Allow Audio Reviews", value: allowAudioReviews, set: setAllowAudioReviews },
          { label: "Moderation Required", value: moderation, set: setModeration },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-gray-700 text-sm">{label}</span>
            <button
              onClick={() => set(!value)}
              className={`w-12 h-6 rounded-full transition-colors ${value ? "bg-orange-500" : "bg-gray-300"}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Save Settings
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Account Info</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          <p><span className="font-medium">Role:</span> {user?.role}</p>
          <p><span className="font-medium">Plan:</span> Starter (Free)</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;


