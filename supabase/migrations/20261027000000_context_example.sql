-- Exemple de réponse proposé avec chaque question de contexte (déjà appliqué sur le projet).
alter table public.context_answers add column if not exists example text not null default '';
