import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState, ErrorState, Skeleton } from "@/components/shared/states";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const swatches = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-2", "bg-surface-2"],
  ["primary", "bg-primary"],
  ["amber", "bg-amber"],
  ["success", "bg-success"],
  ["danger", "bg-danger"],
  ["ocean", "bg-ocean"],
];

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Design system Decidia</h1>
        <ThemeToggle />
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-4xl">
          L&apos;IA qui <span className="text-ocean">ose te dire non.</span>
        </h2>
        <p className="text-muted">Titre en Instrument Serif, interface en Geist.</p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Couleurs</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map(([name, cls]) => (
            <div key={name} className="space-y-1">
              <div className={`h-14 rounded-md border border-border ${cls}`} />
              <p className="text-xs text-muted">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Boutons & badges</h3>
        <div className="flex flex-wrap gap-3">
          <Button>Analyser ma décision</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Supprimer</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutre</Badge>
          <Badge tone="ocean">Inversion</Badge>
          <Badge tone="amber">Avocat du diable</Badge>
          <Badge tone="success">Confiance élevée</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Champs</h3>
        <Input placeholder="toi@exemple.com" aria-label="E-mail" />
        <Textarea placeholder="Décris ta décision…" aria-label="Problème" />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">États</h3>
        <Card className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
        <EmptyState
          title="Aucune décision pour l'instant"
          description="Ta première analyse apparaîtra ici."
          action={<Button size="sm">Nouvelle analyse</Button>}
        />
        <ErrorState description="L'analyse a été interrompue. Tes réponses sont conservées." />
      </section>
    </main>
  );
}
