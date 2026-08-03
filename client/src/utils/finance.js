export const formatCurrency = (value = 0, options = {}) => {
  const amount = Number(value) || 0;
  const absoluteValue = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });

  if (options.signed) {
    if (amount > 0) return `+₹${absoluteValue}`;
    if (amount < 0) return `-₹${absoluteValue}`;
  }

  return `₹${absoluteValue}`;
};

export const getBalanceTone = (value = 0) => {
  const amount = Number(value) || 0;

  return amount < 0
    ? {
        color: "#dc2626",
        background: "#fee2e2",
        border: "#fecaca",
      }
    : {
        color: "#16a34a",
        background: "#dcfce7",
        border: "#bbf7d0",
      };
};

export const toDateTimeLocalValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (input) => String(input).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
