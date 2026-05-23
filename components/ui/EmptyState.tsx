import { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({ icon, title, body, actions }: EmptyStateProps) {
  return (
    <div className="ui-empty" role="region" aria-label={title}>
      {icon && <div className="ui-empty__icon" aria-hidden="true">{icon}</div>}
      <div className="ui-empty__title">{title}</div>
      {body && <div className="ui-empty__body">{body}</div>}
      {actions && <div className="ui-empty__actions">{actions}</div>}
    </div>
  );
}
