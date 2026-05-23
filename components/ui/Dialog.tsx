"use client";
import { ReactNode, useEffect, useId, useState, useRef, TouchEvent as ReactTouchEvent } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";

const EXIT_DURATION = 240;
const DRAG_DISMISS_PX = 120;

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  initialFocus?: "first" | "none";
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  closeOnBackdrop = true,
  initialFocus = "first",
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const isMobile = useIsMobile();

  // Lifecycle: mount → in → ... → out → unmount.
  // `mounted` controls DOM presence; `closing` swaps to the exit animation.
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const unmountTimer = useRef<number | null>(null);

  const containerRef = useFocusTrap<HTMLDivElement>(open && !closing && initialFocus !== "none");
  useScrollLock(mounted);
  useEscapeKey(mounted && !closing, onClose);

  // The only place lifecycle is driven: react to `open` flipping.
  useEffect(() => {
    if (open) {
      // Coming in — cancel any pending unmount.
      if (unmountTimer.current != null) {
        window.clearTimeout(unmountTimer.current);
        unmountTimer.current = null;
      }
      setMounted(true);
      setClosing(false);
      setDragY(0);
      return;
    }
    // open === false. If we have nothing mounted, nothing to do.
    if (!mounted) return;

    // Start exit animation, schedule unmount.
    setClosing(true);
    if (unmountTimer.current != null) window.clearTimeout(unmountTimer.current);
    unmountTimer.current = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setDragY(0);
      unmountTimer.current = null;
    }, EXIT_DURATION);
  }, [open, mounted]);

  // Final cleanup on unmount.
  useEffect(() => {
    return () => {
      if (unmountTimer.current != null) {
        window.clearTimeout(unmountTimer.current);
        unmountTimer.current = null;
      }
    };
  }, []);

  // Browser back integration only while fully open.
  useEffect(() => {
    if (!mounted || closing) return;
    const onPop = () => onClose();
    window.history.pushState({ dialog: titleId }, "");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [mounted, closing, onClose, titleId]);

  // Mobile drag handlers
  function onHandleTouchStart(e: ReactTouchEvent<HTMLDivElement>) {
    if (!isMobile || closing) return;
    dragStartY.current = e.touches[0].clientY;
  }
  function onHandleTouchMove(e: ReactTouchEvent<HTMLDivElement>) {
    if (!isMobile || dragStartY.current == null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  }
  function onHandleTouchEnd() {
    if (!isMobile || dragStartY.current == null) return;
    const settled = dragY;
    dragStartY.current = null;
    if (settled > DRAG_DISMISS_PX) {
      onClose();
    } else {
      setDragY(0);
    }
  }

  if (typeof window === "undefined") return null;
  if (!mounted) return null;

  // Two states:
  // (a) Drag tracking — sheet follows finger, no transition
  // (b) Closing after drag — pass current drag position as CSS var so the
  //     exit keyframe interpolates from there to off-screen (no snap-back flash)
  let dialogStyle: React.CSSProperties | undefined;
  if (closing && dragY > 0) {
    dialogStyle = { ["--drag-start" as string]: `${dragY}px` } as React.CSSProperties;
  } else if (!closing && dragY > 0) {
    dialogStyle = { transform: `translateY(${dragY}px)`, transition: "none" };
  }

  return createPortal(
    <div
      className={"ui-dialog-overlay" + (closing ? " ui-dialog-overlay--closing" : "")}
      onClick={(e) => {
        if (closing) return;
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`ui-dialog ui-dialog--${size}` + (closing ? " ui-dialog--closing" : "")}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="ui-dialog__handle"
          aria-hidden="true"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
          onTouchCancel={onHandleTouchEnd}
        />
        <header className="ui-dialog__head">
          <div>
            <h2 id={titleId} className="ui-dialog__title">{title}</h2>
            {description && <p id={descId} className="ui-dialog__desc">{description}</p>}
          </div>
          <button
            type="button"
            className="ui-dialog__close"
            aria-label="Kapat"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>
        <div className="ui-dialog__body">{children}</div>
        {footer && <footer className="ui-dialog__foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
