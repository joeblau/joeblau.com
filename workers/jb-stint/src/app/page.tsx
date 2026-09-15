export default function Home() {
  return (
    <main>
      <a className="home-link" href="https://joeblau.com">Joe Blau <span aria-hidden="true">↗</span></a>
      <section aria-labelledby="title">
        <p className="eyebrow">Formula 1</p>
        <h1 id="title">Lights out.<br />More to come.</h1>
        <p className="description">A new home for my corner of Formula 1.</p>
        <div className="starting-lights" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
      </section>
      <footer>f1.joeblau.com</footer>
    </main>
  );
}
