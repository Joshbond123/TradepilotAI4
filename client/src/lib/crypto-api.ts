import { getAuthHeaders } from "./auth";

const API_BASE = "/api";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export async function getCryptoPrices() {
  return fetchWithAuth("/crypto/prices");
}

export async function getArbitrageOpportunities() {
  return fetchWithAuth("/crypto/arbitrage");
}

export async function getInvestmentPlans() {
  return fetchWithAuth("/plans");
}

export async function investInPlan(planId: string, amount: number) {
  return fetchWithAuth(`/plans/${planId}/invest`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getUserInvestments() {
  return fetchWithAuth("/investments");
}

export async function getUserDeposits() {
  return fetchWithAuth("/deposits");
}

export async function getUserWithdrawals() {
  return fetchWithAuth("/withdrawals");
}

export async function createWithdrawal(data: {
  cryptocurrency: string;
  amount: string;
  usdValue: string;
  walletAddress: string;
  networkFee: string;
}) {
  return fetchWithAuth("/withdrawals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSystemWallets() {
  return fetchWithAuth("/system/wallets");
}

export async function getUserMessages() {
  return fetchWithAuth("/messages");
}

export async function markMessageAsRead(messageId: string) {
  return fetchWithAuth(`/messages/${messageId}/read`, {
    method: "PATCH",
  });
}

export async function getSupportTickets() {
  return fetchWithAuth("/support-tickets");
}

export async function createSupportTicket(data: {
  subject: string;
  message: string;
}) {
  return fetchWithAuth("/support-tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getReferralData() {
  return fetchWithAuth("/referrals");
}
