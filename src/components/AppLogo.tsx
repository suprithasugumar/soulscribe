interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const AppLogo = ({ className = "", size = "md", showText = true }: AppLogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10 md:h-12 md:w-12",
    lg: "h-12 w-12 md:h-16 md:w-16"
  };

  const textSizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl lg:text-4xl",
    lg: "text-3xl md:text-4xl lg:text-5xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/favicon.png" 
        alt="SoulScribe Logo" 
        className={`${sizeClasses[size]} object-contain transition-transform hover:scale-105`}
      />
      {showText && (
        <span className={`${textSizeClasses[size]} font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
          SoulScribe
        </span>
      )}
    </div>
  );
};
