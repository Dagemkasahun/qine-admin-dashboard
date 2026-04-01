// src/pages/AssignRider.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const AssignRider = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  const [riders] = useState([
    { id: 1, name: "Rider 1" },
    { id: 2, name: "Rider 2" },
    { id: 3, name: "Rider 3" }
  ]);

  const assign = (rider) => {
    alert(`Assigned ${rider.name} to ${order.id}`);

    // ⚠️ this is temporary (no backend/global state yet)
    navigate("/orders");
  };

  if (!order) return <p>No order selected</p>;

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">

      <h1 className="text-2xl font-bold mb-6 text-white">
        Assign Rider to {order.id}
      </h1>

      <div className="grid gap-4">
        {riders.map(rider=>(
          <div key={rider.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl flex justify-between">
            
            <span>{rider.name}</span>

            <button
              onClick={()=>assign(rider)}
              className="bg-teal-600 text-white px-4 py-1 rounded-lg"
            >
              Assign
            </button>

          </div>
        ))}
      </div>

    </div>
  );
};

export default AssignRider;