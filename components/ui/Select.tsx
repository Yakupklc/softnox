"use client";
import { SelectHTMLAttributes, forwardRef, useId, ReactNode } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, errorText, id, required, className, children, ...rest },
  ref
) {
  const autoId = useId();
  const sid = id ?? autoId;
  const helpId = `${sid}-help`;
  const errorId = `${sid}-error`;
  const describedBy = [errorText ? errorId : null, helperText ? helpId : null]
    .filter(Boolean).join(" ") || undefined;
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={sid}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={sid}
        className={["ui-select", className].filter(Boolean).join(" ")}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        required={required}
        {...rest}
      >
        {children}
      </select>
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
