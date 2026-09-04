import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const useAuth = () => {
  const router = useRouter();

  const logout = (redirectPath: string = "/login") => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("subscription", { path: "/" });
    sessionStorage.clear();
    router.push(redirectPath);
  };

  const isAuthenticated = () => {
    return !!Cookies.get("accessToken");
  };

  return { logout, isAuthenticated };
};
