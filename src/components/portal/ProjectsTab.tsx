import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { downloadStorageFile } from "@/lib/storage-download";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  assigned_to: string | null;
  deadline: string | null;
  created_by: string;
  created_at: string;
};

type ProjectDoc = {
  id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size_bytes: number | null;
  uploaded_by: string;
  created_at: string;
};

interface ProjectsTabProps {
  userId: string;
  profileNameByUserId: Map<string, string>;
  isMasterAdmin: boolean;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  archived: "bg-muted text-muted-foreground",
};

const taskStatusLabels: Record<string, string> = {
  todo: "Za napraviti",
  in_progress: "U tijeku",
  done: "Završeno",
};

const taskStatusColors: Record<string, string> = {
  todo: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const formatFileSize = (size: number | null) => {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const ProjectsTab = ({ userId, profileNameByUserId, isMasterAdmin }: ProjectsTabProps) => {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // New project dialog
  const [showNewProject, setShowNewProject] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [savingProject, setSavingProject] = useState(false);

  // New task dialog
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  // Upload doc
  const [uploadProjectId, setUploadProjectId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const getName = (uid: string | null) => {
    if (!uid) return "—";
    return profileNameByUserId.get(uid) ?? "Član portala";
  };

  const profileList = useMemo(() => {
    return Array.from(profileNameByUserId.entries()).map(([id, name]) => ({ id, name }));
  }, [profileNameByUserId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes, dRes] = await Promise.all([
        supabase.from("projects" as never).select("*").order("created_at", { ascending: false }),
        supabase.from("project_tasks" as never).select("*").order("created_at", { ascending: true }),
        supabase
          .from("documents" as never)
          .select("id,title,file_path,file_name,file_size_bytes,uploaded_by,created_at")
          .like("section", "project-%")
          .order("created_at", { ascending: false }),
      ]);
      if (pRes.error) throw pRes.error;
      if (tRes.error) throw tRes.error;
      setProjects((pRes.data ?? []) as unknown as Project[]);
      setTasks((tRes.data ?? []) as unknown as ProjectTask[]);
      setDocs(dRes.error ? [] : ((dRes.data ?? []) as unknown as ProjectDoc[]));
    } catch (e) {
      toast({ title: "Greška pri učitavanju projekata", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateProject = async () => {
    if (!newTitle.trim()) return;
    setSavingProject(true);
    try {
      const { error } = await supabase.from("projects" as never).insert({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        created_by: userId,
      } as never);
      if (error) throw error;
      setNewTitle("");
      setNewDescription("");
      setShowNewProject(false);
      await loadData();
      toast({ title: "Projekt je kreiran" });
    } catch (e) {
      toast({ title: "Kreiranje projekta nije uspjelo", variant: "destructive" });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from("projects" as never).delete().eq("id", projectId);
    if (error) {
      toast({ title: "Brisanje projekta nije uspjelo", variant: "destructive" });
    } else {
      await loadData();
      toast({ title: "Projekt je obrisan" });
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !taskProjectId) return;
    setSavingTask(true);
    try {
      const { error } = await supabase.from("project_tasks" as never).insert({
        project_id: taskProjectId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        assigned_to: taskAssignedTo || null,
        deadline: taskDeadline || null,
        created_by: userId,
      } as never);
      if (error) throw error;
      setTaskTitle("");
      setTaskDescription("");
      setTaskAssignedTo("");
      setTaskDeadline("");
      setShowNewTask(false);
      await loadData();
      toast({ title: "Zadatak je dodan" });
    } catch (e) {
      toast({ title: "Dodavanje zadatka nije uspjelo", variant: "destructive" });
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from("project_tasks" as never)
      .update({ status: newStatus } as never)
      .eq("id", taskId);
    if (error) {
      toast({ title: "Promjena statusa nije uspjela", variant: "destructive" });
    } else {
      await loadData();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("project_tasks" as never).delete().eq("id", taskId);
    if (!error) await loadData();
  };

  const handleUploadDoc = async () => {
    if (!uploadFile || !uploadProjectId || !uploadTitle.trim()) return;
    setUploading(true);
    const safeName = uploadFile.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = `${userId}/projects/${uploadProjectId}/${Date.now()}-${safeName}`;
    try {
      const upRes = await supabase.storage.from("dms-documents").upload(filePath, uploadFile, { cacheControl: "3600", upsert: false });
      if (upRes.error) throw upRes.error;
      const { error } = await supabase.from("documents" as never).insert({
        title: uploadTitle.trim(),
        file_path: filePath,
        file_name: uploadFile.name,
        file_size_bytes: uploadFile.size,
        mime_type: uploadFile.type || null,
        uploaded_by: userId,
        section: `project-${uploadProjectId}`,
      } as never);
      if (error) {
        await supabase.storage.from("dms-documents").remove([filePath]);
        throw error;
      }
      setUploadFile(null);
      setUploadTitle("");
      setUploadProjectId(null);
      await loadData();
      toast({ title: "Dokument je spremljen" });
    } catch (e) {
      toast({ title: "Upload nije uspio", variant: "destructive" });
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

  const handleDeleteDoc = async (docId: string, filePath: string) => {
    await supabase.from("documents" as never).delete().eq("id", docId);
    await supabase.storage.from("dms-documents").remove([filePath]);
    await loadData();
    toast({ title: "Dokument je obrisan" });
  };

  const tasksByProject = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    tasks.forEach((t) => {
      const arr = map.get(t.project_id) ?? [];
      map.set(t.project_id, [...arr, t]);
    });
    return map;
  }, [tasks]);

  const docsByProject = useMemo(() => {
    const map = new Map<string, ProjectDoc[]>();
    docs.forEach((d) => {
      // section is "project-{id}"
      const pId = (d as any).section?.replace("project-", "");
      if (pId) {
        const arr = map.get(pId) ?? [];
        map.set(pId, [...arr, d]);
      }
    });
    return map;
  }, [docs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Učitavam projekte...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Suradnja na projektima
          </h2>
          <p className="text-sm text-muted-foreground">Projekti, zadaci, odgovorne osobe, rokovi i dokumentacija.</p>
        </div>
        <Button onClick={() => setShowNewProject(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Novi projekt
        </Button>
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nema projekata. Klikni "Novi projekt" za početak.
          </CardContent>
        </Card>
      )}

      {projects.map((project) => {
        const isExpanded = expandedProjectId === project.id;
        const projectTasks = tasksByProject.get(project.id) ?? [];
        const projectDocs = docsByProject.get(project.id) ?? [];
        const doneCount = projectTasks.filter((t) => t.status === "done").length;

        return (
          <Card key={project.id}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <CardTitle className="text-base truncate">{project.title}</CardTitle>
                  <Badge variant="outline" className={statusColors[project.status] ?? ""}>
                    {project.status === "active" ? "Aktivan" : project.status === "completed" ? "Završen" : "Arhiviran"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <span>{projectTasks.length} zadataka ({doneCount} gotovo)</span>
                  <span>·</span>
                  <span>{getName(project.created_by)}</span>
                </div>
              </div>
              {project.description && (
                <CardDescription className="ml-6">{project.description}</CardDescription>
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-4 pt-0">
                {/* Tasks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Zadaci</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskProjectId(project.id);
                        setShowNewTask(true);
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Dodaj zadatak
                    </Button>
                  </div>

                  {projectTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">Nema zadataka.</p>
                  )}

                  <div className="space-y-1">
                    {projectTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{task.title}</span>
                            <Badge variant="outline" className={`text-[10px] ${taskStatusColors[task.status] ?? ""}`}>
                              {taskStatusLabels[task.status] ?? task.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            {task.assigned_to && (
                              <span className="flex items-center gap-1">
                                <UserCircle className="h-3 w-3" />
                                {getName(task.assigned_to)}
                              </span>
                            )}
                            {task.deadline && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {format(new Date(task.deadline), "dd.MM.yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Select
                            value={task.status}
                            onValueChange={(val) => handleUpdateTaskStatus(task.id, val)}
                          >
                            <SelectTrigger className="h-7 w-[110px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">Za napraviti</SelectItem>
                              <SelectItem value="in_progress">U tijeku</SelectItem>
                              <SelectItem value="done">Završeno</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Projektna dokumentacija
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadProjectId(project.id);
                      }}
                    >
                      <Upload className="mr-1 h-3 w-3" /> Upload
                    </Button>
                  </div>

                  {projectDocs.length === 0 && (
                    <p className="text-xs text-muted-foreground py-1">Nema dokumenata.</p>
                  )}

                  {projectDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file_name} · {formatFileSize(doc.file_size_bytes)} · {getName(doc.uploaded_by)} · {format(new Date(doc.created_at), "dd.MM.yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc.file_path, doc.file_name)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteDoc(doc.id, doc.file_path)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Project actions */}
                <div className="flex gap-2 border-t border-border pt-3">
                  {project.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await supabase.from("projects" as never).update({ status: "completed" } as never).eq("id", project.id);
                        await loadData();
                      }}
                    >
                      Označi kao završen
                    </Button>
                  )}
                  {(project.created_by === userId || isMasterAdmin) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Obriši projekt
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* New project dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novi projekt</DialogTitle>
            <DialogDescription>Kreiraj novi projekt za suradnju.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Naziv projekta</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Naziv projekta" />
            </div>
            <div className="space-y-1">
              <Label>Opis (opcionalno)</Label>
              <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} placeholder="Opis projekta..." />
            </div>
            <Button onClick={handleCreateProject} disabled={savingProject || !newTitle.trim()} className="w-full">
              {savingProject ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Kreiraj projekt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New task dialog */}
      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novi zadatak</DialogTitle>
            <DialogDescription>Dodaj zadatak u projekt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Naziv zadatka</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Naziv zadatka" />
            </div>
            <div className="space-y-1">
              <Label>Opis (opcionalno)</Label>
              <Textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1">
              <Label>Odgovorna osoba</Label>
              <Select value={taskAssignedTo} onValueChange={setTaskAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi osobu..." />
                </SelectTrigger>
                <SelectContent>
                  {profileList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Rok</Label>
              <Input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
            </div>
            <Button onClick={handleCreateTask} disabled={savingTask || !taskTitle.trim()} className="w-full">
              {savingTask ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Dodaj zadatak
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload doc dialog */}
      <Dialog open={!!uploadProjectId} onOpenChange={(open) => { if (!open) setUploadProjectId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload dokumenta</DialogTitle>
            <DialogDescription>Dodaj dokument u projekt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Naziv</Label>
              <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Naziv dokumenta" />
            </div>
            <div className="space-y-1">
              <Label>Datoteka</Label>
              <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button onClick={handleUploadDoc} disabled={uploading || !uploadFile || !uploadTitle.trim()} className="w-full">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsTab;
