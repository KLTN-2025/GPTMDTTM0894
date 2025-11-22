export default function ProductTitle({name, title}) {
  return (
    <header className="hero container">
      <h1>{name}</h1>
      <p className="subtitle">
        {title}
      </p>
    </header>
  );
}
