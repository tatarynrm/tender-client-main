// Стилі для Select з урахуваннямFontSize
export const selectStyles = (config: any) => {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const textColor = isDark ? "#ffffff" : "#1e293b"; // Білий для темної, темно-синій для світлої
  const placeholderColor = isDark
    ? "rgba(255, 255, 255, 0.5)"
    : "rgba(30, 41, 59, 0.5)";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(148, 163, 184, 0.2)";

  return {
    control: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#0f172a" : "#ffffff", // Чіткий фон для кожної теми
      borderRadius: "0.75rem",
      borderColor: borderColor,
      minHeight: "38px",
      fontSize: config.main.includes("text-xs") ? "12px" : "14px",
      boxShadow: "none",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),

    // Текст, який вводить користувач (пошук)
    input: (base: any) => ({
      ...base,
      color: textColor,
    }),

    // Текст підказки (Оберіть...)
    placeholder: (base: any) => ({
      ...base,
      color: placeholderColor,
    }),

    // Вибране значення в одиночному селекті
    singleValue: (base: any) => ({
      ...base,
      color: textColor,
    }),

    // Іконки (стрілочка та хрестик)
    dropdownIndicator: (base: any) => ({
      ...base,
      color: placeholderColor,
      "&:hover": { color: textColor },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: placeholderColor,
      "&:hover": { color: "#ef4444" },
    }),

    // Мульти-селект (теги)
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      borderRadius: "0.5rem",
      border: isDark ? "1px solid rgba(59, 130, 246, 0.3)" : "none",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#3b82f6",
      paddingLeft: "8px",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#3b82f6",
      "&:hover": {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        color: "#ef4444",
        borderRadius: "0 0.5rem 0.5rem 0",
      },
    }),

    // Випадаюче меню
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      backdropFilter: "blur(12px)",
      borderRadius: "0.75rem",
      zIndex: 100,
      border: `1px solid ${borderColor}`,
      boxShadow: isDark
        ? "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    }),

    // Опції в списку
    option: (base: any, state: any) => ({
      ...base,
      fontSize: "0.875rem",
      cursor: "pointer",
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(59, 130, 246, 0.05)"
          : "transparent",
      color: state.isSelected ? "#ffffff" : textColor,
      "&:active": {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
      },
    }),
  };
};
