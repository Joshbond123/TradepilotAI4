import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/crypto-api";

interface RecaptchaSettings {
  enabled: boolean;
  siteKey: string;
}

export function useRecaptcha() {
  const { data: settings, isLoading } = useQuery<RecaptchaSettings>({
    queryKey: ["/api/auth/recaptcha-settings"],
    queryFn: () => fetchWithAuth("/auth/recaptcha-settings"),
  });

  return {
    isEnabled: settings?.enabled || false,
    siteKey: settings?.siteKey || "",
    isLoading,
  };
}