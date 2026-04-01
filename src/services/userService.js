// src/services/userService.js

const USER_KEY = "qine_users";

// Seed data (initial users)
const initialUsers = [
  {
    id: 1,
    name: "Daniel",
    email: "daniel@mail.com",
    role: "merchant",
    status: "active",
    createdAt: "2026-03-10",
  },
  {
    id: 2,
    name: "Sara",
    email: "sara@mail.com",
    role: "customer",
    status: "active",
    createdAt: "2026-03-10",
  },
  {
    id: 3,
    name: "Tesfaye",
    email: "tesfaye@mail.com",
    role: "rider",
    status: "inactive",
    createdAt: "2026-03-10",
  },
  {
    id: 4,
    name: "Meron",
    email: "meron@mail.com",
    role: "merchant",
    status: "active",
    createdAt: "2026-03-10",
  },
 
];

// Initialize localStorage if empty
const init = () => {
  const stored = JSON.parse(localStorage.getItem(USER_KEY));
  if (!stored || stored.length === 0) {
    localStorage.setItem(USER_KEY, JSON.stringify(initialUsers));
  }
};

// Get all users
const getUsers = async () => {
  init();
  const users = JSON.parse(localStorage.getItem(USER_KEY));
  return users;
};

// Get user by ID
const getById = async (id) => {
  const users = await getUsers();
  return users.find((u) => u.id === id);
};

// Add a new user
const addUser = async (user) => {
  const users = await getUsers();
  const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const createdAt = new Date().toISOString().split("T")[0];
  const newUser = { ...user, id, createdAt };
  const updated = [...users, newUser];
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return newUser;
};

// Update an existing user
const updateUser = async (user) => {
  const users = await getUsers();
  const updated = users.map((u) => (u.id === user.id ? user : u));
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return user;
};

// Delete a user by ID
const deleteUser = async (id) => {
  const users = await getUsers();
  const updated = users.filter((u) => u.id !== id);
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return true;
};

export const userService = {
  getUsers,
  getById,
  addUser,
  updateUser,
  deleteUser,
};