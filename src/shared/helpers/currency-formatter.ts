export const currencyStringTransform = (currency: string) => {
    switch (currency) {
        case "USD":
            return "$";
        case "EUR":
            return "€";
        case "UAH":
            return "₴";
        case "PLN":
            return "zł";
        default:
            return currency;
    }
};