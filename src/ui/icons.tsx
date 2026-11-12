import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

type P = SVGProps<SVGSVGElement>;
export const ArrowRight = (p: P) => (<svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ArrowLeft = (p: P) => (<svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>);
export const Close = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Expand = (p: P) => (<svg {...base(p)}><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" /></svg>);
export const ZoomIn = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3M11 8.5v5M8.5 11h5" /></svg>);
export const ZoomOut = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3M8.5 11h5" /></svg>);
export const Pin = (p: P) => (<svg {...base(p)}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const Mail = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6.500L20.5 7" /></svg>);
export const Phone = (p: P) => (<svg {...base(p)}><path d="M5 4h4l2 5-2.5 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>);
export const LinkedIn = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.500v6M8 7.500v.010M12 16.500v-3.500a2.2 2.2 0 0 1 4.4 0v3.500M12 10.500v6" /></svg>);
export const GitHub = (p: P) => (<svg {...base(p)}><path d="M9 19c-4 1.2-4-2-6-2.500M15 21.500v-3.300a2.9 2.9 0 0 0-.800-2.200c2.7-.300 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.100-3.200s-1-.300-3.4 1.300a11.6 11.6 0 0 0-6 0C6.5 3.3 5.5 3.6 5.5 3.600a4.3 4.3 0 0 0-.100 3.200A4.6 4.6 0 0 0 4.1 10c0 4.7 2.8 5.7 5.5 6a2.9 2.9 0 0 0-.800 2.200v3.3" /></svg>);
export const Copy = (p: P) => (<svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>);
export const Check = (p: P) => (<svg {...base(p)}><path d="M5 12.500l4.5 4.500L19 7.5" /></svg>);
export const Replay = (p: P) => (<svg {...base(p)}><path d="M4 12a8 8 0 1 0 2.6-5.900M4 4v4.500h4.5" /></svg>);
export const External = (p: P) => (<svg {...base(p)}><path d="M14 5h5v5M19 5l-8 8M11 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5" /></svg>);
export const Globe = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>);
