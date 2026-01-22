import Cookies from "js-cookie";

export const storeCookie = (key: string, value: string) => {
  Cookies.set(key, value, {
    expires: 1,
    sameSite: "lax",
  });
};

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const removeCookie = (key: string) => {
  Cookies.remove(key);
};
