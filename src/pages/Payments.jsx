// src/pages/Payments.jsx
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const mockPayments = [
  { id: 1, user: "Sara", amount: 250, bank: "CBE", status: "completed", date: "2026-03-09" },
  { id: 2, user: "Daniel", amount: 120, bank: "Abyssinia", status: "pending", date: "2026-03-09" },
  { id: 3, user: "Meron", amount: 400, bank: "Ahadu", status: "completed", date: "2026-03-08" },
  { id: 5, user: "Helen", amount: 180, bank: "CBE", status: "completed", date: "2026-03-10" },
  { id: 6, user: "Samuel", amount: 500, bank: "Abyssinia", status: "pending", date: "2026-03-10" },
  { id: 7, user: "Ruth", amount: 90, bank: "CBE", status: "completed", date: "2026-03-10" },
  { id: 8, user: "Kidus", amount: 350, bank: "Ahadu", status: "completed", date: "2026-03-10" }
];

const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444"];

const Payments = () => {

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("qine_payments"));

    if (!stored) {
      localStorage.setItem("qine_payments", JSON.stringify(mockPayments));
      setPayments(mockPayments);
    } else {
      setPayments(stored);
    }
  }, []);

  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const failedPayments = payments.filter(p => p.status === "failed").length;
  const completedPayments = payments.filter(p => p.status === "completed").length;

  const bankStats = [
    { bank: "CBE", value: payments.filter(p => p.bank === "CBE").length },
    { bank: "Abyssinia", value: payments.filter(p => p.bank === "Abyssinia").length },
    { bank: "Ahadu", value: payments.filter(p => p.bank === "Ahadu").length },
    { bank: "Tsehay", value: payments.filter(p => p.bank === "Tsehay").length }
  ];

  const revenueData = payments.map(p => ({
    name: p.user,
    amount: p.amount
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 dark:text-white">

      <h1 className="text-3xl font-bold mb-6">Payments Analytics</h1>

      {/* CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h2 className="text-2xl font-bold mt-1">{totalRevenue} ETB</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Completed Payments</p>
          <h2 className="text-2xl font-bold mt-1">{completedPayments}</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Pending Payments</p>
          <h2 className="text-2xl font-bold mt-1">{pendingPayments}</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Failed Payments</p>
          <h2 className="text-2xl font-bold mt-1">{failedPayments}</h2>
        </div>

      </div>

      {/* CHARTS */}

      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Most Used Banks</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={bankStats} dataKey="value" nameKey="bank" outerRadius={110} label>
                {bankStats.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Payment Amounts</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#4f46e5" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">

        <table className="min-w-full text-sm">

          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Bank</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {payments.map(payment => (

              <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                <td className="px-4 py-3">{payment.user}</td>

                <td className="px-4 py-3 font-medium">{payment.amount} ETB</td>

                <td className="px-4 py-3">{payment.bank}</td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs
                    ${payment.status === "completed" && "bg-green-100 text-green-700"}
                    ${payment.status === "pending" && "bg-yellow-100 text-yellow-700"}
                    ${payment.status === "failed" && "bg-red-100 text-red-700"}
                  `}>
                    {payment.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {new Date(payment.date).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Payments;
