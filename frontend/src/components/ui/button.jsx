import * as React from "react";

const Button = React.forwardRef(
  (
    { className = "", variant = "default", size = "default", ...props },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95";

    const variants = {
      default:
        "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:shadow-xl",
      outline:
        "border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm text-white hover:bg-slate-700/50 hover:border-slate-500/70",
      ghost: "hover:bg-slate-800/50 hover:text-white",
      link: "underline-offset-4 hover:underline text-indigo-400",
    };

    const sizes = {
      default: "h-10 py-2 px-4 text-sm rounded-xl",
      sm: "h-9 px-3 text-sm rounded-lg",
      lg: "h-12 px-8 text-base rounded-xl",
      icon: "h-10 w-10 rounded-xl",
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button className={classes} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
