interface LogoProps {
  variant?: "default" | "light";
}

export function Logo({ variant = "default" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg bg-[#3a7ca5] flex items-center justify-center">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <span className={`text-xl font-bold ${textColor}`}>SummarizeHub</span>
    </div>
  );
}
