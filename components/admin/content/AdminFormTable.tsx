import {
  adminFormLabel,
  adminFormRow,
  adminFormSection,
  adminFormSectionHeader,
  adminFormSerial,
  adminFormTable,
  adminFormValue,
} from "@/constants/admin-layout";

type AdminFormSectionProps = {
  title: string;
  number?: number;
  children: React.ReactNode;
  className?: string;
  showColumnHeader?: boolean;
  /** Use inside modals — table only, no outer section header */
  embedded?: boolean;
  /** Shown under the section title, above the field table */
  hint?: string;
};

export function AdminFormSection({
  title,
  number,
  children,
  className = "",
  showColumnHeader = true,
  embedded = false,
  hint,
}: AdminFormSectionProps) {
  const table = (
    <table className={adminFormTable}>
      {showColumnHeader ? (
        <thead>
          <tr className="border-b border-border/70 bg-muted/35 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <th className={`${adminFormSerial} py-1.5`}>Sn.</th>
            <th className={`${adminFormLabel} py-1.5`}>Field</th>
            <th className={`${adminFormValue} py-1.5 text-left`}>Details</th>
          </tr>
        </thead>
      ) : null}
      <tbody>{children}</tbody>
    </table>
  );

  if (embedded) {
    return (
      <div className={`${adminFormSection} overflow-hidden ${className}`}>
        {hint ? (
          <p className="border-b border-border/70 bg-muted/15 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
        {table}
      </div>
    );
  }

  return (
    <section className={`${adminFormSection} ${className}`}>
      <div className={adminFormSectionHeader}>
        {number !== undefined ? `${number}. ` : ""}
        {title}
      </div>
      {hint ? (
        <p className="border-b border-border/70 bg-muted/15 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {table}
    </section>
  );
}

type AdminFormRowProps = {
  label: string;
  required?: boolean;
  hint?: string;
  serial?: number | string;
  children: React.ReactNode;
};

export function AdminFormRow({
  label,
  required,
  hint,
  serial,
  children,
}: AdminFormRowProps) {
  return (
    <tr className={adminFormRow}>
      {serial !== undefined ? <th className={adminFormSerial}>{serial}</th> : null}
      <th scope="row" className={adminFormLabel}>
        {label}
        {required ? <span className="text-[#C3272E]"> *</span> : null}
      </th>
      <td className={adminFormValue}>
        {children}
        {hint ? <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      </td>
    </tr>
  );
}

type AdminFormBodySectionProps = {
  title: string;
  number?: number;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Full-width block for long-form fields (article body, etc.) */
export function AdminFormBodySection({
  title,
  number,
  hint,
  required,
  children,
  className = "",
}: AdminFormBodySectionProps) {
  return (
    <section className={`${adminFormSection} ${className}`}>
      <div className={adminFormSectionHeader}>
        {number !== undefined ? `${number}. ` : ""}
        {title}
        {required ? <span className="font-normal opacity-90"> (required)</span> : null}
      </div>
      {hint ? (
        <p className="border-b border-border/70 bg-muted/15 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}
