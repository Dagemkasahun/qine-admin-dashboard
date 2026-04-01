import { seedMerchants } from "../data/merchants";

// Initialize localStorage once
if (!localStorage.getItem("merchants")) {
  localStorage.setItem("merchants", JSON.stringify(seedMerchants));
}

// Get all merchants
export const getMerchants = async () => {
  return JSON.parse(localStorage.getItem("merchants"));
};

// Get merchant by ID
export const getMerchantById = async (id) => {
  const merchants = JSON.parse(localStorage.getItem("merchants"));
  return merchants.find(m => m.id === id);
};

// Add a new merchant
export const addMerchant = async (merchant) => {
  const merchants = JSON.parse(localStorage.getItem("merchants"));
  merchants.push(merchant);
  localStorage.setItem("merchants", JSON.stringify(merchants));
};

// Update an existing merchant
export const updateMerchant = async (updatedMerchant) => {
  const merchants = JSON.parse(localStorage.getItem("merchants"));
  const index = merchants.findIndex(m => m.id === updatedMerchant.id);
  if (index !== -1) {
    merchants[index] = updatedMerchant;
    localStorage.setItem("merchants", JSON.stringify(merchants));
  }
};

// Delete a merchant
export const deleteMerchant = async (id) => {
  let merchants = JSON.parse(localStorage.getItem("merchants"));
  merchants = merchants.filter(m => m.id !== id);
  localStorage.setItem("merchants", JSON.stringify(merchants));
};