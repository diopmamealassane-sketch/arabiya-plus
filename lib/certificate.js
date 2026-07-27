import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const NAVY = rgb(0x14 / 255, 0x20 / 255, 0x38 / 255);
const GOLD = rgb(0xd1 / 255, 0xaa / 255, 0x41 / 255);
const WHITE = rgb(1, 1, 1);
const MUTED = rgb(0.8, 0.8, 0.85);
const MUTED_DIM = rgb(0.55, 0.55, 0.6);

// Génère le PDF du certificat de fin de cycle — format A4 paysage,
// couleurs de marque (navy/or), aucune police externe requise (donc
// aucun risque de rendu cassé sur Vercel : uniquement les polices
// standard intégrées à pdf-lib).
export async function generateCertificatePdf({ userName, cycleLabel, unitsCount, lessonsCount, dateStr }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 paysage en points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  page.drawRectangle({ x: 0, y: 0, width, height, color: NAVY });

  const margin = 24;
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    borderColor: GOLD,
    borderWidth: 2,
  });
  const margin2 = 32;
  page.drawRectangle({
    x: margin2,
    y: margin2,
    width: width - margin2 * 2,
    height: height - margin2 * 2,
    borderColor: GOLD,
    borderWidth: 0.75,
  });

  function centerText(text, y, font, size, color) {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, font, size, color });
  }

  centerText("ARABIYA+", height - 90, fontBold, 22, GOLD);
  centerText("CERTIFICAT DE RÉUSSITE", height - 160, fontBold, 30, WHITE);
  centerText("Ce certificat est décerné à", height - 210, fontRegular, 14, MUTED);
  centerText(userName, height - 255, fontBold, 34, GOLD);
  centerText("pour avoir achevé avec succès le", height - 300, fontRegular, 14, MUTED);
  centerText(cycleLabel, height - 335, fontBold, 22, WHITE);
  centerText(`${unitsCount} unités — ${lessonsCount} leçons complétées`, height - 365, fontRegular, 13, MUTED);

  centerText(dateStr, 90, fontItalic, 12, rgb(0.7, 0.7, 0.75));
  centerText("Arabiya+ — Apprendre l'arabe autrement", 60, fontRegular, 10, MUTED_DIM);

  return pdfDoc.save();
}
