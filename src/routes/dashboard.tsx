import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { notifications, categories, opportunities } from "@/lib/mock-data";
import { Bell, ArrowRight, TrendingUp, Briefcase, Clock, Star } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AshaAI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useLanguage();
  const [userName, setUserName] = useState("Citizen");
  const [dashboardOpportunities, setDashboardOpportunities] = useState<typeof opportunities>(() => {
    // Load recommended opportunities from localStorage if available
    const saved = localStorage.getItem("recommendedOpportunities");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { displayName?: string; email?: string };
        setUserName(parsed.displayName || parsed.email || "Citizen");
      } catch {
        setUserName("Citizen");
      }
    }

    const token = localStorage.getItem("idToken");
    if (!token) return;

    window.fetch("/api/session", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result?.authenticated && result.user) {
          setUserName(result.user.name || result.user.email || "Citizen");
        }
      })
      .catch(() => {
        /* ignore session fetch failure */
      });
  }, []);

  const top = dashboardOpportunities.length
    ? dashboardOpportunities.slice(0, 3)
    : opportunities.slice(0, 3);

  // Calculate stats
  const totalOpportunities = opportunities.length;
  const newThisWeek = Math.floor(totalOpportunities * 0.15); // Simulated
  const closingSoon = opportunities.filter(o => o.deadline !== "Rolling").length;
  const recommended = opportunities.filter(o => o.match >= 80).length;

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("dashboard.greeting")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("dashboard.welcome")}, {userName}</h1>
          </div>
          <Link
            to="/eligibility"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition"
          >
            {t("dashboard.rerunEligibility")}
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-card ring-1 ring-black/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="size-4 text-primary" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t("dashboard.total")}</p>
            </div>
            <p className="text-2xl font-bold">{totalOpportunities}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.opportunities")}</p>
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-black/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-green-600" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t("dashboard.new")}</p>
            </div>
            <p className="text-2xl font-bold">{newThisWeek}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.thisWeek")}</p>
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-black/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-4 text-orange-600" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t("dashboard.closing")}</p>
            </div>
            <p className="text-2xl font-bold">{closingSoon}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.soon")}</p>
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-black/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Star className="size-4 text-primary" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t("dashboard.recommended")}</p>
            </div>
            <p className="text-2xl font-bold">{recommended}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.forYou")}</p>
          </div>
        </div>

        {/* Score + notifs */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-card ring-1 ring-black/5 p-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-64 bg-primary/5 rounded-full blur-3xl" />
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t("dashboard.opportunityScore")}</p>
            <div className="flex items-end gap-4 mt-2">
              <span className="text-7xl font-extrabold tracking-tight text-primary">82%</span>
              <div className="flex items-center gap-1 text-success text-sm font-semibold pb-3">
                <TrendingUp className="size-4" /> {t("dashboard.thisWeekChange")}
              </div>
            </div>
            <p className="mt-2 text-muted-foreground">{t("dashboard.highMatch")}</p>
            <div className="mt-6 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[82%] bg-primary" />
            </div>
          </div>

          <div className="rounded-3xl bg-card ring-1 ring-black/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="size-4 text-primary" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t("dashboard.notifications")}</p>
            </div>
            <ul className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </li>
              ))}
            </ul>
            <Link to="/notifications" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              {t("dashboard.viewAll")} <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Recommended */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{t("dashboard.recommendedOpportunities")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("dashboard.personalized")}</p>
            </div>
            <Link to="/opportunities" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
              {t("dashboard.viewAllOpportunities")} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {top.map((o) => (
              <Link
                key={o.id}
                to="/opportunities/$id"
                params={{ id: o.id }}
                className="group block rounded-2xl bg-gradient-to-br from-card to-card/80 ring-1 ring-black/5 p-6 hover:ring-2 hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold bg-primary/5 px-2 py-1 rounded-md">{o.category}</span>
                  <span className="px-2.5 py-1 bg-gradient-to-r from-success/20 to-success/10 text-success text-[11px] font-bold rounded-full uppercase tracking-wide border border-success/20">{o.match}% match</span>
                </div>
                <h3 className="font-bold text-lg leading-snug mb-3 group-hover:text-primary transition-colors">{o.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{o.ministry}</p>
                <div className="space-y-2.5 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{t("dashboard.benefit")}</span>
                    <span className="text-xs font-semibold text-foreground">{o.benefit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{t("dashboard.deadline")}</span>
                    <span className="text-xs font-semibold text-foreground">{o.deadline}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xl font-bold mb-4">{t("dashboard.opportunityCategories")}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c}
                to="/opportunities"
                search={{ category: c }}
                className="px-4 py-2 rounded-full bg-card ring-1 ring-border text-sm font-medium hover:ring-primary/40 hover:text-primary transition"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}