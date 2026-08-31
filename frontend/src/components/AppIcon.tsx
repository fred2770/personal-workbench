import type { ReactNode } from "react";
import type { IconName } from "../types/icon";

interface AppIconProps {
  name: IconName;
  size?: number;
}

const iconPaths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 5.5h16v13H4z" />
      <path d="M4 14h4l1.5 2h5l1.5-2h4" />
    </>
  ),
  projects: (
    <>
      <path d="M3.5 6.5h6l2-2h9v15h-17z" />
      <path d="M3.5 9.5h17" />
    </>
  ),
  work: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 2.5 2.5L16.5 9" />
    </>
  ),
  memo: (
    <>
      <path d="M5 3.5h10l4 4v13H5z" />
      <path d="M14.5 3.5v4h4M8 12h8M8 16h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.45 5.45l1.4 1.4M17.15 17.15l1.4 1.4M18.55 5.45l-1.4 1.4M6.85 17.15l-1.4 1.4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </>
  ),
  command: <path d="M9 6.5H7a3 3 0 1 0 0 6h10a3 3 0 1 0 0-6h-2M9 17.5H7a3 3 0 0 1 0-6h10a3 3 0 0 1 0 6h-2M9 4v16M15 4v16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  paperclip: <path d="m9.5 12.5 5.7-5.7a3 3 0 0 1 4.3 4.2l-7.8 7.8a5 5 0 0 1-7.1-7.1l7.2-7.2" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
    </>
  ),
  alert: (
    <>
      <path d="m12 3 9 17H3z" />
      <path d="M12 9v4M12 16.5v.25" />
    </>
  ),
  activity: <path d="M3 12h4l2.2-6 4 12 2.2-6H21" />,
  folder: (
    <>
      <path d="M3.5 6.5h6l2-2h9v15h-17z" />
      <path d="M7.5 13h9" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export function AppIcon({ name, size = 18 }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="app-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        {iconPaths[name]}
      </g>
    </svg>
  );
}
