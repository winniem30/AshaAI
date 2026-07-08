import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { opportunities, categories, type Opportunity } from "@/lib/mock-data";
import { Users, Activity, ShieldCheck, Search, Pencil, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — AshaAI" }] }),
  component: Admin,
});

function Admin() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Opportunity[]>(opportunities);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    name: "",
    ministry: "",
    category: "",
    deadline: "",
    benefit: "",
    benefitDetail: "",
    description: "",
    officialUrl: "",
    state: "All India",
    educationLevel: "Any",
    gender: "Any",
    incomeMax: 9999999,
    eligibility: [],
    documents: [],
    process: [],
    faqs: [],
  });

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      ministry: "",
      category: "",
      deadline: "",
      benefit: "",
      benefitDetail: "",
      description: "",
      officialUrl: "",
      state: "All India",
      educationLevel: "Any",
      gender: "Any",
      incomeMax: 9999999,
      eligibility: [],
      documents: [],
      process: [],
      faqs: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: Opportunity) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.ministry || !formData.category || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingItem) {
      setItems(items.map((item) => (item.id === editingItem.id ? { ...item, ...formData } as Opportunity : item)));
    } else {
      const newItem: Opportunity = {
        id: `custom-${Date.now()}`,
        name: formData.name!,
        ministry: formData.ministry!,
        category: formData.category!,
        deadline: formData.deadline!,
        benefit: formData.benefit || "",
        benefitDetail: formData.benefitDetail || "",
        description: formData.description || "",
        officialUrl: formData.officialUrl || "",
        state: formData.state || "All India",
        educationLevel: formData.educationLevel || "Any",
        gender: (formData.gender as "Any" | "Female" | "Male") || "Any",
        incomeMax: formData.incomeMax || 9999999,
        eligibility: formData.eligibility || [],
        documents: formData.documents || [],
        process: formData.process || [],
        faqs: formData.faqs || [],
        match: 50,
        reason: "",
      };
      setItems([...items, newItem]);
    }
    setDialogOpen(false);
  };

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("admin.admin")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("admin.console")}</h1>
          </div>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            <Plus className="size-4" /> {t("admin.addOpportunity")}
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric icon={<Users className="size-4" />} k={t("admin.activeUsers")} v="12,482" />
          <Metric icon={<Search className="size-4" />} k={t("admin.searchesToday")} v="48,210" />
          <Metric icon={<Activity className="size-4" />} k={t("admin.popularScheme")} v="PMRF" />
          <Metric icon={<ShieldCheck className="size-4" />} k={t("admin.verificationRequests")} v="2,156" />
        </div>

        <section className="rounded-3xl bg-card ring-1 ring-black/5 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-bold">{t("admin.manageOpportunities")}</h2>
            <div className="flex items-center gap-2 px-3 rounded-lg bg-muted">
              <Search className="size-4 text-muted-foreground" />
              <input 
                placeholder={t("admin.search")} 
                className="bg-transparent py-2 text-sm focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">{t("admin.scheme")}</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">{t("admin.ministryLabel")}</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">{t("admin.categoryLabel")}</th>
                <th className="text-left px-6 py-3">{t("admin.deadlineLabel")}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-6 py-4 font-semibold">{o.name}</td>
                  <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{o.ministry}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-mono uppercase tracking-wider">{o.category}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{o.deadline}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(o)} className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Edit">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(o.id)} className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground" aria-label="Delete">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? t("admin.editOpportunity") : t("admin.addNewOpportunity")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.schemeName")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.ministryField")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.categoryField")}</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">{t("admin.selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.deadlineField")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder={t("admin.deadlinePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.benefitField")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.benefit}
                onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                placeholder={t("admin.benefitPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.benefitDetailField")}</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.benefitDetail}
                onChange={(e) => setFormData({ ...formData, benefitDetail: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.descriptionField")}</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.officialUrlField")}</label>
              <input
                type="url"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                value={formData.officialUrl}
                onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                placeholder={t("admin.urlPlaceholder")}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {editingItem ? t("admin.saveChanges") : t("admin.addOpportunityBtn")}
              </Button>
              <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1">
                {t("admin.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Metric({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-black/5 p-5">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
        {icon}{k}
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{v}</p>
    </div>
  );
}