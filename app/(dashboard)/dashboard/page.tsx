import { cookies } from "next/headers";
import axios from "axios";
import StatCard from "./components/StatCard";
import DashboardHeader from "./components/DashboardHeader";
import { BASE_API_URL } from "@/global";
import {
  Users,
  FileText,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  customer_number: string;
  service_id: number;
  service?: { name: string };
};

async function getDashboardData() {
  const token = cookies().get("token")?.value;
  const username = cookies().get("username")?.value;
  const headers = {
    Authorization: `Bearer ${token}`,
    "app-key": process.env.NEXT_PUBLIC_APP_KEY,
  };

  const fetchCount = async (endpoint: string) => {
    try {
      const { data } = await axios.get(
        `${BASE_API_URL}${endpoint}?page=1&quantity=100`,
        { headers }
      );
      return data.count ?? data.data?.length ?? 0;
    } catch {
      return 0;
    }
  };

  const fetchRecentCustomers = async (): Promise<Customer[]> => {
    try {
      const { data } = await axios.get(
        `${BASE_API_URL}/customers?page=1&quantity=5`,
        { headers }
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  };

  const fetchAdminMe = async () => {
    try {
      const { data } = await axios.get(`${BASE_API_URL}/admins/me`, {
        headers,
      });
      return data.data ?? data;
    } catch {
      return null;
    }
  };

  try {
    const [
      total_customers,
      total_services,
      total_bills,
      total_payments,
      recentCustomers,
      adminMe,
    ] = await Promise.all([
      fetchCount("/customers"),
      fetchCount("/services"),
      fetchCount("/bills"),
      fetchCount("/payments"),
      fetchRecentCustomers(),
      fetchAdminMe(),
    ]);

    return {
      total_customers,
      total_services,
      total_bills,
      total_payments,
      username: username ?? adminMe?.name,
      role: adminMe?.user?.role ?? "ADMIN",
      recentCustomers,
    };
  } catch {
    return {
      total_customers: 0,
      total_services: 0,
      total_bills: 0,
      total_payments: 0,
      username,
      role: "ADMIN",
      recentCustomers: [] as Customer[],
    };
  }
}

// Warna avatar dinamis sesuai urutan
const avatarColors = [
  "bg-cyan-400/10 text-cyan-400",
  "bg-indigo-400/10 text-indigo-400",
  "bg-amber-400/10 text-amber-400",
  "bg-emerald-400/10 text-emerald-400",
  "bg-rose-400/10 text-rose-400",
];

import DashboardClientView from "./components/DashboardClientView";

export default async function DashboardPage() {
  const stats = await getDashboardData();

  return <DashboardClientView stats={stats} />;
}
