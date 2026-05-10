import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  History,
  Loader2,
  LogOut,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Plus,
  SendHorizontal,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { blobToDataUrl, downloadStorageFile, fetchStorageBlob } from "@/lib/storage-download";
import type { Enums, Tables } from "@/integrations/supabase/types";
import SectionsTab, { SECTIONS } from "@/components/portal/SectionsTab";
import AssociationMembersTab from "@/components/portal/AssociationMembersTab";
import SingleSectionDocs from "@/components/portal/SingleSectionDocs";
import VotingTab from "@/components/portal/VotingTab";
import ChatTab from "@/components/portal/ChatTab";
import ProjectsTab from "@/components/portal/ProjectsTab";
import DocumentPreviewContent from "@/components/portal/DocumentPreviewContent";

type DocumentRecord = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string;
  visibility_body: Enums<"association_body"> | null;
  created_at: string;
  updated_at: string;
};

type CalendarEventRecord = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  created_by: string;
  visibility_body: Enums<"association_body"> | null;
  created_at: string;
  updated_at: string;
};

type DocumentVersionRecord = {
  id: string;
  document_id: string;
  version_number: number;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_by: string;
  created_at: string;
};

type DocumentCommentRecord = {
  id: string;
  document_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type DirectoryRole = Tables<"user_roles">;
type DirectoryProfile = Tables<"profiles">;
type DirectoryMembership = Tables<"user_body_memberships">;
type DirectoryRow = DirectoryProfile & {
  bodies: Enums<"association_body">[];
  roles: Enums<"app_role">[];
};

const allMembersValue = "all-members";
const associationBodyValues = ["association_member", "upravno_vijece", "savjetodavno_vijece", "znanstveno_vijece"] as const;

const bodyOptions: { value: Enums<"association_body">; label: string }[] = [
  { value: "association_member", label: "Član Udruge" },
  { value: "upravno_vijece", label: "Upravno vijeće" },
  { value: "savjetodavno_vijece", label: "Savjetodavno vijeće" },
  { value: "znanstveno_vijece", label: "Znanstveno vijeće" },
];

const roleLabels: Record<Enums<"app_role">, string> = {
  master_admin: "Master Admin",
  member: "Member",
};

const formatFileSize = (size: number | null) => {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const editUserSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Ime i prezime moraju imati barem 2 znaka.").max(120, "Ime i prezime mogu imati najviše 120 znakova."),
  email: z.string().trim().email("Unesi valjani email.").max(255, "Email može imati najviše 255 znakova."),
  title: z.string().trim().max(120, "Funkcija može imati najviše 120 znakova."),
  membershipStatus: z.string().trim().min(2, "Status članstva je obavezan.").max(40, "Status članstva može imati najviše 40 znakova."),
  role: z.enum(["master_admin", "member"]),
  bodies: z.array(z.enum(associationBodyValues)),
  isActive: z.boolean(),
});

const PortalDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, memberships, isMasterAdmin, refreshAccessData, signOut } = useAuth();

  const [portalLoading, setPortalLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersionRecord[]>([]);
  const [documentComments, setDocumentComments] = useState<DocumentCommentRecord[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventRecord[]>([]);
  const [directoryProfiles, setDirectoryProfiles] = useState<DirectoryProfile[]>([]);
  const [directoryMemberships, setDirectoryMemberships] = useState<DirectoryMembership[]>([]);
  const [directoryRoles, setDirectoryRoles] = useState<DirectoryRole[]>([]);

  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentVisibility, setDocumentVisibility] = useState<string>(allMembersValue);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
  const [versionNotes, setVersionNotes] = useState<Record<string, string>>({});
  const [versionFiles, setVersionFiles] = useState<Record<string, File | null>>({});
  const [uploadingVersionFor, setUploadingVersionFor] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartsAt, setEventStartsAt] = useState("");
  const [eventEndsAt, setEventEndsAt] = useState("");
  const [eventVisibility, setEventVisibility] = useState<string>(allMembersValue);
  const [savingEvent, setSavingEvent] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminFullName, setAdminFullName] = useState("");
  const [adminTitle, setAdminTitle] = useState("");
  const [adminRole, setAdminRole] = useState<Enums<"app_role">>("member");
  const [adminMembershipStatus, setAdminMembershipStatus] = useState("active");
  const [adminBodies, setAdminBodies] = useState<Enums<"association_body">[]>([]);
  const [adminActive, setAdminActive] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingMember, setEditingMember] = useState<DirectoryRow | null>(null);
  const [editUserForm, setEditUserForm] = useState<z.infer<typeof editUserSchema>>({
    userId: "00000000-0000-0000-0000-000000000000",
    fullName: "",
    email: "",
    title: "",
    membershipStatus: "active",
    role: "member",
    bodies: [],
    isActive: true,
  });
  const [savingUserChanges, setSavingUserChanges] = useState(false);
  const [deletingMember, setDeletingMember] = useState<DirectoryRow | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);

  // Custom sections
  type CustomSection = { id: string; label: string; created_by: string; created_at: string };
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  const loadCustomSections = async () => {
    const { data } = await supabase
      .from("custom_sections" as never)
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setCustomSections(data as unknown as CustomSection[]);
  };

  const handleAddSection = async () => {
    if (!newSectionLabel.trim() || !user) return;
    setSavingSection(true);
    try {
      const { error } = await supabase.from("custom_sections" as never).insert({
        label: newSectionLabel.trim(),
        created_by: user.id,
      } as never);
      if (error) throw error;
      setNewSectionLabel("");
      setShowAddSection(false);
      await loadCustomSections();
      toast({ title: "Sekcija je dodana" });
    } catch (error) {
      toast({ title: "Dodavanje sekcije nije uspjelo", description: error instanceof Error ? error.message : "", variant: "destructive" });
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const { error } = await supabase.from("custom_sections" as never).delete().eq("id", sectionId);
    if (error) {
      toast({ title: "Brisanje sekcije nije uspjelo", variant: "destructive" });
    } else {
      await loadCustomSections();
      toast({ title: "Sekcija je obrisana" });
    }
  };

  const loadPortalData = async () => {
    if (!user) return;

    setPortalLoading(true);

    try {
      const [documentsResult, versionsResult, commentsResult, eventsResult, profilesResult, membershipsResult, rolesResult] = await Promise.all([
        supabase.from("documents" as never).select("*").order("created_at", { ascending: false }),
        supabase.from("document_versions" as never).select("*").order("version_number", { ascending: false }),
        supabase.from("document_comments" as never).select("*").order("created_at", { ascending: true }),
        supabase.from("calendar_events" as never).select("*").order("starts_at", { ascending: true }),
        supabase.from("profiles").select("*").order("full_name", { ascending: true }),
        supabase.from("user_body_memberships").select("*").order("created_at", { ascending: true }),
        isMasterAdmin
          ? supabase.from("user_roles").select("*").order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (documentsResult.error) throw documentsResult.error;
      if (versionsResult.error) throw versionsResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (membershipsResult.error) throw membershipsResult.error;
      if (rolesResult.error) throw rolesResult.error;

      setDocuments((documentsResult.data ?? []) as unknown as DocumentRecord[]);
      setDocumentVersions((versionsResult.data ?? []) as unknown as DocumentVersionRecord[]);
      setDocumentComments((commentsResult.data ?? []) as unknown as DocumentCommentRecord[]);
      setCalendarEvents((eventsResult.data ?? []) as unknown as CalendarEventRecord[]);
      setDirectoryProfiles(profilesResult.data ?? []);
      setDirectoryMemberships(membershipsResult.data ?? []);
      setDirectoryRoles((rolesResult.data ?? []) as DirectoryRole[]);
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Greška pri učitavanju portala", description, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    void loadPortalData();
    void loadCustomSections();
  }, [user?.id, isMasterAdmin]);

  const directoryRows = useMemo(() => {
    const membershipMap = new Map<string, Enums<"association_body">[]>();
    const roleMap = new Map<string, Enums<"app_role">[]>();

    directoryMemberships.forEach((membership) => {
      const current = membershipMap.get(membership.user_id) ?? [];
      membershipMap.set(membership.user_id, [...current, membership.body]);
    });

    directoryRoles.forEach((role) => {
      const current = roleMap.get(role.user_id) ?? [];
      roleMap.set(role.user_id, [...current, role.role]);
    });

    return directoryProfiles.map((item) => ({
      ...item,
      bodies: membershipMap.get(item.user_id) ?? [],
      roles: roleMap.get(item.user_id) ?? [],
    })) as DirectoryRow[];
  }, [directoryMemberships, directoryProfiles, directoryRoles]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return calendarEvents;

    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.starts_at);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [calendarEvents, selectedDate]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return calendarEvents.filter((event) => new Date(event.ends_at) >= now);
  }, [calendarEvents]);

  const memberSummary = useMemo(() => {
    const bodySet = new Set(memberships.map((membership) => membership.body));
    return bodyOptions.filter((option) => bodySet.has(option.value)).map((option) => option.label);
  }, [memberships]);

  const profileNameByUserId = useMemo(
    () => new Map(directoryProfiles.map((item) => [item.user_id, item.full_name])),
    [directoryProfiles],
  );

  const versionsByDocumentId = useMemo(() => {
    const map = new Map<string, DocumentVersionRecord[]>();

    documentVersions.forEach((version) => {
      const current = map.get(version.document_id) ?? [];
      map.set(version.document_id, [...current, version]);
    });

    return map;
  }, [documentVersions]);

  const commentsByDocumentId = useMemo(() => {
    const map = new Map<string, DocumentCommentRecord[]>();

    documentComments.forEach((comment) => {
      const current = map.get(comment.document_id) ?? [];
      map.set(comment.document_id, [...current, comment]);
    });

    return map;
  }, [documentComments]);

  const getDocumentVersions = (document: DocumentRecord) => {
    const persistedVersions = versionsByDocumentId.get(document.id) ?? [];

    if (persistedVersions.some((version) => version.version_number === 1)) {
      return persistedVersions;
    }

    return [
      ...persistedVersions,
      {
        id: `fallback-${document.id}`,
        document_id: document.id,
        version_number: 1,
        title: document.title,
        description: document.description,
        file_path: document.file_path,
        file_name: document.file_name,
        file_size_bytes: document.file_size_bytes,
        mime_type: document.mime_type,
        created_by: document.uploaded_by,
        created_at: document.created_at,
      },
    ].sort((a, b) => b.version_number - a.version_number);
  };

  const getDocumentComments = (documentId: string) => commentsByDocumentId.get(documentId) ?? [];

  const getDisplayName = (userId: string) => {
    if (userId === user?.id) return "Ti";
    return profileNameByUserId.get(userId) ?? "Član portala";
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/council-login", { replace: true });
  };

  const handleDocumentUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !documentFile) {
      toast({ title: "Odaberi dokument", description: "Potrebno je dodati datoteku za upload.", variant: "destructive" });
      return;
    }

    setUploadingDocument(true);

    const safeName = documentFile.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;
    const visibilityBody = documentVisibility === allMembersValue ? null : (documentVisibility as Enums<"association_body">);

    try {
      const uploadResult = await supabase.storage.from("dms-documents").upload(filePath, documentFile, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadResult.error) throw uploadResult.error;

      const insertResult = await supabase
        .from("documents" as never)
        .insert({
          title: documentTitle.trim(),
          description: documentDescription.trim() || null,
          file_path: filePath,
          file_name: documentFile.name,
          file_size_bytes: documentFile.size,
          mime_type: documentFile.type || null,
          uploaded_by: user.id,
          visibility_body: visibilityBody,
        } as never)
        .select("id")
        .single();

      if (insertResult.error) {
        await supabase.storage.from("dms-documents").remove([filePath]);
        throw insertResult.error;
      }

      const createdDocument = insertResult.data as { id: string } | null;

      if (!createdDocument?.id) {
        await supabase.storage.from("dms-documents").remove([filePath]);
        throw new Error("Dokument nije moguće inicijalizirati.");
      }

      const initialVersionResult = await supabase.from("document_versions" as never).insert({
        document_id: createdDocument.id,
        version_number: 1,
        title: documentTitle.trim(),
        description: documentDescription.trim() || null,
        file_path: filePath,
        file_name: documentFile.name,
        file_size_bytes: documentFile.size,
        mime_type: documentFile.type || null,
        created_by: user.id,
      } as never);

      if (initialVersionResult.error) {
        await supabase.from("documents" as never).delete().eq("id", createdDocument.id);
        await supabase.storage.from("dms-documents").remove([filePath]);
        throw initialVersionResult.error;
      }

      setDocumentTitle("");
      setDocumentDescription("");
      setDocumentVisibility(allMembersValue);
      setDocumentFile(null);
      event.currentTarget.reset();
      await loadPortalData();

      toast({ title: "Dokument je spremljen", description: "Dokument je dostupan kroz portal." });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Upload nije uspio", description, variant: "destructive" });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDownload = async (document: DocumentRecord) => {
    try {
      await downloadStorageFile("dms-documents", document.file_path, document.file_name);
    } catch (error) {
      toast({ title: "Preuzimanje nije uspjelo", description: error instanceof Error ? error.message : "Pokušaj ponovno.", variant: "destructive" });
    }
  };

  const handleVersionDownload = async (filePath: string, fileName: string) => {
    try {
      await downloadStorageFile("dms-documents", filePath, fileName);
    } catch (error) {
      toast({ title: "Preuzimanje verzije nije uspjelo", description: error instanceof Error ? error.message : "Pokušaj ponovno.", variant: "destructive" });
    }
  };

  const handlePreview = async (document: DocumentRecord) => {
    setPreviewTitle(document.file_name);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewUrl(null);

    try {
      const blob = await fetchStorageBlob("dms-documents", document.file_path);
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

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    const { error } = await supabase.from("documents" as never).delete().eq("id", documentId);

    if (error) {
      toast({ title: "Brisanje nije uspjelo", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.storage.from("dms-documents").remove([filePath]);
    await loadPortalData();
    toast({ title: "Dokument je obrisan" });
  };

  const handleVersionUpload = async (document: DocumentRecord) => {
    if (!user) return;

    const versionFile = versionFiles[document.id];
    const versionNote = versionNotes[document.id]?.trim() || null;

    if (!versionFile) {
      toast({ title: "Odaberi novu datoteku", description: "Za novu verziju potreban je novi file.", variant: "destructive" });
      return;
    }

    setUploadingVersionFor(document.id);

    const existingVersions = versionsByDocumentId.get(document.id) ?? [];
    const safeName = versionFile.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const nextVersionNumber = existingVersions.length === 0 ? 2 : Math.max(...existingVersions.map((item) => item.version_number)) + 1;
    const newFilePath = `${user.id}/versions/${document.id}/${Date.now()}-${safeName}`;

    try {
      if (existingVersions.length === 0) {
        const baselineResult = await supabase.from("document_versions" as never).insert({
          document_id: document.id,
          version_number: 1,
          title: document.title,
          description: document.description,
          file_path: document.file_path,
          file_name: document.file_name,
          file_size_bytes: document.file_size_bytes,
          mime_type: document.mime_type,
          created_by: document.uploaded_by,
        } as never);

        if (baselineResult.error) throw baselineResult.error;
      }

      const uploadResult = await supabase.storage.from("dms-documents").upload(newFilePath, versionFile, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadResult.error) throw uploadResult.error;

      const versionInsertResult = await supabase.from("document_versions" as never).insert({
        document_id: document.id,
        version_number: nextVersionNumber,
        title: document.title,
        description: versionNote ?? document.description,
        file_path: newFilePath,
        file_name: versionFile.name,
        file_size_bytes: versionFile.size,
        mime_type: versionFile.type || null,
        created_by: user.id,
      } as never);

      if (versionInsertResult.error) {
        await supabase.storage.from("dms-documents").remove([newFilePath]);
        throw versionInsertResult.error;
      }

      const documentUpdateResult = await supabase
        .from("documents" as never)
        .update({
          description: versionNote ?? document.description,
          file_path: newFilePath,
          file_name: versionFile.name,
          file_size_bytes: versionFile.size,
          mime_type: versionFile.type || null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", document.id);

      if (documentUpdateResult.error) {
        await supabase.from("document_versions" as never).delete().eq("document_id", document.id).eq("version_number", nextVersionNumber);
        await supabase.storage.from("dms-documents").remove([newFilePath]);
        throw documentUpdateResult.error;
      }

      setVersionFiles((current) => ({ ...current, [document.id]: null }));
      setVersionNotes((current) => ({ ...current, [document.id]: "" }));
      await loadPortalData();

      toast({ title: "Nova verzija je spremljena", description: `Dokument je ažuriran na v${nextVersionNumber}.` });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Spremanje verzije nije uspjelo", description, variant: "destructive" });
    } finally {
      setUploadingVersionFor(null);
    }
  };

  const handleCommentSubmit = async (documentId: string) => {
    if (!user) return;

    const body = commentDrafts[documentId]?.trim();

    if (!body) {
      toast({ title: "Unesi komentar", description: "Komentar ne može biti prazan.", variant: "destructive" });
      return;
    }

    setSubmittingCommentFor(documentId);

    try {
      const { error } = await supabase.from("document_comments" as never).insert({
        document_id: documentId,
        author_id: user.id,
        body,
      } as never);

      if (error) throw error;

      setCommentDrafts((current) => ({ ...current, [documentId]: "" }));
      await loadPortalData();
      toast({ title: "Komentar je dodan" });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Komentar nije spremljen", description, variant: "destructive" });
    } finally {
      setSubmittingCommentFor(documentId);
    }
  };

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;

    setSavingEvent(true);

    try {
      const { error } = await supabase.from("calendar_events" as never).insert({
        title: eventTitle.trim(),
        description: eventDescription.trim() || null,
        location: eventLocation.trim() || null,
        starts_at: new Date(eventStartsAt).toISOString(),
        ends_at: new Date(eventEndsAt).toISOString(),
        created_by: user.id,
        visibility_body: eventVisibility === allMembersValue ? null : eventVisibility,
      } as never);

      if (error) throw error;

      setEventTitle("");
      setEventDescription("");
      setEventLocation("");
      setEventStartsAt("");
      setEventEndsAt("");
      setEventVisibility(allMembersValue);
      await loadPortalData();

      toast({ title: "Događaj je dodan", description: "Kalendar je ažuriran." });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Spremanje događaja nije uspjelo", description, variant: "destructive" });
    } finally {
      setSavingEvent(false);
    }
  };

  const toggleAdminBody = (body: Enums<"association_body">, checked: boolean) => {
    setAdminBodies((current) =>
      checked ? Array.from(new Set([...current, body])) : current.filter((item) => item !== body),
    );
  };

  const openEditUserDialog = (member: DirectoryRow) => {
    setEditingMember(member);
    setEditUserForm({
      userId: member.user_id,
      fullName: member.full_name,
      email: member.email,
      title: member.title ?? "",
      membershipStatus: member.membership_status,
      role: member.roles[0] ?? "member",
      bodies: member.bodies,
      isActive: member.is_active,
    });
  };

  const closeEditUserDialog = () => {
    setEditingMember(null);
  };

  const closeDeleteDialog = () => {
    if (deletingUser) return;
    setDeletingMember(null);
  };

  const toggleEditBody = (body: Enums<"association_body">, checked: boolean) => {
    setEditUserForm((current) => ({
      ...current,
      bodies: checked ? Array.from(new Set([...current.bodies, body])) : current.bodies.filter((item) => item !== body),
    }));
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setCreatingUser(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: adminEmail.trim(),
          fullName: adminFullName.trim(),
          title: adminTitle.trim() || null,
          membershipStatus: adminMembershipStatus,
          isActive: adminActive,
          role: adminRole,
          bodies: adminBodies,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });

      if (error) throw error;

      setAdminEmail("");
      setAdminFullName("");
      setAdminTitle("");
      setAdminRole("member");
      setAdminMembershipStatus("active");
      setAdminBodies([]);
      setAdminActive(true);
      await loadPortalData();

      toast({
        title: "Korisnik je kreiran",
        description: data?.message ?? "Korisnik će emailom dobiti link za postavljanje lozinke.",
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Kreiranje korisnika nije uspjelo", description, variant: "destructive" });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSaveUserChanges = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = editUserSchema.safeParse(editUserForm);

    if (!parsed.success) {
      toast({
        title: "Provjeri podatke korisnika",
        description: parsed.error.issues[0]?.message ?? "Uneseni podaci nisu valjani.",
        variant: "destructive",
      });
      return;
    }

    setSavingUserChanges(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: {
          userId: parsed.data.userId,
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          title: parsed.data.title.trim() || null,
          membershipStatus: parsed.data.membershipStatus,
          role: parsed.data.role,
          bodies: parsed.data.bodies,
          isActive: parsed.data.isActive,
        },
      });

      if (error) throw error;

      if (parsed.data.userId === user?.id) {
        await refreshAccessData();
      }

      await loadPortalData();
      closeEditUserDialog();
      toast({ title: "Korisnik je ažuriran", description: data?.message ?? "Promjene su spremljene." });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Spremanje izmjena nije uspjelo", description, variant: "destructive" });
    } finally {
      setSavingUserChanges(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingMember) return;

    setDeletingUser(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: {
          userId: deletingMember.user_id,
        },
      });

      if (error) throw error;

      await loadPortalData();
      setDeletingMember(null);
      toast({ title: "Korisnik je obrisan", description: data?.message ?? "Račun i pristupi su uklonjeni." });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Brisanje korisnika nije uspjelo", description, variant: "destructive" });
    } finally {
      setDeletingUser(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">DMS portal</Badge>
              {isMasterAdmin && <Badge>Administracija</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-foreground">Interni portal</h1>
            <p className="text-sm text-muted-foreground">
              {profile?.full_name ?? user?.email} · {memberSummary.length > 0 ? memberSummary.join(", ") : "Pristup članskom portalu"}
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Odjava
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {portalLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16 text-muted-foreground">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
            Učitavam dokumente, kalendar i članove...
          </div>
        ) : (
          <Tabs defaultValue="documents" orientation="vertical" className="flex gap-6">
            <div className="flex h-auto w-72 shrink-0 flex-col gap-1 rounded-xl border border-border bg-card p-2 sticky top-24 self-start">
              {/* Oglasna ploča - collapsible */}
              <Collapsible open={bulletinOpen} onOpenChange={setBulletinOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 shrink-0" />
                    Oglasna ploča
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${bulletinOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <TabsList className="flex h-auto flex-col items-stretch gap-1 bg-transparent p-0 pl-2">
                    <TabsTrigger value="bulletin-decisions" className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Objava odluka
                    </TabsTrigger>
                    <TabsTrigger value="bulletin-minutes" className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Zapisnici
                    </TabsTrigger>
                    <TabsTrigger value="bulletin-board-work" className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Rad Upravnog odbora
                    </TabsTrigger>
                    <TabsTrigger value="bulletin-advisory" className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Rad Savjetodavnog vijeća
                    </TabsTrigger>
                    <TabsTrigger value="bulletin-voting" className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Glasanje
                    </TabsTrigger>
                  </TabsList>
                </CollapsibleContent>
              </Collapsible>

              <TabsList className="flex h-auto flex-col items-stretch gap-1 bg-transparent p-0">
                <TabsTrigger value="documents" className="justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4 shrink-0" />
                  Zajednički dokumenti
                </TabsTrigger>
                <TabsTrigger value="calendar" className="justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  Kalendar
                </TabsTrigger>
                <TabsTrigger value="chat" className="justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  Interni chat
                </TabsTrigger>
                <TabsTrigger value="projects" className="justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  Suradnja na projektima
                </TabsTrigger>
              </TabsList>

              {/* Sekcije - collapsible */}
              <Collapsible open={sectionsOpen} onOpenChange={setSectionsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 shrink-0" />
                    Sekcije
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${sectionsOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <TabsList className="flex h-auto flex-col items-stretch gap-1 bg-transparent p-0 pl-2">
                    {SECTIONS.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={`section-${section.id}`}
                        className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {section.label}
                      </TabsTrigger>
                    ))}
                    {customSections.map((cs) => (
                      <TabsTrigger
                        key={cs.id}
                        value={`section-custom-${cs.id}`}
                        className="justify-start gap-2 pl-6 text-xs text-left whitespace-normal leading-tight py-2 min-h-[2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {cs.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {isMasterAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowAddSection(true)}
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 pl-6 text-xs font-medium text-primary hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Dodaj sekciju
                    </button>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Administracija - collapsible */}
              {isMasterAdmin && (
                <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 shrink-0" />
                      Administracija
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${adminOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <TabsList className="flex h-auto flex-col items-stretch gap-1 bg-transparent p-0 pl-2">
                      <TabsTrigger value="admin-users" className="justify-start gap-2 pl-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        Korisnici portala
                      </TabsTrigger>
                      <TabsTrigger value="admin-members" className="justify-start gap-2 pl-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        Članovi Udruge
                      </TabsTrigger>
                    </TabsList>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-6">

            <TabsContent value="documents" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Zajednički dokumenti i razmjena datoteka</CardTitle>
                    <CardDescription>Upload, pregled i kontrola pristupa po vijećima.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleDocumentUpload} className="grid gap-4 rounded-xl border border-border bg-accent/40 p-4">
                      <div className="grid gap-2">
                        <Label htmlFor="document-title">Naziv dokumenta</Label>
                        <Input id="document-title" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="document-description">Opis</Label>
                        <Textarea
                          id="document-description"
                          value={documentDescription}
                          onChange={(e) => setDocumentDescription(e.target.value)}
                          placeholder="Kratki opis dokumenta, verzije ili namjene..."
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Vidljivost</Label>
                          <Select value={documentVisibility} onValueChange={setDocumentVisibility}>
                            <SelectTrigger>
                              <SelectValue placeholder="Odaberi vidljivost" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={allMembersValue}>Svi prijavljeni članovi</SelectItem>
                              {bodyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="document-file">Datoteka</Label>
                          <Input
                            id="document-file"
                            type="file"
                            onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={uploadingDocument}>
                        {uploadingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploadingDocument ? "Spremam dokument..." : "Dodaj dokument"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Popis dokumenata</CardTitle>
                    <CardDescription>Vidite samo dokumente na koje imate pravo pristupa.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {documents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        Još nema dokumenata u portalu.
                      </div>
                    ) : (
                      documents.map((document) => {
                        const versionHistory = getDocumentVersions(document);
                        const commentThread = getDocumentComments(document.id);
                        const isExpanded = expandedDocumentId === document.id;

                        return (
                          <div key={document.id} className="rounded-xl border border-border p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{document.title}</h3>
                                  <Badge variant="outline">
                                    {bodyOptions.find((option) => option.value === document.visibility_body)?.label ?? "Svi članovi"}
                                  </Badge>
                                  <Badge variant="secondary">v{versionHistory[0]?.version_number ?? 1}</Badge>
                                  <Badge variant="outline">{commentThread.length} komentara</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{document.description || "Bez dodatnog opisa."}</p>
                                <p className="text-xs text-muted-foreground">
                                  {document.file_name} · {formatFileSize(document.file_size_bytes)} · {format(new Date(document.updated_at), "dd.MM.yyyy. HH:mm")}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handlePreview(document)}>
                                  <Eye className="h-4 w-4" />
                                  Pregled
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
                                  <Download className="h-4 w-4" />
                                  Preuzmi
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedDocumentId(isExpanded ? null : document.id)}
                                >
                                  <History className="h-4 w-4" />
                                  {isExpanded ? "Sakrij detalje" : "Verzije i komentari"}
                                </Button>
                                {(isMasterAdmin || document.uploaded_by === user?.id) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => void handleDeleteDocument(document.id, document.file_path)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 grid gap-4 border-t border-border pt-4 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="space-y-4">
                                  <div className="rounded-xl border border-border bg-accent/30 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <History className="h-4 w-4 text-primary" />
                                      <h4 className="font-medium text-foreground">Povijest verzija</h4>
                                    </div>
                                    <div className="space-y-3">
                                      {versionHistory.map((version, index) => (
                                        <div key={version.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background/80 p-3 md:flex-row md:items-center md:justify-between">
                                          <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <Badge variant={index === 0 ? "secondary" : "outline"}>v{version.version_number}</Badge>
                                              {index === 0 && <Badge>Najnovija verzija</Badge>}
                                            </div>
                                            <p className="text-sm text-foreground">{version.file_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {formatFileSize(version.file_size_bytes)} · {getDisplayName(version.created_by)} · {format(new Date(version.created_at), "dd.MM.yyyy. HH:mm")}
                                            </p>
                                            {version.description && <p className="text-xs text-muted-foreground">{version.description}</p>}
                                          </div>
                                          <Button variant="outline" size="sm" onClick={() => handleVersionDownload(version.file_path, version.file_name)}>
                                            <Download className="h-4 w-4" />
                                            Preuzmi v{version.version_number}
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {(isMasterAdmin || document.uploaded_by === user?.id) && (
                                    <div className="rounded-xl border border-border bg-accent/30 p-4">
                                      <div className="mb-3 flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-primary" />
                                        <h4 className="font-medium text-foreground">Dodaj novu verziju</h4>
                                      </div>
                                      <div className="grid gap-3">
                                        <Input
                                          type="file"
                                          onChange={(e) =>
                                            setVersionFiles((current) => ({
                                              ...current,
                                              [document.id]: e.target.files?.[0] ?? null,
                                            }))
                                          }
                                        />
                                        <Textarea
                                          value={versionNotes[document.id] ?? ""}
                                          onChange={(e) =>
                                            setVersionNotes((current) => ({
                                              ...current,
                                              [document.id]: e.target.value,
                                            }))
                                          }
                                          placeholder="Što je promijenjeno u ovoj verziji?"
                                        />
                                        <Button
                                          type="button"
                                          onClick={() => void handleVersionUpload(document)}
                                          disabled={uploadingVersionFor === document.id}
                                        >
                                          {uploadingVersionFor === document.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                          {uploadingVersionFor === document.id ? "Spremam verziju..." : "Spremi novu verziju"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="rounded-xl border border-border bg-accent/30 p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <MessageSquareText className="h-4 w-4 text-primary" />
                                    <h4 className="font-medium text-foreground">Komentari i kolaboracija</h4>
                                  </div>

                                  <div className="space-y-3">
                                    {commentThread.length === 0 ? (
                                      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                                        Još nema komentara za ovaj dokument.
                                      </div>
                                    ) : (
                                      commentThread.map((comment) => (
                                        <div key={comment.id} className="rounded-xl border border-border bg-background/80 p-3">
                                          <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-medium text-foreground">{getDisplayName(comment.author_id)}</p>
                                            <span className="text-xs text-muted-foreground">{format(new Date(comment.created_at), "dd.MM.yyyy. HH:mm")}</span>
                                          </div>
                                          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <div className="mt-4 grid gap-3">
                                    <Textarea
                                      value={commentDrafts[document.id] ?? ""}
                                      onChange={(e) =>
                                        setCommentDrafts((current) => ({
                                          ...current,
                                          [document.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Dodaj komentar, povratnu informaciju ili napomenu..."
                                    />
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      onClick={() => void handleCommentSubmit(document.id)}
                                      disabled={submittingCommentFor === document.id}
                                    >
                                      {submittingCommentFor === document.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                                      {submittingCommentFor === document.id ? "Šaljem komentar..." : "Dodaj komentar"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kalendar događaja</CardTitle>
                  <CardDescription>Zajednički raspored sastanaka, sjednica i radionica.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
                    <div className="rounded-xl border border-border">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="w-full" />
                    </div>

                    <div className="rounded-xl border border-border p-4">
                      <div className="mb-4">
                        <h3 className="font-semibold text-foreground">Nadolazeći događaji</h3>
                        <p className="text-sm text-muted-foreground">Popis svih unesenih budućih događaja s datumom i vremenom.</p>
                      </div>

                      <div className="space-y-3">
                        {upcomingEvents.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                            Trenutno nema nadolazećih događaja.
                          </div>
                        ) : (
                          upcomingEvents.map((item) => (
                            <div key={`upcoming-${item.id}`} className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                                  <Badge variant="outline">
                                    {bodyOptions.find((option) => option.value === item.visibility_body)?.label ?? "Svi članovi"}
                                  </Badge>
                                </div>
                                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                {item.location && <p className="text-sm text-muted-foreground">Lokacija: {item.location}</p>}
                              </div>
                              <div className="shrink-0 text-sm text-muted-foreground md:text-right">
                                <p>{format(new Date(item.starts_at), "dd.MM.yyyy.")}</p>
                                <p>
                                  {format(new Date(item.starts_at), "HH:mm")} — {format(new Date(item.ends_at), "HH:mm")}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleEventSubmit} className="grid gap-4 rounded-xl border border-border bg-accent/40 p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-title">Naslov događaja</Label>
                      <Input id="event-title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-description">Opis</Label>
                      <Textarea id="event-description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="event-start">Početak</Label>
                        <Input id="event-start" type="datetime-local" value={eventStartsAt} onChange={(e) => setEventStartsAt(e.target.value)} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="event-end">Završetak</Label>
                        <Input id="event-end" type="datetime-local" value={eventEndsAt} onChange={(e) => setEventEndsAt(e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="event-location">Lokacija</Label>
                        <Input id="event-location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Online / ured / dvorana" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Vidljivost</Label>
                        <Select value={eventVisibility} onValueChange={setEventVisibility}>
                          <SelectTrigger>
                            <SelectValue placeholder="Odaberi vidljivost" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={allMembersValue}>Svi prijavljeni članovi</SelectItem>
                            {bodyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" disabled={savingEvent}>
                      {savingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {savingEvent ? "Spremam događaj..." : "Dodaj događaj"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Događaji za odabrani datum</CardTitle>
                  <CardDescription>
                    {selectedDate ? format(selectedDate, "dd.MM.yyyy.") : "Prikaz svih događaja"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDayEvents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                      Nema događaja za odabrani datum.
                    </div>
                  ) : (
                    selectedDayEvents.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <Badge variant="outline">
                            {bodyOptions.find((option) => option.value === item.visibility_body)?.label ?? "Svi članovi"}
                          </Badge>
                        </div>
                        {item.description && <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>}
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            {format(new Date(item.starts_at), "dd.MM.yyyy. HH:mm")} — {format(new Date(item.ends_at), "dd.MM.yyyy. HH:mm")}
                          </p>
                          {item.location && <p>Lokacija: {item.location}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Oglasna ploča sub-tabs (document sections) */}
            {[
              { value: "bulletin-decisions", label: "Objava odluka", sectionId: "bulletin-decisions" },
              { value: "bulletin-minutes", label: "Zapisnici", sectionId: "bulletin-minutes" },
              { value: "bulletin-board-work", label: "Rad Upravnog odbora", sectionId: "bulletin-board-work" },
              { value: "bulletin-advisory", label: "Rad Savjetodavnog vijeća", sectionId: "bulletin-advisory" },
            ].map((item) => (
              <TabsContent key={item.value} value={item.value} className="space-y-6">
                <SingleSectionDocs
                  sectionId={item.sectionId}
                  sectionLabel={item.label}
                  userId={user!.id}
                  profileNameByUserId={profileNameByUserId}
                />
              </TabsContent>
            ))}

            {/* Glasanje - voting system */}
            <TabsContent value="bulletin-voting" className="space-y-6">
              <VotingTab
                userId={user!.id}
                profileNameByUserId={profileNameByUserId}
                isMasterAdmin={isMasterAdmin}
              />
            </TabsContent>

            {/* Interni chat */}
            <TabsContent value="chat" className="space-y-6">
              <ChatTab
                userId={user!.id}
                profileNameByUserId={profileNameByUserId}
                isMasterAdmin={isMasterAdmin}
              />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <ProjectsTab
                userId={user!.id}
                profileNameByUserId={profileNameByUserId}
                isMasterAdmin={isMasterAdmin}
              />
            </TabsContent>

            {SECTIONS.map((section) => (
              <TabsContent key={section.id} value={`section-${section.id}`} className="space-y-6">
                <SingleSectionDocs
                  sectionId={section.id}
                  sectionLabel={section.label}
                  userId={user!.id}
                  profileNameByUserId={profileNameByUserId}
                />
              </TabsContent>
            ))}

            {customSections.map((cs) => (
              <TabsContent key={cs.id} value={`section-custom-${cs.id}`} className="space-y-6">
                <SingleSectionDocs
                  sectionId={cs.id}
                  sectionLabel={cs.label}
                  userId={user!.id}
                  profileNameByUserId={profileNameByUserId}
                />
              </TabsContent>
            ))}

            {isMasterAdmin && (
              <>
              <TabsContent value="admin-users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Korisnici portala</CardTitle>
                        <CardDescription>Pregled članova udruge, vijeća i pristupnih razina.</CardDescription>
                      </div>
                      <Button onClick={() => setShowCreateUserDialog(true)}>
                        <Plus className="h-4 w-4" />
                        Kreiranje korisnika
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ime i prezime</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Funkcija</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Vijeća / članstvo</TableHead>
                            <TableHead>Uloga</TableHead>
                            <TableHead className="text-right">Akcije</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {directoryRows.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium text-foreground">{member.full_name}</TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{member.title ?? "—"}</TableCell>
                              <TableCell>
                                <Badge variant={member.is_active ? "secondary" : "outline"}>{member.membership_status}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  {member.bodies.length > 0 ? (
                                    member.bodies.map((body) => (
                                      <Badge key={body} variant="outline">
                                        {bodyOptions.find((option) => option.value === body)?.label ?? body}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  {member.roles.length > 0 ? (
                                    member.roles.map((role) => <Badge key={role}>{roleLabels[role]}</Badge>)
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditUserDialog(member)}>
                                    <Edit3 className="h-4 w-4" />
                                    Uredi
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeletingMember(member)}
                                    disabled={member.user_id === user?.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Obriši
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

              </TabsContent>

              <TabsContent value="admin-members" className="space-y-6">
                <AssociationMembersTab userId={user!.id} isMasterAdmin={isMasterAdmin} />
              </TabsContent>
              </>
            )}
            </div>
          </Tabs>
        )}


        {/* Create User Dialog */}
        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kreiranje korisnika</DialogTitle>
              <DialogDescription>Kreiraj profil, dodijeli vijeće i pošalji pozivnicu.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="admin-full-name">Ime i prezime</Label>
                  <Input id="admin-full-name" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-title">Funkcija</Label>
                <Input id="admin-title" value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} placeholder="npr. član vijeća / predsjednik" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Uloga</Label>
                  <Select value={adminRole} onValueChange={(value) => setAdminRole(value as Enums<"app_role">)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="master_admin">Master Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status članstva</Label>
                  <Select value={adminMembershipStatus} onValueChange={setAdminMembershipStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktivan</SelectItem>
                      <SelectItem value="inactive">Neaktivan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Dodjela vijeća i članstva</Label>
                <div className="grid gap-3 rounded-xl border border-border bg-accent/40 p-4 md:grid-cols-2">
                  {bodyOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={adminBodies.includes(option.value)}
                        onCheckedChange={(checked) => toggleAdminBody(option.value, checked === true)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-foreground">
                <Checkbox checked={adminActive} onCheckedChange={(checked) => setAdminActive(checked === true)} />
                Profil je odmah aktivan
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>Odustani</Button>
                <Button type="submit" disabled={creatingUser}>
                  {creatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  {creatingUser ? "Kreiram korisnika..." : "Kreiraj korisnika"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={Boolean(editingMember)} onOpenChange={(open) => !open && closeEditUserDialog()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Uredi korisnika</DialogTitle>
              <DialogDescription>Master Admin može ažurirati profil, ulogu, status i pripadnost vijećima.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveUserChanges} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-full-name">Ime i prezime</Label>
                  <Input id="edit-full-name" value={editUserForm.fullName} onChange={(e) => setEditUserForm((c) => ({ ...c, fullName: e.target.value }))} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={editUserForm.email} onChange={(e) => setEditUserForm((c) => ({ ...c, email: e.target.value }))} required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Funkcija</Label>
                  <Input id="edit-title" value={editUserForm.title} onChange={(e) => setEditUserForm((c) => ({ ...c, title: e.target.value }))} placeholder="npr. član vijeća / predsjednik" />
                </div>
                <div className="grid gap-2">
                  <Label>Status članstva</Label>
                  <Select value={editUserForm.membershipStatus} onValueChange={(v) => setEditUserForm((c) => ({ ...c, membershipStatus: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktivan</SelectItem>
                      <SelectItem value="inactive">Neaktivan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Uloga</Label>
                  <Select value={editUserForm.role} onValueChange={(v) => setEditUserForm((c) => ({ ...c, role: v as Enums<"app_role"> }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="master_admin">Master Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-foreground md:mt-7">
                  <Checkbox checked={editUserForm.isActive} onCheckedChange={(checked) => setEditUserForm((c) => ({ ...c, isActive: checked === true }))} />
                  Profil je aktivan
                </label>
              </div>
              <div className="grid gap-2">
                <Label>Dodjela vijeća i članstva</Label>
                <div className="grid gap-3 rounded-xl border border-border bg-accent/30 p-4 md:grid-cols-2">
                  {bodyOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 text-sm text-foreground">
                      <Checkbox checked={editUserForm.bodies.includes(option.value)} onCheckedChange={(checked) => toggleEditBody(option.value, checked === true)} />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
                <Button type="button" variant="outline" onClick={closeEditUserDialog}>Odustani</Button>
                <Button type="submit" disabled={savingUserChanges}>
                  {savingUserChanges ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  {savingUserChanges ? "Spremam izmjene..." : "Spremi izmjene"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={Boolean(deletingMember)} onOpenChange={(open) => !open && closeDeleteDialog()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Obrisati korisnika?</AlertDialogTitle>
              <AlertDialogDescription>
                {deletingMember
                  ? `Korisnik ${deletingMember.full_name} bit će trajno uklonjen iz portala zajedno s pristupnim zapisima.`
                  : "Ova akcija trajno uklanja korisnika iz portala."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingUser}>Odustani</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(event) => { event.preventDefault(); void handleDeleteUser(); }}
                disabled={deletingUser}
              >
                {deletingUser ? "Brišem korisnika..." : "Obriši korisnika"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Section Dialog */}
        <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dodaj novu sekciju</DialogTitle>
              <DialogDescription>Unesite naziv nove sekcije za kolaboraciju.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Naziv sekcije</Label>
                <Input
                  value={newSectionLabel}
                  onChange={(e) => setNewSectionLabel(e.target.value)}
                  placeholder="npr. Marketing sekcija"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAddSection(); } }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddSection(false)}>Odustani</Button>
                <Button onClick={() => void handleAddSection()} disabled={savingSection || !newSectionLabel.trim()}>
                  {savingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {savingSection ? "Dodajem..." : "Dodaj"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) closePreview(); }}>
          <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 [&>button]:hidden">
            <DialogDescription className="sr-only">
              Ugrađeni pregled dokumenta unutar portala.
            </DialogDescription>
            <DialogHeader className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-medium truncate pr-4">{previewTitle}</DialogTitle>
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
      </main>
    </div>
  );
};

export default PortalDashboard;

