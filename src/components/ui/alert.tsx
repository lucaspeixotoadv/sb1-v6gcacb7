import React from "react";

interface AlertProps {
  variant?: "default" | "destructive";
  className?: string;
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = "default", 
  className = "", 
  children 
}) => {
  const baseStyles = "relative w-full rounded-lg border px-4 py-3 text-sm";
  const variantStyles = variant === "destructive" 
    ? "border-red-500/50 text-red-700 bg-red-50"
    : "bg-white text-gray-900 border-gray-200";

  return (
    <div
      role="alert"
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ 
  className = "", 
  children 
}) => (
  <h5
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
  >
    {children}
  </h5>
);

export const AlertDescription: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ 
  className = "", 
  children 
}) => (
  <div
    className={`text-sm ${className}`}
  >
    {children}
  </div>
);