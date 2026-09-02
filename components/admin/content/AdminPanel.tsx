import { adminPanel, adminPanelHeader, adminPanelTitle } from "@/constants/admin-layout";

type AdminPanelProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AdminPanel({ title, action, children, className = "" }: AdminPanelProps) {
  return (
    <section className={`${adminPanel} ${className}`}>
      <div className={adminPanelHeader}>
        <h2 className={adminPanelTitle}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
