import React from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";

export interface CurrencyInputProps extends Omit<NumericFormatProps, "onChange" | "value"> {
  value: number | string | undefined | null;
  onValueChangeNumber?: (val: number) => void;
  suffix?: string;
  className?: string;
  placeholder?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onValueChangeNumber,
  suffix = " đ",
  className = "",
  placeholder = "0",
  ...props
}) => {
  return (
    <NumericFormat
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      allowNegative={false}
      suffix={suffix}
      value={value === 0 || value ? value : ""}
      placeholder={placeholder}
      onValueChange={(values) => {
        if (onValueChangeNumber) {
          onValueChangeNumber(values.floatValue || 0);
        }
      }}
      className={`w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${className}`}
      {...props}
    />
  );
};

export interface IntegerInputProps extends Omit<NumericFormatProps, "onChange" | "value"> {
  value: number | string | undefined | null;
  onValueChangeNumber?: (val: number) => void;
  className?: string;
  placeholder?: string;
}

export const IntegerInput: React.FC<IntegerInputProps> = ({
  value,
  onValueChangeNumber,
  className = "",
  placeholder = "0",
  ...props
}) => {
  return (
    <NumericFormat
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      allowNegative={false}
      value={value === 0 || value ? value : ""}
      placeholder={placeholder}
      onValueChange={(values) => {
        if (onValueChangeNumber) {
          onValueChangeNumber(values.floatValue || 0);
        }
      }}
      className={`w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${className}`}
      {...props}
    />
  );
};
