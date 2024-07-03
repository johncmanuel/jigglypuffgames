export default function Navbar() {
  const links = {
    Home: "/",
    "Whack-A-Puff": "/whack-a-puff",
  };

  const navLinks = Object.entries(links).map(([name, href]) => (
    <li key={name}>
      <a href={href}>{name}</a>
    </li>
  ));

  return (
    <nav>
      <ul>{navLinks}</ul>
    </nav>
  );
}
