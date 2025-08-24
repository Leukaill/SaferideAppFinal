import { Shield } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-20 h-20"
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} bg-ios-blue rounded-2xl flex items-center justify-center shadow-ios-lg`} data-testid="logo-icon">
        <Shield className={`text-white ${iconSizes[size]}`} />
      </div>
      {showText && (
        <div className="mt-4 text-center">
          <h1 className={`${textSizes[size]} font-bold text-ios-text`} data-testid="logo-text">
            SafeRide
          </h1>
          <p className="text-ios-text-secondary mt-1" data-testid="logo-subtitle">
            Student Transport Safety
          </p>
        </div>
      )}
    </div>
  );
}
