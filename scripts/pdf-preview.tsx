import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { writeFileSync } from "node:fs";
import { ReportPdf } from "../src/lib/pdf/report-pdf";
import { SAMPLE_REPORT, SAMPLE_TITLE, SAMPLE_REPORT_EN, SAMPLE_TITLE_EN } from "../src/lib/sample-report";
(async () => {
  const fr = await renderToBuffer(createElement(ReportPdf, { title: SAMPLE_TITLE, date: "26 octobre 2026", report: SAMPLE_REPORT, locale: "fr" }));
  writeFileSync(process.argv[2] + "/rapport-fr.pdf", fr);
  const en = await renderToBuffer(createElement(ReportPdf, { title: SAMPLE_TITLE_EN, date: "26 October 2026", report: SAMPLE_REPORT_EN, locale: "en" }));
  writeFileSync(process.argv[2] + "/report-en.pdf", en);
  console.log("ok", fr.length, en.length);
})();
