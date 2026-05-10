import { useEffect, useMemo, useState } from "react";
import { format, addYears, differenceInDays } from "date-fns";
import { AlertTriangle, Edit3, Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AssociationMember = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  country: string | null;
  oib: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  membership_type: "redovni" | "pocasni";
  activation_date: string;
  deactivation_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type MemberForm = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  country: string;
  oib: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  membership_type: "redovni" | "pocasni";
  activation_date: string;
  deactivation_date: string;
};

const emptyForm: MemberForm = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  country: "Hrvatska",
  oib: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  postal_code: "",
  membership_type: "redovni",
  activation_date: new Date().toISOString().split("T")[0],
  deactivation_date: "",
};

interface Props {
  userId: string;
  isMasterAdmin: boolean;
}

export default function AssociationMembersTab({ userId, isMasterAdmin }: Props) {
  const { toast } = useToast();
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MemberForm>({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<AssociationMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<AssociationMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("association_members" as never)
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      toast({ title: "Greška pri učitavanju članova", description: error.message, variant: "destructive" });
    } else {
      setMembers((data ?? []) as unknown as AssociationMember[]);
    }
    setLoading(false);
  };

  useEffect(() => { void loadMembers(); }, []);

  const expiringMembers = useMemo(() => {
    const now = new Date();
    return members
      .filter((m) => {
        if (m.deactivation_date) return false;
        const activationDate = new Date(m.activation_date);
        const expiryDate = addYears(activationDate, 1);
        const daysLeft = differenceInDays(expiryDate, now);
        return daysLeft <= 60 && daysLeft >= -30;
      })
      .map((m) => {
        const expiryDate = addYears(new Date(m.activation_date), 1);
        const daysLeft = differenceInDays(expiryDate, now);
        return { ...m, expiryDate, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [members]);

  const updateField = (field: keyof MemberForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddForm = () => {
    setEditingMember(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (member: AssociationMember) => {
    setEditingMember(member);
    setForm({
      first_name: member.first_name,
      last_name: member.last_name,
      date_of_birth: member.date_of_birth ?? "",
      gender: member.gender ?? "",
      country: member.country ?? "",
      oib: member.oib ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      address: member.address ?? "",
      city: member.city ?? "",
      postal_code: member.postal_code ?? "",
      membership_type: member.membership_type,
      activation_date: member.activation_date,
      deactivation_date: member.deactivation_date ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast({ title: "Ime i prezime su obavezni", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      date_of_birth: form.date_of_birth || null,
      gender: form.gender.trim() || null,
      country: form.country.trim() || null,
      oib: form.oib.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      postal_code: form.postal_code.trim() || null,
      membership_type: form.membership_type,
      activation_date: form.activation_date,
      deactivation_date: form.deactivation_date || null,
    };

    try {
      if (editingMember) {
        const { error } = await supabase
          .from("association_members" as never)
          .update(payload as never)
          .eq("id", editingMember.id);
        if (error) throw error;
        toast({ title: "Član je ažuriran" });
      } else {
        const { error } = await supabase
          .from("association_members" as never)
          .insert({ ...payload, created_by: userId } as never);
        if (error) throw error;
        toast({ title: "Član je dodan" });
      }
      setShowForm(false);
      setEditingMember(null);
      await loadMembers();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Spremanje nije uspjelo", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("association_members" as never)
        .delete()
        .eq("id", deletingMember.id);
      if (error) throw error;
      toast({ title: "Član je obrisan" });
      setDeletingMember(null);
      await loadMembers();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Pokušaj ponovno.";
      toast({ title: "Brisanje nije uspjelo", description: msg, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const memberFormContent = (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Ime *</Label>
          <Input value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Prezime *</Label>
          <Input value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Datum rođenja</Label>
          <Input type="date" value={form.date_of_birth} onChange={(e) => updateField("date_of_birth", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Spol</Label>
          <Select value={form.gender} onValueChange={(v) => updateField("gender", v)}>
            <SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Muško</SelectItem>
              <SelectItem value="F">Žensko</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Država</Label>
          <Input value={form.country} onChange={(e) => updateField("country", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>OIB</Label>
          <Input value={form.oib} onChange={(e) => updateField("oib", e.target.value)} maxLength={11} />
        </div>
        <div className="grid gap-2">
          <Label>Mobitel</Label>
          <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>E-mail</Label>
        <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Adresa</Label>
          <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Grad</Label>
          <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Poštanski broj</Label>
          <Input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Vrsta članstva *</Label>
          <Select value={form.membership_type} onValueChange={(v) => updateField("membership_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="redovni">Redovni</SelectItem>
              <SelectItem value="pocasni">Počasni</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Datum aktivacije *</Label>
          <Input type="date" value={form.activation_date} onChange={(e) => updateField("activation_date", e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Datum deaktivacije</Label>
          <Input type="date" value={form.deactivation_date} onChange={(e) => updateField("deactivation_date", e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Odustani</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving ? "Spremam..." : editingMember ? "Spremi izmjene" : "Dodaj člana"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Membership expiry notifications */}
      {expiringMembers.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Obavijesti o isteku članstva
            </CardTitle>
            <CardDescription>Članarine koje uskoro ističu ili su već istekle (godišnje članstvo).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringMembers.map((m) => (
                <div key={`expiry-${m.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/20 bg-background p-3">
                  <div>
                    <p className="font-medium text-foreground">{m.first_name} {m.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.email ?? "Nema email"} · {m.membership_type === "redovni" ? "Redovni" : "Počasni"}
                    </p>
                  </div>
                  <Badge variant={m.daysLeft <= 0 ? "destructive" : "secondary"}>
                    {m.daysLeft <= 0
                      ? `Isteklo prije ${Math.abs(m.daysLeft)} dana`
                      : `Ističe za ${m.daysLeft} dana (${format(m.expiryDate, "dd.MM.yyyy.")})`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Članovi Udruge
              </CardTitle>
              <CardDescription>Popis svih članova udruge s podacima o članstvu.</CardDescription>
            </div>
            {isMasterAdmin && (
              <Button onClick={openAddForm}>
                <UserPlus className="h-4 w-4" />
                Dodaj člana
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
              Učitavam članove...
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Još nema unesenih članova udruge.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime</TableHead>
                    <TableHead>Prezime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobitel</TableHead>
                    <TableHead>Grad</TableHead>
                    <TableHead>Vrsta</TableHead>
                    <TableHead>Aktivacija</TableHead>
                    <TableHead>Istek</TableHead>
                    {isMasterAdmin && <TableHead className="text-right">Akcije</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const expiryDate = addYears(new Date(member.activation_date), 1);
                    const daysLeft = differenceInDays(expiryDate, new Date());
                    const isExpired = !member.deactivation_date && daysLeft <= 0;
                    const isExpiringSoon = !member.deactivation_date && daysLeft > 0 && daysLeft <= 60;

                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium text-foreground">{member.first_name}</TableCell>
                        <TableCell className="font-medium text-foreground">{member.last_name}</TableCell>
                        <TableCell>{member.email ?? "—"}</TableCell>
                        <TableCell>{member.phone ?? "—"}</TableCell>
                        <TableCell>{member.city ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {member.membership_type === "redovni" ? "Redovni" : "Počasni"}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(member.activation_date), "dd.MM.yyyy.")}</TableCell>
                        <TableCell>
                          {member.deactivation_date ? (
                            <Badge variant="secondary">{format(new Date(member.deactivation_date), "dd.MM.yyyy.")}</Badge>
                          ) : isExpired ? (
                            <Badge variant="destructive">Isteklo</Badge>
                          ) : isExpiringSoon ? (
                            <Badge variant="secondary">{format(expiryDate, "dd.MM.yyyy.")} ({daysLeft}d)</Badge>
                          ) : (
                            <span className="text-muted-foreground">{format(expiryDate, "dd.MM.yyyy.")}</span>
                          )}
                        </TableCell>
                        {isMasterAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditForm(member)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setDeletingMember(member)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingMember(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Uredi člana" : "Dodaj novog člana"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Ažurirajte podatke o članu udruge." : "Unesite podatke o novom članu udruge."}
            </DialogDescription>
          </DialogHeader>
          {memberFormContent}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={Boolean(deletingMember)} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati člana?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMember ? `Član ${deletingMember.first_name} ${deletingMember.last_name} bit će trajno uklonjen.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Odustani</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); void handleDelete(); }}
              disabled={deleting}
            >
              {deleting ? "Brišem..." : "Obriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
