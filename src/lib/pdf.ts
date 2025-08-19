import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { BalanceRow } from "../data/implementations/SupabaseReportsRepository";

export async function balancesToPdf(rows: BalanceRow[], opts: { title: string; orgName?: string }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  const lineH = 16;
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const write = (text: string, x: number, f = font, size = 10) => {
    page.drawText(text, { x, y, size, font: f, color: rgb(0, 0, 0) });
  };

  write(opts.title, margin, fontBold, 14);
  y -= 20;
  if (opts.orgName) {
    write(opts.orgName, margin, font, 10);
    y -= 12;
  }
  write(new Date().toLocaleString(), margin, font, 9);
  y -= 18;

  const headers = ["Warehouse", "SKU", "Product", "Unit", "Qty"];
  const widths = [150, 80, 220, 50, 50];
  const xStarts = [
    margin,
    margin + widths[0],
    margin + widths[0] + widths[1],
    margin + widths[0] + widths[1] + widths[2],
    margin + widths[0] + widths[1] + widths[2] + widths[3],
  ];

  const drawHeader = () => {
    headers.forEach((h, i) => write(h, xStarts[i], fontBold, 10));
    y -= lineH;
  };

  const ensureSpace = () => {
    if (y < margin + 40) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      write(opts.title, margin, fontBold, 14);
      y -= 20;
      drawHeader();
    }
  };

  drawHeader();

  rows.forEach((r) => {
    ensureSpace();
    write(r.warehouseName, xStarts[0]);
    write(r.sku, xStarts[1]);
    write(
      r.productName.length > 40 ? r.productName.slice(0, 37) + "..." : r.productName,
      xStarts[2]
    );
    write(r.unit, xStarts[3]);
    write(String(r.qtyOnHand), xStarts[4]);
    y -= lineH;
  });

  const pdfBytes = await doc.save();
  return pdfBytes;
}
