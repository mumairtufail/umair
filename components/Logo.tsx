import { LOGO_SVG, LOGO_VIEWBOX } from "@/components/logo-svg";

// "umair" in metro-line lettering: the u starts from a commit, the i-dot is HEAD, the r's arm is a branch. Drawn by scripts/logo (npm run logo);
// colours come from the .brand-logo rules in globals.css so it follows the theme.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`brand-logo ${className}`}
      viewBox={LOGO_VIEWBOX}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LOGO_SVG }}
    />
  );
}
