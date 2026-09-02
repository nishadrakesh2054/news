import { adminFilterTab, adminFilterTabActive, adminFilterTabs } from "@/constants/admin-layout";

type AdminFilterTabsProps = {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function AdminFilterTabs({ value, options, onChange }: AdminFilterTabsProps) {
  return (
    <div className={adminFilterTabs}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={value === option.value ? adminFilterTabActive : adminFilterTab}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
