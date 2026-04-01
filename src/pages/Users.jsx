// src/pages/Users.jsx
import { useState, useEffect } from "react";
import { User, Search, Edit, Trash2, Save, X, Plus } from "lucide-react";
import { userService } from "../services/userService";

const USERS_PER_PAGE = 5;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "customer",
    status: "active",
  });

  // Load users from userService
  const loadUsers = async () => {
    const allUsers = await userService.getUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      await userService.deleteUser(id);
      await loadUsers();
      setSelectedUser(null);
    }
  };

  // Handle Edit
  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditData(user);
  };

  const cancelEdit = () => setEditingUser(null);

  const saveEdit = async () => {
    await userService.updateUser(editData);
    await loadUsers();
    setEditingUser(null);
  };

  // Handle Add User
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      alert("Name and Email are required");
      return;
    }
    await userService.addUser(newUser);
    setNewUser({ name: "", email: "", role: "customer", status: "active" });
    setAddingUser(false);
    await loadUsers();
  };

  /* FILTER AND PAGINATION */
  const filteredUsers = users.filter(
    (u) =>
      u.role !== "admin" &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (page - 1) * USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  /* DASHBOARD STATS */
  const totalUsers = users.filter((u) => u.role !== "admin").length;
  const totalRiders = users.filter((u) => u.role === "rider").length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalMerchants = users.filter((u) => u.role === "merchant").length;

  return (
    <div className="max-w-7xl mx-auto px-4 dark:text-white">
      {/* Add User Button */}
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => setAddingUser(!addingUser)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-sm text-gray-500">Riders</p>
          <p className="text-2xl font-bold">{totalRiders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-sm text-gray-500">Customers</p>
          <p className="text-2xl font-bold">{totalCustomers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <p className="text-sm text-gray-500">Merchants</p>
          <p className="text-2xl font-bold">{totalMerchants}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full outline-none bg-transparent dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b">
            <tr>
              <th className="px-4 py-3 text-left w-1/5">User</th>
              <th className="px-4 py-3 text-left w-2/5">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td
                  className="px-4 py-3 flex items-center gap-2 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <User size={18} className="text-gray-400" />
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="capitalize">{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER FORM */}
      {addingUser && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow my-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="merchant">merchant</option>
              <option value="customer">customer</option>
              <option value="rider">rider</option>
            </select>
            <select
              value={newUser.status}
              onChange={(e) =>
                setNewUser({ ...newUser, status: e.target.value })
              }
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
            <button
              onClick={handleAddUser}
              className="px-3 py-1 bg-green-500 text-white rounded flex items-center gap-1"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={() => setAddingUser(false)}
              className="px-3 py-1 bg-gray-400 text-white rounded flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-40"
        >
          Previous
        </button>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;