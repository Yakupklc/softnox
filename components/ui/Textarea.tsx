"use client";
import { TextareaHTMLAttributes, forwardRef, useId } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, errorText, id, required, className, ...rest },
  ref
) {
  const autoId = useId();
  const tid = id ?? autoId;
  const helpId = `${tid}-help`;
  const errorId = `${tid}-error`;
  const describedBy = [errorText ? errorId : null, helperText ? helpId : null]
    .filter(Boolean).join(" ") || undefined;
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={tid}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        className={["ui-textarea", className].filter(Boolean).join(" ")}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        required={required}
        {...rest}
      />
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
