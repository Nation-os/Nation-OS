import Link from "next/link";
export default function NotFound() {
  return (
    <div style={{ maxWidth: 640, margin: "15vh auto", padding: 24 }}>
      <p className="eyebrow">NATIONOS</p>
      <h1>Page not found</h1>
      <p>Choose a page from the country workspace.</p>
      <Link href="/" className="btn primary">
        Open country profile
      </Link>
    </div>
  );
}
