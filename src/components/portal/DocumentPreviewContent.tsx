import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

GlobalWorkerOptions.workerSrc = pdfWorker;

interface DocumentPreviewContentProps {
  source: string | null;
  fileName: string;
}

const detectPreviewKind = (source: string | null, fileName: string) => {
  if (!source) return "unsupported";
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (source.startsWith("data:application/pdf") || ext === "pdf") return "pdf";
  if (source.startsWith("data:image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["doc", "docx"].includes(ext)) return "docx";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xlsx";
  if (["ppt", "pptx"].includes(ext)) return "pptx";
  return "unsupported";
};

const dataUrlToArrayBuffer = async (dataUrl: string): Promise<ArrayBuffer> => {
  const res = await fetch(dataUrl);
  return res.arrayBuffer();
};

const PdfPreview = ({ source, fileName }: { source: string; fileName: string }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const renderPdf = async () => {
      setLoading(true);
      setError(null);
      setPages([]);

      try {
        const pdf = await getDocument(source).promise;
        const renderedPages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Canvas nije dostupan za pregled PDF-a.");
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvas, canvasContext: context, viewport }).promise;
          renderedPages.push(canvas.toDataURL("image/png"));
        }

        if (!active) return;
        setPages(renderedPages);
      } catch (previewError) {
        if (!active) return;
        setError(previewError instanceof Error ? previewError.message : "PDF nije moguće prikazati.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void renderPdf();

    return () => {
      active = false;
    };
  }, [source]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Pripremam PDF pregled...
      </div>
    );
  }

  if (error) {
    return <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">{error}</div>;
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {pages.map((page, index) => (
          <div key={`${fileName}-page-${index + 1}`} className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            <img
              src={page}
              alt={`Stranica ${index + 1} dokumenta ${fileName}`}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ImagePreview = ({ source, fileName }: { source: string; fileName: string }) => (
  <div className="flex h-full items-center justify-center overflow-auto p-4 sm:p-6">
    <img src={source} alt={fileName} className="max-h-full max-w-full rounded-lg border border-border bg-background shadow-sm" loading="lazy" />
  </div>
);

const DocxPreview = ({ source, fileName }: { source: string; fileName: string }) => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const render = async () => {
      setLoading(true);
      setError(null);
      try {
        const buffer = await dataUrlToArrayBuffer(source);
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (active) setHtml(result.value);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Word dokument nije moguće prikazati.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void render();
    return () => { active = false; };
  }, [source]);

  if (loading) return <PreviewLoader text="Pripremam Word pregled..." />;
  if (error) return <PreviewError message={error} />;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="prose prose-sm sm:prose mx-auto max-w-4xl rounded-lg border border-border bg-background p-6 shadow-sm dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

const XlsxPreview = ({ source, fileName }: { source: string; fileName: string }) => {
  const [sheets, setSheets] = useState<{ name: string; html: string }[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const render = async () => {
      setLoading(true);
      setError(null);
      try {
        const buffer = await dataUrlToArrayBuffer(source);
        const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const result = wb.SheetNames.map((name) => ({
          name,
          html: XLSX.utils.sheet_to_html(wb.Sheets[name]),
        }));
        if (active) { setSheets(result); setActiveSheet(0); }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Excel dokument nije moguće prikazati.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void render();
    return () => { active = false; };
  }, [source]);

  if (loading) return <PreviewLoader text="Pripremam Excel pregled..." />;
  if (error) return <PreviewError message={error} />;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {sheets.length > 1 && (
        <div className="mx-auto mb-3 flex max-w-4xl gap-1 overflow-x-auto">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveSheet(i)}
              className={`whitespace-nowrap rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${
                i === activeSheet
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="mx-auto max-w-4xl overflow-x-auto rounded-lg border border-border bg-background shadow-sm">
        <div
          className="xlsx-preview-table p-2 text-sm [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium"
          dangerouslySetInnerHTML={{ __html: sheets[activeSheet]?.html ?? "" }}
        />
      </div>
    </div>
  );
};

const PreviewLoader = ({ text }: { text: string }) => (
  <div className="flex h-full items-center justify-center text-muted-foreground">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
    {text}
  </div>
);

const PreviewError = ({ message }: { message: string }) => (
  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">{message}</div>
);

const UnsupportedPreview = () => (
  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
    Inline pregled nije dostupan za ovaj format. Koristi preuzimanje.
  </div>
);

const DocumentPreviewContent = ({ source, fileName }: DocumentPreviewContentProps) => {
  const previewKind = useMemo(() => detectPreviewKind(source, fileName), [source, fileName]);

  if (!source) return <UnsupportedPreview />;
  if (previewKind === "pdf") return <PdfPreview source={source} fileName={fileName} />;
  if (previewKind === "image") return <ImagePreview source={source} fileName={fileName} />;
  if (previewKind === "docx") return <DocxPreview source={source} fileName={fileName} />;
  if (previewKind === "xlsx") return <XlsxPreview source={source} fileName={fileName} />;
  return <UnsupportedPreview />;
};

export default DocumentPreviewContent;