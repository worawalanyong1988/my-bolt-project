interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <span className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
      <svg
        viewBox="0 0 72 72"
        aria-hidden="true"
        className={compact ? 'h-9 w-9' : 'h-11 w-11'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M36 9c-14.4 0-26 11.6-26 26v25h8V35c0-10 8-18 18-18s18 8 18 18v25h8V35C62 20.6 50.4 9 36 9Z"
          fill="#B08A45"
        />
        <path d="M30 13h12v27l-6-6-6 6V13Z" fill="#C52E4F" />
        <path d="M12 60c8-15 18-23 30-23 7 0 13 2 18 7" stroke="#7A542B" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 58c2-12 8-18 18-18 7 0 13 3 17 8" stroke="#7A542B" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 38c-4 9-9 16-17 22" stroke="#7A542B" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 8l2.5 5 5.5 2.5-5.5 2.5-2.5 5-2.5-5-5.5-2.5 5.5-2.5L36 8Z" fill="#B08A45" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-semibold tracking-tight text-[#4A2F1D]">Aksara</span>
        <span className="text-[9px] font-medium tracking-[0.24em] text-[#B08A45]">อักษรา</span>
      </span>
    </span>
  );
}
