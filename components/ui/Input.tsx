"use client";
import { InputHTMLAttributes, forwardRef, ReactNode, useId } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, errorText, required, suffix, id, className, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [errorText ? errorId : null, helperText ? helpId : null]
    .filter(Boolean).join(" ") || undefined;

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      className={["ui-input", className].filter(Boolean).join(" ")}
      aria-invalid={errorText ? true : undefined}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      required={required}
      {...rest}
    />
  );

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {suffix ? (
        <div className="ui-input-group">
          {inputEl}
          <span className="ui-input-group__suffix">{suffix}</span>
        </div>
      ) : (
        inputEl
      )}
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
