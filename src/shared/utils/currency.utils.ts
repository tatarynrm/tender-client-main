export const getCurrencySymbol = (currencyCode?: string): string => {
  switch (currencyCode) {
    case "UAH":
      return "₴";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "PLN":
      return "zł";
    default:
      return currencyCode || "₴";
  }
};
