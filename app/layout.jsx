import "./styles/style.css";
import "./styles/sectors.css";
import "./styles/planning.css";
import "./styles/editorial.css";
import "./styles/analyst.css";

export const metadata = {
  title: { default: "NationOS · Aderin planning workspace", template: "%s · NationOS" },
  description:
    "A synthetic-country workspace for evidence, state comparisons and long-term public planning.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
