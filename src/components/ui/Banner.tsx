import type { ReactNode } from "react";

/** A trail of dots winding across the banner. */
const Trail = () => (
  <svg
    aria-hidden
    viewBox="0 0 400 120"
    className="pointer-events-none absolute inset-0 size-full text-white/30"
    preserveAspectRatio="none"
  >
    <path
      d="M-10 100 C 60 20, 120 120, 190 60 S 320 -10, 410 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="0.1 9"
    />
    <circle cx="352" cy="30" r="46" fill="currentColor" opacity="0.18" />
    <circle cx="30" cy="12" r="26" fill="currentColor" opacity="0.14" />
  </svg>
);

type Props = {
  title: ReactNode;
  description: ReactNode;
  /** Placed over the banner, such as a close button. */
  children?: ReactNode;
};

/** The logo and name on the brand gradient, as the top of the dialog and the popup. */
const Banner = ({ title, description, children }: Props) => (
  <div className="relative flex items-center gap-4 overflow-hidden bg-linear-to-br from-brand via-[#7d4df0] to-[#a58bff] px-6 py-7">
    <Trail />

    <img
      src="/icon-128.png"
      alt=""
      className="relative size-16 shrink-0 rounded-2xl bg-white p-2 shadow-lg ring-4 ring-white/25"
    />
    <div className="relative flex flex-col gap-0.5 text-white">
      <div className="text-xl font-semibold tracking-tight">{title}</div>
      <div className="text-white/80">{description}</div>
    </div>

    {children}
  </div>
);

export default Banner;
