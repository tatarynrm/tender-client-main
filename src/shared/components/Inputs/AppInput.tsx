"use client";

import React from "react";
import { useController, Control } from "react-hook-form";

type InputType =
  | "text"
  | "number"
  | "finance"
  | "phone"
  | "email"
  | "password"
  | "textarea"
  | "url"
  | "percent"
  | "custom";

interface CustomInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  type?: InputType;
  placeholder?: string;
  className?: string;
  defaultCountry?: string; // для телефону
  max?: number; // для percent
  customFormatter?: (value: string) => string; // для custom
}

const formatFinance = (value: string | number) => {
  if (value === undefined || value === null) return "";
  const num = Number(value.toString().replace(/,/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString();
};

const formatPhone = (value: string, country = "UA") => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && country === "UA") digits = digits.slice(1);
  if (country === "UA") digits = "+380" + digits;
  return digits;
};

export const CustomInput: React.FC<CustomInputProps> = ({
  name,
  control,
  label,
  className,
  type = "text",
  placeholder,
  defaultCountry = "UA",
  max = 100,
  customFormatter,
}) => {
  const {
    field: { value, onChange, ...rest },
    fieldState: { error },
  } = useController({ name, control });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let val = e.target.value;

    switch (type) {
      case "number": {
        const num = e.target.value.replace(/\D/g, "");
        onChange(num === "" ? null : Number(num));
        val = num; // для UI
        break;
      }
      case "finance": {
        const raw = e.target.value.replace(/\D/g, "");
        onChange(raw === "" ? null : Number(raw));
        val = raw === "" ? "" : formatFinance(raw); // для UI
        break;
      }
      case "percent": {
        const raw = e.target.value.replace(/\D/g, "");
        const num = raw === "" ? null : Math.min(Number(raw), max);
        onChange(num);
        val = num !== null ? num.toString() : ""; // якщо num null — пустий рядок
        break;
      }

      case "phone":
        val = formatPhone(e.target.value, defaultCountry);
        onChange(val);
        break;
      case "custom":
        if (customFormatter) val = customFormatter(e.target.value);
        onChange(val);
        break;
      default:
        onChange(val);
        break;
    }
  };

  const commonProps = {
    ...rest,
    value: value ?? "",
    onChange: handleChange,
    placeholder,
    className: `border p-2 rounded ${error ? "border-red-500" : "border-gray-300"} ${className ?? ""}`,
  };

  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 font-semibold">{label}</label>}

      {type === "textarea" ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input
          {...commonProps}
          type={type === "password" ? "password" : "text"}
        />
      )}

      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};
