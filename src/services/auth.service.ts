import api from "@/lib/api";

export const login = async (payload: {
  username: string;
  password: string;
}) => {
  const res = await api.post("/auth", payload);
  return res.data;
};
