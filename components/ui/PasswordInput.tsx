"use client";
import { InputHTMLAttributes, forwardRef, useId, useState } from "react";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  showCapsHint?: boolean;
  required?: boolean;
}

const EyeIcon = ({ off }: { off?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { label, helperText, errorText, showCapsHint = true, required, id, className, onKeyUp, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const capsId = `${inputId}-caps`;
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);

  const describedBy = [
    errorText ? errorId : null,
    helperText ? helpId : null,
    caps ? capsId : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="ui-input-group">
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          className={["ui-input", className].filter(Boolean).join(" ")}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          required={required}
          style={{ paddingRight: 44 }}
          onKeyUp={(e) => {
            if (showCapsHint && e.getModifierState) setCaps(e.getModifierState("CapsLock"));
            onKeyUp?.(e);
          }}
          {...rest}
        />
        <span className="ui-input-group__suffix">
          <button
            type="button"
            className="ui-password-toggle"
            aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={visible}
            onClick={() => setVisible(v => !v)}
          >
            <EyeIcon off={!visible} />
          </button>
        </span>
      </div>
      {caps && (
        <div id={capsId} className="ui-caps-hint" role="status">
          ⚠ Caps Lock açık
        </div>
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
