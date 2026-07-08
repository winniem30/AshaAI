import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { notifications, opportunities } from "@/lib/mock-data";
import { Bell, AlarmClock, Sparkles, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — AshaAI" }] }),
  component: NotifPage,
});

const iconFor = {
  new: Plus,
  deadline: AlarmClock,
  update: Sparkles,
} as const;

function NotifPage() {
  const { t } = useLanguage();
  const feed = opportunities.slice(0, 5).map((o, i) => ({
    id: "f" + i,
    title: `${o.name} — ${o.category}`,
    sub: `${o.ministry} • Added ${["today", "yesterday", "2 days ago", "3 days ago", "1 week ago"][i] ?? "recently"}`,
    status: ["New", "New", "Open", "Updated", "Open"][i],
  }));

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <header>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("notifications.inbox")}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("notifications.title")}</h1>
        </header>

        <section className="rounded-3xl bg-card ring-1 ring-black/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-4 text-primary" />
            <h2 className="font-bold">{t("notifications.recent")}</h2>
          </div>
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const Icon = iconFor[n.kind];
              return (
                <li key={n.id} className="flex items-start gap-4 py-4">
                  <span className="size-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">{t("notifications.liveFeed")}</h2>
          <div className="space-y-3">
            {feed.map((f) => (
              <div key={f.id} className="rounded-2xl bg-card ring-1 ring-black/5 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.sub}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">{f.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}