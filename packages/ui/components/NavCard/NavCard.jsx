import { Link } from "react-router-dom";

export default function NavCard({ title, description, to }) {
  return (
    <Link className="nav-card" to={to}>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}
