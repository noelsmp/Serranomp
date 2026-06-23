import { clsx } from 'clsx';

type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray';

const styles: Record<Variant, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-600',
};

export default function Badge({ label, variant = 'gray' }: { label: string; variant?: Variant }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', styles[variant])}>
      {label}
    </span>
  );
}
