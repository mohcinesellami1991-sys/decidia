import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="space-y-6">
        <h1 className="font-serif text-5xl sm:text-6xl">
          L&apos;IA qui <span className="text-ocean">ose te dire non.</span>
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          Decidia analyse tes décisions avec les modèles mentaux des meilleurs stratèges et te dit
          la vérité, même quand elle dérange.
        </p>
        <Button asChild size="lg">
          <Link href="/design">Voir le design system</Link>
        </Button>
      </div>
    </main>
  );
}
