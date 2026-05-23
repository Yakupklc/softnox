"use client";
import { ReactNode, KeyboardEvent, useRef, useId, createContext, useContext } from "react";

export interface TabItem<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TabsContextValue {
  baseId: string;
  activeValue: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps<TValue extends string = string> {
  value: TValue;
  onChange: (v: TValue) => void;
  items: TabItem<TValue>[];
  orientation?: "horizontal" | "vertical";
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

export function Tabs<TValue extends string = string>({
  value,
  onChange,
  items,
  orientation = "horizontal",
  ariaLabel,
  className,
  children,
}: TabsProps<TValue>) {
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKey(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    const last = items.length - 1;
    let next = idx;
    if (orientation === "horizontal") {
      if (e.key === "ArrowRight") next = idx === last ? 0 : idx + 1;
      else if (e.key === "ArrowLeft") next = idx === 0 ? last : idx - 1;
    } else {
      if (e.key === "ArrowDown") next = idx === last ? 0 : idx + 1;
      else if (e.key === "ArrowUp") next = idx === 0 ? last : idx - 1;
    }
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== idx) {
      e.preventDefault();
      const target = items[next];
      if (!target.disabled) {
        refs.current[next]?.focus();
        onChange(target.value);
      }
    }
  }

  const listClass = orientation === "vertical" ? "ui-vtabs" : "ui-tabs";
  const tabClass = orientation === "vertical" ? "ui-vtab" : "ui-tab";

  return (
    <TabsContext.Provider value={{ baseId, activeValue: value }}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={[listClass, className].filter(Boolean).join(" ")}
      >
        {items.map((item, idx) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={el => { refs.current[idx] = el; }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className={tabClass}
              onClick={() => !item.disabled && onChange(item.value)}
              onKeyDown={(e) => handleKey(e, idx)}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
      {children}
    </TabsContext.Provider>
  );
}

export interface TabPanelProps {
  value: string;
  activeValue?: string;
  children: ReactNode;
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  const active = activeValue ?? ctx?.activeValue;
  if (value !== active) return null;
  return (
    <div
      role="tabpanel"
      id={ctx ? `${ctx.baseId}-panel-${value}` : undefined}
      aria-labelledby={ctx ? `${ctx.baseId}-tab-${value}` : undefined}
      className="ui-tab-panel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
