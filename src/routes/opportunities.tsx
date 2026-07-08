import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { categories } from "@/lib/mock-data";
import { Search, Filter, ExternalLink } from "lucide-react";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";

const searchSchema = z.object({
  category: z.string().optional(),
  state: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/opportunities")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Opportunity Explorer — AshaAI" }] }),
  component: OppLayout,
});

function OppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/opportunities") return <Outlet />;
  return <Explorer />;
}

function Explorer() {
  const { t } = useLanguage();
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [category, setCategory] = useState<string>(search.category ?? "All");
  const [state, setState] = useState<string>(search.state ?? "All India");
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [appliedOpportunities, setAppliedOpportunities] = useState<Set<string>>(new Set());
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch opportunities from database
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "/api/opportunities";
        const response = await fetch(apiUrl);
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      } catch (error) {
        console.error("Failed to fetch opportunities:", error);
        // Fallback to mock data if API fails
        const { opportunities: mockOpportunities } = await import("@/lib/mock-data");
        setOpportunities(mockOpportunities);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  // Load existing applications on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const applicationKey = `applications_${user.email}`;
      const existingApplications = JSON.parse(localStorage.getItem(applicationKey) || "[]");
      setAppliedOpportunities(new Set(existingApplications));
    }
  }, []);

  const handleApply = (title: string) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Please log in to track applications");
      return;
    }

    // Save application status to localStorage
    const user = JSON.parse(userStr);
    const applicationKey = `applications_${user.email}`;
    const existingApplications = JSON.parse(localStorage.getItem(applicationKey) || "[]");

    if (!existingApplications.includes(title)) {
      existingApplications.push(title);
      localStorage.setItem(applicationKey, JSON.stringify(existingApplications));
      setAppliedOpportunities(new Set([...appliedOpportunities, title]));
      alert(`✅ Marked "${title}" as applied!`);
    } else {
      // Remove from applied list
      const updatedApplications = existingApplications.filter((app: string) => app !== title);
      localStorage.setItem(applicationKey, JSON.stringify(updatedApplications));
      setAppliedOpportunities(new Set(updatedApplications));
      alert(`ℹ️ Removed "${title}" from applied list`);
    }
  };

  const results = useMemo(() => {
    const query = q.toLowerCase();
    const filtered = opportunities.filter((item: any) => {
      const matchesQuery = 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      
      const matchesCategory = category === "All" || item.category === category;
      
      return matchesQuery && matchesCategory;
    });

    return filtered.length ? filtered : opportunities;
  }, [q, category, opportunities]);

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-10 max-w-7xl mx-auto space-y-8"
      >
        <header>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("nav.browse")}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("opportunities.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("opportunities.search")} {loading ? "..." : results.length}+ {t("opportunities.activePrograms")}</p>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">{t("opportunities.loading")}</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-card ring-1 ring-black/5 p-4 flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 rounded-xl bg-muted">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("opportunities.search")}
                  className="flex-1 bg-transparent py-3 focus:outline-none text-sm"
                />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-3 rounded-xl bg-muted text-sm font-medium">
                <option>{t("opportunities.all")}</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r: any) => (
                <motion.div
                  key={r.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOpportunity(r)}
                  className="border p-5 rounded-xl bg-card hover:ring-primary/30 hover:-translate-y-0.5 transition-all h-full cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-lg leading-tight hover:text-primary transition-colors">
                      {r.name}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap ml-2">
                      {r.category}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {r.description}
                  </p>

                  <div className="mt-3 space-y-2">
                    <p className="text-green-600 font-semibold">
                      {r.benefit}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{t("opportunities.ministry")}</span>
                      <span>{r.ministry}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{t("opportunities.deadlineLabel")}</span>
                      <span className={r.deadline === "Rolling" ? "text-green-600" : "text-orange-600"}>
                        {r.deadline}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{t("opportunities.education")}</span>
                      <span>{r.educationLevel}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <a
                      href={r.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-sm"
                    >
                      <ExternalLink className="size-4" /> {t("opportunities.applyNow")}
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(r.name);
                      }}
                      className={`inline-flex items-center gap-1 hover:underline font-medium text-sm ${
                        appliedOpportunities.has(r.name)
                          ? "text-green-600"
                          : "text-primary"
                      }`}
                    >
                      {appliedOpportunities.has(r.name) ? t("opportunities.applied") : t("opportunities.markApplied")}
                    </button>
                  </div>
                </motion.div>
              ))}
              {results.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  {t("opportunities.noResults")}
                </div>
              )}
            </div>
          </>
        )}

        {selectedOpportunity && (
          <OpportunityDialog
            item={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)}
          />
        )}
      </motion.div>
    </AppShell>
  );
}