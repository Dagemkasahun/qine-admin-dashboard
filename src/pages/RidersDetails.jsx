import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

const RiderDetails = ({ riders = [], setRiders }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const riderId = Number(id);

  // ⛔ FIX: handle missing data safely
  if (!riders || riders.length === 0) {
    return (
      <div className="p-6">
        <p>Loading rider data...</p>
      </div>
    );
  }

  const rider = riders.find((r) => r.id === riderId);

  if (!rider) {
    return (
      <div className="p-6">
        <p>Rider not found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => navigate("/riders")}
        >
          Go Back
        </button>
      </div>
    );
  }

  const removeRider = () => {
    const updated = riders.filter((r) => r.id !== riderId);
    setRiders(updated);
    navigate("/riders");
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"} min-h-screen p-6`}>

      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/riders")} className="mr-4">
          <ArrowLeft />
        </button>

        <h1 className="text-2xl font-bold">Rider Details</h1>
      </div>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl">

        <h2 className="text-xl font-semibold">{rider.name}</h2>

        <div className="mt-3 text-sm space-y-2">
          <p className="flex items-center gap-2">
            <Phone size={14} /> {rider.phone}
          </p>

          <p>Vehicle: {rider.vehicle}</p>
          <p>Deliveries: {rider.deliveries}</p>
          <p>Rating: {rider.rating}</p>
        </div>

        <button
          onClick={removeRider}
          className="w-full mt-6 bg-red-600 text-white py-2 rounded-lg"
        >
          Remove Rider
        </button>
      </div>
    </div>
  );
};

export default RiderDetails;