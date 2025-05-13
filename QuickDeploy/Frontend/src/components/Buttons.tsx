import { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: () => void;
  to?: string; // For Link navigation
  disabled?: boolean;
  icon?: ReactNode; // Optional icon (e.g., from lucide-react)
  className?: string; // Additional Tailwind classes
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  to,
  disabled = false,
  icon,
  className = '',
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-lg',
    secondary:
      'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
    outline:
      'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
    danger:
      'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedStyles} onClick={onClick}>
        {children}
        {icon && <span>{icon}</span>}
      </Link>
    );
  }

  return (
    <button
      className={combinedStyles}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
      {icon && <span>{icon}</span>}
    </button>
  );
};