export default function Docs() {
  // Full-screen iframe to the docs site
  return (
    <iframe
      src="https://docs.eto.markets/docs"
      title="ETO Documentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999,
      }}
    />
  );
}
