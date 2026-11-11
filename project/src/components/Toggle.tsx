interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  activeColor?: string;
}

export function Toggle({ checked, onChange, label, activeColor = '#E07A5F' }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
          checked ? '' : 'bg-cream-200'
        }`}
        style={checked ? { backgroundColor: activeColor } : undefined}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
      {label && (
        <span className="text-sm font-medium text-charcoal">{label}</span>
      )}
    </button>
  );
}
