import { Link } from "@remix-run/react";

export default function LawnIndexPage() {
  return (
    <p className="prose prose-a:text-blue-600 hover:prose-a:text-blue-500">
      No lawn selected. Select a lawn on the left, or{" "}
      <Link to="new">create a new lawn.</Link>
    </p>
  );
}
