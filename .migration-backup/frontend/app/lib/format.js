export function formatCurrency(value) {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    return `Rs ${(amount / 100000).toFixed(1)}L`;
  }

  return `Rs ${amount.toLocaleString()}`;
}

export function formatDate(value, options) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("en-PK", options);
  } catch {
    return "-";
  }
}

export function formatTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "-";
  }
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
