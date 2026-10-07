type IconProps = { className?: string };

const SVG_BASE: React.SVGProps<SVGSVGElement> = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function PeopleGroupIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <circle cx="12" cy="7" r="3" />
      <circle cx="5" cy="9" r="2" />
      <circle cx="19" cy="9" r="2" />
      <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M2 20c0-1.5 1-3 3-3" />
      <path d="M19 17c2 0 3 1.5 3 3" />
    </svg>
  );
}

function HouseIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M3 10l9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function DumbbellIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M5 8v8" />
      <path d="M8 6v12" />
      <path d="M16 6v12" />
      <path d="M19 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

function TwoPeopleIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 2-5 5-5s5 2 5 5" />
      <path d="M14 20c0-2 1-3.5 3-3.5s4 1.5 4 3.5" />
    </svg>
  );
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M12 7v14" />
      <path d="M3 5h5a4 4 0 0 1 4 2v14a4 4 0 0 0-4-3H3V5z" />
      <path d="M21 5h-5a4 4 0 0 0-4 2v14a4 4 0 0 1 4-3h5V5z" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </svg>
  );
}

const BY_NAME: Record<string, (p: IconProps) => React.ReactElement> = {
  "Sobriety": PeopleGroupIcon,
  "Fatherhood": HouseIcon,
  "Fitness": DumbbellIcon,
  "Entrepreneurship & Career": BriefcaseIcon,
  "Relationships & Marriage": TwoPeopleIcon,
  "Grief & Loss": HeartIcon,
  "Faith": BookIcon,
};

export function RoomIcon({ name, className }: { name: string; className?: string }) {
  const Icon = BY_NAME[name] ?? ChatBubbleIcon;
  return <Icon className={className} />;
}
