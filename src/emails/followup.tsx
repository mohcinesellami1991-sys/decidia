import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface FollowupEmailProps {
  title: string;
  url: string;
  locale: "fr" | "en";
  kind: "d14" | "d30";
}

const copy = {
  fr: {
    hello: "Salut,",
    body: (t: string) => `Il y a quelques semaines, tu as analysé « ${t} ». Dis-moi ce qui s'est passé : ça prend une minute, et j'ajusterai ton plan.`,
    cta: "Faire le point",
    footer: "Decidia est une aide à la décision, pas un conseil juridique, financier ou médical.",
    d14: "Deux semaines plus tard, où en es-tu ?",
    d30: "Un mois plus tard : ta décision a-t-elle marché ?",
  },
  en: {
    hello: "Hi,",
    body: (t: string) => `A few weeks ago you analysed “${t}”. Tell me what happened: it takes a minute and I'll adjust your plan.`,
    cta: "Check in",
    footer: "Decidia is a decision aid, not legal, financial or medical advice.",
    d14: "Two weeks later, where do you stand?",
    d30: "One month later: did your decision work?",
  },
};

export const followupSubject = (locale: "fr" | "en", kind: "d14" | "d30") => copy[locale][kind];

export default function FollowupEmail({ title, url, locale, kind }: FollowupEmailProps) {
  const c = copy[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{c[kind]}</Preview>
      <Body style={{ backgroundColor: "#0b0d12", fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 520, margin: "0 auto", backgroundColor: "#12151c", border: "1px solid #262b38", borderRadius: 16, padding: 32 }}>
          <Text style={{ color: "#5b8aff", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Decidia</Text>
          <Heading as="h1" style={{ color: "#eef1f7", fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 30, lineHeight: 1.15, margin: "12px 0 20px" }}>
            {c[kind]}
          </Heading>
          <Text style={{ color: "#a9b1c3", fontSize: 16, lineHeight: 1.6 }}>{c.hello}</Text>
          <Text style={{ color: "#a9b1c3", fontSize: 16, lineHeight: 1.6 }}>{c.body(title)}</Text>
          <Section style={{ margin: "28px 0" }}>
            <Button href={url} style={{ backgroundColor: "#2f6bff", color: "#ffffff", padding: "13px 22px", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              {c.cta}
            </Button>
          </Section>
          <Text style={{ color: "#7d869a", fontSize: 12, lineHeight: 1.5 }}>{c.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
