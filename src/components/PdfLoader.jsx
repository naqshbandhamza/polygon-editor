import { useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

export default function PdfLoader({ pdfUrl, onPagesReady }) {
  useEffect(() => {
    const loadPDF = async () => {
      const pdfJS = await import("pdfjs-dist/build/pdf");
      pdfJS.GlobalWorkerOptions.workerSrc =
        window.location.origin + "/pdf.worker.min.mjs";

      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      const pageCanvases = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        pageCanvases.push({
          index: i,
          canvas,
          dataUrl: canvas.toDataURL(), // for thumbnails
        });
      }

      onPagesReady(pageCanvases);
    };

    if (pdfUrl) loadPDF();
  }, [pdfUrl]);

  return <></>;
}
