// src/pages/Security.jsx
import { useEffect, useState } from "react";

const Security = () => {
  const [formData, setFormData] = useState({
    email: "admin@gmail.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("qine_user"));
    if (savedUser?.email) {
      setFormData((prev) => ({
        ...prev,
        email: savedUser.email,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      return alert("Please enter current password");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return alert("New passwords do not match");
    }

    const savedUser = JSON.parse(localStorage.getItem("qine_user")) || {};
    const updatedUser = {
      ...savedUser,
      email: formData.email,
    };

    localStorage.setItem("qine_user", JSON.stringify(updatedUser));

    alert("Email / Password updated successfully!");
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-10">
          Change Password & Email
        </h1>

        <div className="max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                Current Password:
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                New Password:
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                Confirm New Password:
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Security;