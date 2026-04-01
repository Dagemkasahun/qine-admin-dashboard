// src/pages/Profile.jsx
import { useEffect, useState } from "react";

const defaultUser = {
  name: "Admin",
  email: "admin@gmail.com",
  role: "admin",
  avatar: "",
};

const Profile = () => {
  const [formData, setFormData] = useState(defaultUser);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("qine_user"));
    if (savedUser) {
      setFormData({
        name: savedUser.name || "Admin",
        email: savedUser.email || "admin@gmail.com",
        role: savedUser.role || "admin",
        avatar: savedUser.avatar || "",
      });
      setPreview(savedUser.avatar || "");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("qine_user", JSON.stringify(formData));
    alert("Profile updated successfully!");
    window.location.reload();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-10">My Profile</h1>

        <div className="max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-100">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-400">Profile</span>
                )}
              </div>

              <label className="mt-4 cursor-pointer">
                <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-md border border-gray-300">
                  Choose Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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

            {/* Role */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                Role:
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                readOnly
                className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-700"
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

export default Profile;