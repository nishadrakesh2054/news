export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 text-center text-sm text-muted-foreground">
      <div className="container px-4">
        <p>&copy; {new Date().getFullYear()} Daily News Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
