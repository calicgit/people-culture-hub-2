import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Loader2,
  MessageSquareText,
  Plus,
  SendHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { blobToDataUrl, downloadStorageFile, fetchStorageBlob } from "@/lib/storage-download";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Enums } from "@/integrations/supabase/types";
import DocumentPreviewContent from "@/components/portal/DocumentPreviewContent";

export const SECTIONS = [
  { id: "talent-acquisition", label: "Talent Acquisition, Employer Branding" },
  { id: "talent-management", label: "Talent Management & Succession, L&D" },
  { id: "people-analytics", label: "People Analytics, Workforce Planning, New Technology" },
  { id: "performance-reward", label: "Performance Management, Reward Management" },
  { id: "people-operations", label: "People Operations, Employee and Labour Relations" },
  { id: "culture-dei", label: "Org. Culture, DEI, Wellbeing" },
  { id: "internal-comms", label: "Interne komunikacije i angažiranost" },
  { id: "lobbying", label: "Lobiranje, suradnja s ministarstvima, sponzorstva" },
  { id: "business", label: "Business sekcija" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

type SectionDocument = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string;
  section: string | null;
  created_at: string;
};

type SectionComment = {
  id: string;
  document_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export interface SectionsTabProps {
  userId: string;
  profileNameByUserId: Map<string, string>;
  onDataRefresh: () => Promise<void>;
  activeSection?: string;
}

const formatFileSize = (size: number | null) => {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const SectionsTab = ({ userId, profileNameByUserId, onDataRefresh, activeSection }: SectionsTabProps) => {
  const { toast } = useToast();
  const [expandedSection, setExpandedSection] = useState<string | null>(activeSection ?? null);
  const [sectionDocuments, setSectionDocuments] = useState<SectionDocument[]>([]);
  const [sectionComments, setSectionComments] = useState<SectionComment[]>([]);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // Upload state per section
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Comment drafts
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const getDisplayName = (uid: string) => {
    if (uid === userId) return "Ti";
    return profileNameByUserId.get(uid) ?? "Član portala";
  };

  const loadSectionDocuments = async (sectionId: string) => {
    setLoadingSection(sectionId);
    try {
      const { data: docs, error: docsError } = await supabase
        .from("documents" as never)
        .select("*")
        .eq("section", sectionId)
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;

      const typedDocs = (docs ?? []) as unknown as SectionDocument[];
      setSectionDocuments(typedDocs);

      if (typedDocs.length > 0) {
        const docIds = typedDocs.map((d) => d.id);
        const { data: comments, error: commentsError } = await supabase
          .from("document_comments" as never)
          .select("*")
          .in("document_id", docIds)
          .order("created_at", { ascending: true });

        if (!commentsError) {
          setSectionComments((comments ?? []) as unknown as SectionComment[]);
        }
      } else {
        setSectionComments([]);
      }
    } catch (error) {
      toast({
        title: "Greška pri učitavanju dokumenata sekcije",
        description: error instanceof Error ? error.message : "Pokušaj ponovno.",
        variant: "destructive",
      });
    } finally {
      setLoadingSection(null);
    }
  };

  useEffect(() => {
    if (activeSection) {
      setExpandedSection(activeSection);
      void loadSectionDocuments(activeSection);
    }
  }, [activeSection]);

  const handleToggleSection = async (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
      return;
    }
    setExpandedSection(sectionId);
    await loadSectionDocuments(sectionId);
  };

  const handleUpload = async (sectionId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile) {
      toast({ title: "Odaberi datoteku", variant: "destructive" });
      return;
    }

    setUploading(true);
    const safeName = uploadFile.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = `${userId}/sections/${sectionId}/${Date.now()}-${safeName}`;

    try {
      const uploadResult = await supabase.storage.from("dms-documents").upload(filePath, uploadFile, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadResult.error) throw uploadResult.error;

      const insertResult = await supabase
        .from("documents" as never)
        .insert({
          title: uploadTitle.trim(),
          description: uploadDescription.trim() || null,
          file_path: filePath,
          file_name: uploadFile.name,
          file_size_bytes: uploadFile.size,
          mime_type: uploadFile.type || null,
          uploaded_by: userId,
          visibility_body: null,
          section: sectionId,
        } as never)
        .select("id")
        .single();

      if (insertResult.error) {
        await supabase.storage.from("dms-documents").remove([filePath]);
        throw insertResult.error;
      }

      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      e.currentTarget.reset();
      await loadSectionDocuments(sectionId);
      toast({ title: "Dokument je spremljen u sekciju" });
    } catch (error) {
      toast({
        title: "Upload nije uspio",
        description: error instanceof Error ? error.message : "Pokušaj ponovno.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await downloadStorageFile("dms-documents", filePath, fileName);
    } catch {
      toast({ title: "Preuzimanje nije uspjelo", variant: "destructive" });
    }
  };

  const handlePreview = async (filePath: string, fileName: string) => {
    setPreviewTitle(fileName);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const blob = await fetchStorageBlob("dms-documents", filePath);
      setPreviewUrl(await blobToDataUrl(blob));
    } catch (error) {
      setPreviewOpen(false);
      toast({ title: "Pregled nije uspio", description: error instanceof Error ? error.message : "Pokušaj ponovno.", variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  const handleDelete = async (docId: string, filePath: string, sectionId: string) => {
    const { error } = await supabase.from("documents" as never).delete().eq("id", docId);
    if (error) {
      toast({ title: "Brisanje nije uspjelo", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.storage.from("dms-documents").remove([filePath]);
    await loadSectionDocuments(sectionId);
    toast({ title: "Dokument je obrisan" });
  };

  const handleSubmitComment = async (documentId: string, sectionId: string) => {
    const body = commentDrafts[documentId]?.trim();
    if (!body) return;

    setSubmittingCommentFor(documentId);
    try {
      const { error } = await supabase.from("document_comments" as never).insert({
        document_id: documentId,
        author_id: userId,
        body,
      } as never);
      if (error) throw error;

      setCommentDrafts((prev) => ({ ...prev, [documentId]: "" }));
      await loadSectionDocuments(sectionId);
    } catch (error) {
      toast({
        title: "Komentar nije spremljen",
        description: error instanceof Error ? error.message : "Pokušaj ponovno.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCommentFor(null);
    }
  };

  const commentsByDocId = useMemo(() => {
    const map = new Map<string, SectionComment[]>();
    sectionComments.forEach((c) => {
      const arr = map.get(c.document_id) ?? [];
      map.set(c.document_id, [...arr, c]);
    });
    return map;
  }, [sectionComments]);

  return (
    <>
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Sekcije
          </CardTitle>
          <CardDescription>
            Svaka sekcija ima vlastite dokumente za kolaboraciju i dijeljenje datoteka.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECTIONS.map((section) => {
            const isOpen = expandedSection === section.id;
            const isLoading = loadingSection === section.id;
            const docs = isOpen ? sectionDocuments : [];

            return (
              <Collapsible key={section.id} open={isOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    onClick={() => handleToggleSection(section.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">{section.label}</span>
                    {isLoading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" />}
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-4 rounded-lg border border-border bg-card p-4">
                  {/* Upload form */}
                  <form
                    onSubmit={(e) => handleUpload(section.id, e)}
                    className="space-y-3 rounded-lg border border-dashed border-border bg-muted/20 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dodaj dokument
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`title-${section.id}`}>Naziv</Label>
                        <Input
                          id={`title-${section.id}`}
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder="Naziv dokumenta"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`file-${section.id}`}>Datoteka</Label>
                        <Input
                          id={`file-${section.id}`}
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`desc-${section.id}`}>Opis (opcionalno)</Label>
                      <Textarea
                        id={`desc-${section.id}`}
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        rows={2}
                        placeholder="Kratki opis dokumenta..."
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={uploading}>
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </form>

                  {/* Documents list */}
                  {docs.length === 0 && !isLoading && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nema dokumenata u ovoj sekciji.
                    </p>
                  )}

                  {docs.map((doc) => {
                    const comments = commentsByDocId.get(doc.id) ?? [];
                    return (
                      <div key={doc.id} className="rounded-lg border border-border bg-background p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-primary" />
                              <span className="font-medium text-sm truncate">{doc.title}</span>
                            </div>
                            {doc.description && (
                              <p className="mt-1 text-xs text-muted-foreground">{doc.description}</p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>{doc.file_name}</span>
                              <span>·</span>
                              <span>{formatFileSize(doc.file_size_bytes)}</span>
                              <span>·</span>
                              <span>{getDisplayName(doc.uploaded_by)}</span>
                              <span>·</span>
                              <span>{format(new Date(doc.created_at), "dd.MM.yyyy HH:mm")}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Pregledaj"
                              onClick={() => handlePreview(doc.file_path, doc.file_name)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Preuzmi"
                              onClick={() => handleDownload(doc.file_path, doc.file_name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(doc.id, doc.file_path, section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2 border-t border-border pt-3">
                          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <MessageSquareText className="h-3.5 w-3.5" />
                            Komentari ({comments.length})
                          </p>

                          {comments.map((comment) => (
                            <div key={comment.id} className="rounded-md bg-muted/50 px-3 py-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {getDisplayName(comment.author_id)}
                                </span>
                                <span>·</span>
                                <span>{format(new Date(comment.created_at), "dd.MM.yyyy HH:mm")}</span>
                              </div>
                              <p className="mt-1 text-sm">{comment.body}</p>
                            </div>
                          ))}

                          <div className="flex gap-2">
                            <Input
                              placeholder="Napiši komentar..."
                              className="h-8 text-sm"
                              value={commentDrafts[doc.id] ?? ""}
                              onChange={(e) =>
                                setCommentDrafts((prev) => ({ ...prev, [doc.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  void handleSubmitComment(doc.id, section.id);
                                }
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              disabled={
                                !commentDrafts[doc.id]?.trim() || submittingCommentFor === doc.id
                              }
                              onClick={() => handleSubmitComment(doc.id, section.id)}
                            >
                              {submittingCommentFor === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SendHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>
    </div>

    {/* Inline document preview dialog */}
    <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) closePreview(); }}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 [&>button]:hidden">
        <DialogDescription className="sr-only">
          Ugrađeni pregled dokumenta unutar portala.
        </DialogDescription>
        <DialogHeader className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium truncate pr-4">
              {previewTitle}
            </DialogTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={closePreview}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30">
          {previewLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Učitavam dokument...
            </div>
          )}
          {!previewLoading && previewUrl && <DocumentPreviewContent source={previewUrl} fileName={previewTitle} />}
          {!previewLoading && !previewUrl && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Dokument nije dostupan.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SectionsTab;
