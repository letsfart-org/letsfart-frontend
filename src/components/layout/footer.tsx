export default function Footer() {
  return (
    <footer className="flex items-center justify-center p-2">
      <div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} letsfart.org
        </p>
      </div>
    </footer>
  );
}
