export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="wrapper">
        <p className="text-center">
          © {new Date().getFullYear()} Wealth Tracker Inc.
        </p>
      </div>
    </footer>
  );
}
