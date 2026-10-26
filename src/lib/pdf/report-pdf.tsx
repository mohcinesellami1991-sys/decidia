import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report } from "@/lib/ai/schemas";

const C = { ink: "#0b0d12", ink2: "#3b4356", ink3: "#6b7488", line: "#dbe0ea", blue: "#1f55e0", amber: "#8a5a00", amberBg: "#fff4de", amberLine: "#f0c97a" };

const s = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", fontSize: 10.5, color: C.ink, lineHeight: 1.5 },
  brand: { fontFamily: "Times-Italic", fontSize: 16, color: C.blue },
  eyebrow: { fontSize: 8, letterSpacing: 1.4, textTransform: "uppercase", color: C.ink3, marginBottom: 4 },
  h1: { fontFamily: "Times-Roman", fontSize: 26, lineHeight: 1.15, marginTop: 10, marginBottom: 10 },
  h2: { fontFamily: "Times-Roman", fontSize: 17, marginBottom: 6 },
  section: { marginTop: 18 },
  p: { color: C.ink2 },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 10, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bar: { height: 4, backgroundColor: "#eef1f7", borderRadius: 2, marginTop: 6 },
  barFill: { height: 4, backgroundColor: C.blue, borderRadius: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 10 },
  devil: { backgroundColor: C.amberBg, borderWidth: 1, borderColor: C.amberLine, borderRadius: 8, padding: 12 },
  th: { fontSize: 8, color: C.ink3, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 5 },
  foot: { position: "absolute", bottom: 24, left: 44, right: 44, fontSize: 8, color: C.ink3 },
  bullet: { color: C.ink2, marginBottom: 2 },
});

const L = {
  fr: {
    report: "Rapport", confidence: "confiance", models: "Modèles appliqués", options: "Les options", pros: "Pour", cons: "Contre",
    errc: "Grille Océan Bleu", e: "Éliminer", r: "Réduire", a: "Augmenter", c: "Créer", devil: "Avocat du diable",
    objection: "Objection la plus forte", blind: "Angles morts", change: "Ce qui changerait mon avis", reco: "Recommandation",
    plan: "Plan d'action", metric: "Mesure", risks: "Risques", risk: "Risque", prob: "Probabilité", impact: "Impact", mit: "Parade",
    lv: { low: "Faible", medium: "Moyenne", high: "Élevée" } as Record<string, string>,
    im: { low: "Faible", medium: "Moyen", high: "Fort" } as Record<string, string>,
    disc: "Decidia est une aide à la décision, pas un conseil juridique, financier ou médical.",
  },
  en: {
    report: "Report", confidence: "confidence", models: "Mental models applied", options: "Options", pros: "Pros", cons: "Cons",
    errc: "Blue Ocean grid", e: "Eliminate", r: "Reduce", a: "Raise", c: "Create", devil: "Devil's advocate",
    objection: "Strongest objection", blind: "Blind spots", change: "What would change my mind", reco: "Recommendation",
    plan: "Action plan", metric: "Metric", risks: "Risks", risk: "Risk", prob: "Probability", impact: "Impact", mit: "Mitigation",
    lv: { low: "Low", medium: "Medium", high: "High" } as Record<string, string>,
    im: { low: "Low", medium: "Medium", high: "High" } as Record<string, string>,
    disc: "Decidia is a decision aid, not legal, financial or medical advice.",
  },
};

const List = ({ items }: { items: string[] }) => (
  <View>{items.map((t, i) => <Text key={i} style={s.bullet}>• {t}</Text>)}</View>
);

export function ReportPdf({ title, date, report, locale = "fr" }: { title: string; date: string; report: Report; locale?: "fr" | "en" }) {
  const t = L[locale];
  const hasErrc = Object.values(report.errc).some((a) => a.length);
  return (
    <Document title={`Decidia — ${title}`} author="Decidia">
      <Page size="A4" style={s.page} wrap>
        <Text style={s.brand}>Decidia</Text>
        <Text style={[s.eyebrow, { marginTop: 14 }]}>{t.report} · {date}</Text>
        <Text style={s.h1}>{title}</Text>
        <View style={[s.card, { borderColor: C.blue }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 16, lineHeight: 1.25 }}>{report.summary}</Text>
              <Text style={[s.p, { marginTop: 6 }]}>{report.diagnosis}</Text>
            </View>
            <View style={{ width: 84, alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 30, color: C.blue, lineHeight: 1 }}>{report.recommendation.confidence}</Text>
              <Text style={{ fontSize: 7.5, color: C.ink3, textTransform: "uppercase", letterSpacing: 0.6 }}>/100 {t.confidence}</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.h2} minPresenceAhead={70}>{t.models}</Text>
          {report.models_used.map((m, i) => (
            <Text key={i} style={s.bullet}><Text style={{ fontFamily: "Helvetica-Bold", color: C.ink }}>{m.name}. </Text>{m.insight}</Text>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.h2} minPresenceAhead={70}>{t.options}</Text>
          {report.options.map((o, i) => (
            <View key={i} style={s.card} wrap={false}>
              <View style={s.row}>
                <Text style={{ fontFamily: "Helvetica-Bold", flex: 1 }}>{o.title}</Text>
                <Text>{o.confidence}/100</Text>
              </View>
              <View style={s.bar}><View style={[s.barFill, { width: `${o.confidence}%` }]} /></View>
              <View style={[s.row, { marginTop: 8, gap: 12 }]}>
                <View style={{ flex: 1 }}><Text style={s.eyebrow}>{t.pros}</Text><List items={o.pros} /></View>
                <View style={{ flex: 1 }}><Text style={s.eyebrow}>{t.cons}</Text><List items={o.cons} /></View>
              </View>
            </View>
          ))}
        </View>

        {hasErrc && (
          <View style={s.section} wrap={false}>
            <Text style={s.h2}>{t.errc}</Text>
            {([[["e", "eliminate"], ["r", "reduce"]], [["a", "raise"], ["c", "create"]]] as const).map((row, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 8 }}>
                {row.map(([k, key], j) => (
                  <View key={k} style={[s.cell, { flex: 1, marginLeft: j === 0 ? 0 : 8 }]}><Text style={s.eyebrow}>{t[k]}</Text><List items={report.errc[key]} /></View>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={[s.section, s.devil]} wrap={false}>
          <Text style={[s.eyebrow, { color: C.amber }]}>{t.devil}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{t.objection}</Text>
          <Text style={s.p}>{report.devils_advocate.strongest_objection}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 3 }}>{t.blind}</Text>
          <List items={report.devils_advocate.blind_spots} />
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 3 }}>{t.change}</Text>
          <Text style={s.p}>{report.devils_advocate.verdict_change}</Text>
        </View>

        <View style={[s.section, s.card, { borderColor: C.blue }]} wrap={false}>
          <Text style={s.eyebrow}>{t.reco}</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 16, marginBottom: 4 }}>{report.recommendation.choice}</Text>
          <Text style={s.p}>{report.recommendation.why}</Text>
        </View>

        <View style={s.section}>
          {report.action_plan.map((a, i) => (
            <View key={i} wrap={false}>
              {i === 0 && <Text style={s.h2}>{t.plan}</Text>}
              <View style={s.card}>
                <View style={s.row}><Text style={{ flex: 1 }}>[  ] {a.step}</Text><Text style={{ color: C.ink3 }}>{a.deadline}</Text></View>
                <Text style={{ color: C.ink3, fontSize: 9, marginTop: 2 }}>{t.metric} : {a.success_metric}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section}>
          {report.risks.map((r, i) => (
            <View key={i} wrap={false}>
              {i === 0 && (
                <>
                  <Text style={s.h2}>{t.risks}</Text>
                  <View style={s.tr}>
                    {[t.risk, t.prob, t.impact, t.mit].map((h, k) => <Text key={k} style={[s.th, { flex: k === 0 || k === 3 ? 2 : 1 }]}>{h}</Text>)}
                  </View>
                </>
              )}
              <View style={s.tr}>
                <Text style={{ flex: 2 }}>{r.risk}</Text>
                <Text style={{ flex: 1 }}>{t.lv[r.probability]}</Text>
                <Text style={{ flex: 1 }}>{t.im[r.impact]}</Text>
                <Text style={{ flex: 2, color: C.ink2 }}>{r.mitigation}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.foot} fixed render={({ pageNumber, totalPages }) => `${t.disc}   ·   ${pageNumber}/${totalPages}`} />
      </Page>
    </Document>
  );
}
