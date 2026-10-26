import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-2">404</p>
        <h1 className="mt-3 font-serif text-6xl">Cette page n&apos;existe pas.</h1>
        <p className="mt-3 text-muted">Le lien est peut-être périmé. Reprends depuis l&apos;accueil.</p>
        <Button asChild className="mt-7"><Link href="/">Retour à l&apos;accueil</Link></Button>
      </div>
    </main>
  );
}
