import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { eligibilityProfileSchema, type EligibilityProfile, type EligibilityOpportunity } from "@/shared/types";
import { opportunities } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { EligibilityResultDialog } from "@/components/eligibility-result-dialog";
import { useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/eligibility")({
  head: () => ({ meta: [{ title: "Opportunities by Occupation — AshaAI" }] }),
  component: EligibilityPage,
});

const eligibilitySchema = eligibilityProfileSchema.extend({
  category: z.string().min(1, "Category is required"),
  occupation: z.string().min(1, "Occupation is required"),
  disabilityStatus: z.string().min(1, "Disability status is required"),
  minorityStatus: z.string().min(1, "Minority status is required"),
  farmerStatus: z.string().min(1, "Farmer status is required"),
  startupFounder: z.string().min(1, "Startup founder status is required"),
  womenEntrepreneur: z.string().min(1, "Women entrepreneur status is required"),
  ruralUrban: z.string().min(1, "Rural/Urban is required"),
  income: z.number().min(100000, "Income must be at least 6 digits"),
});

type FormValues = z.infer<typeof eligibilitySchema>;

const defaultValues: FormValues = {
  state: "Andhra Pradesh",
  age: 20,
  gender: "Male",
  income: 250000,
  education: "Undergraduate",
  category: "General",
  occupation: "Student",
  disabilityStatus: "No",
  minorityStatus: "No",
  farmerStatus: "No",
  startupFounder: "No",
  womenEntrepreneur: "No",
  ruralUrban: "Urban",
};

const stateOptions = ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", "All India"];
const genderOptions = ["Male", "Female", "Other"];
const educationOptions = ["School", "Undergraduate", "Graduate", "Postgraduate"];
const categoryOptions = ["General", "OBC", "SC", "ST", "EWS"];
const occupationOptions = ["Student", "Unemployed", "Farmer", "Entrepreneur", "Working Professional", "Homemaker"];
const disabilityStatusOptions = ["No", "Yes"];
const minorityStatusOptions = ["No", "Yes"];
const farmerStatusOptions = ["No", "Yes"];
const startupFounderOptions = ["No", "Yes"];
const womenEntrepreneurOptions = ["No", "Yes"];
const ruralUrbanOptions = ["Urban", "Rural"];

function EligibilityPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [results, setResults] = useState<typeof opportunities>([]);
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues,
    mode: "onTouched",
  });

  const handleCheckEligibility = () => {
    const values = form.getValues();
    
    // Define occupation-specific categories
    const occupationCategories: Record<string, string[]> = {
      "Student": ["Scholarships", "Education", "Internships"],
      "Farmer": ["Agriculture Schemes"],
      "Entrepreneur": ["Startup Grants", "Business Loans"],
      "Working Professional": ["Jobs", "Training Programs", "Skill Development"],
      "Homemaker": ["Women Empowerment", "Skill Development"],
      "Unemployed": ["Skill Development", "Training Programs", "Startup Grants"],
    };
    
    const relevantCategories = occupationCategories[values.occupation] || [];
    
    // Filter opportunities with detailed scoring
    const scoredSchemes = opportunities.map((scheme) => {
      let score = 0;
      const reasons: string[] = [];
      const failures: string[] = [];
      const isOccupationRelevant = relevantCategories.includes(scheme.category);
      
      // Occupation relevance bonus (20 points) - this is now a major factor
      if (isOccupationRelevant) {
        score += 20;
        reasons.push(`Matches ${values.occupation} profile`);
      }
      
      // State match (20 points)
      const stateMatch = values.state === "All India" || scheme.state === "All India" || scheme.state === values.state;
      if (stateMatch) {
        score += 20;
        reasons.push("State eligible");
      } else {
        failures.push("State not eligible");
      }
      
      // Education match (20 points)
      const educationMatch = scheme.educationLevel === "Any" || 
                            (values.education === "Undergraduate" && scheme.educationLevel === "Undergraduate") ||
                            (values.education === "Graduate" && (scheme.educationLevel === "Graduate" || scheme.educationLevel === "Undergraduate")) ||
                            (values.education === "Postgraduate" && (scheme.educationLevel === "Postgraduate" || scheme.educationLevel === "Graduate"));
      if (educationMatch) {
        score += 20;
        reasons.push("Education criteria met");
      } else {
        failures.push("Education level not eligible");
      }
      
      // Income match (15 points)
      const incomeMatch = scheme.incomeMax >= values.income;
      if (incomeMatch) {
        score += 15;
        reasons.push("Income within limit");
      } else {
        failures.push("Income exceeds limit");
      }
      
      // Gender match (10 points)
      const genderMatch = scheme.gender === "Any" || scheme.gender === values.gender;
      if (genderMatch) {
        score += 10;
        reasons.push("Gender criteria met");
      } else {
        failures.push("Gender not eligible");
      }
      
      // Age match (10 points)
      const ageMatch = values.age >= 16 && values.age <= 45;
      if (ageMatch) {
        score += 10;
        reasons.push("Age criteria met");
      } else {
        failures.push("Age not in eligible range");
      }
      
      // Women entrepreneur bonus (5 points)
      if (values.womenEntrepreneur === "Yes" && scheme.category === "Women Empowerment") {
        score += 5;
        reasons.push("Women entrepreneur bonus");
      }
      
      // Disability bonus (5 points)
      if (values.disabilityStatus === "Yes") {
        score += 5;
        reasons.push("Disability status consideration");
      }
      
      return {
        ...scheme,
        calculatedScore: score,
        reasons,
        failures,
        isEligible: score >= 50,
        isOccupationRelevant
      };
    });
    
    // Sort by score (highest first), with occupation-relevant schemes prioritized
    const sortedSchemes = scoredSchemes.sort((a, b) => {
      // First prioritize by occupation relevance
      if (a.isOccupationRelevant && !b.isOccupationRelevant) return -1;
      if (!a.isOccupationRelevant && b.isOccupationRelevant) return 1;
      // Then by score
      return b.calculatedScore - a.calculatedScore;
    });
    
    // Save to localStorage
    localStorage.setItem("eligibilityHistory", JSON.stringify({
      timestamp: new Date().toISOString(),
      profile: values,
      results: sortedSchemes
    }));
    
    // Save top recommended opportunities for dashboard
    const topRecommended = sortedSchemes.filter((s) => s.isEligible).slice(0, 5);
    localStorage.setItem("recommendedOpportunities", JSON.stringify(topRecommended));
    
    setResults(sortedSchemes);
    setShowResultDialog(true);
  };

  const errors = form.formState.errors;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-10 max-w-6xl mx-auto space-y-8"
      >
        <header>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("eligibility.aiEligibility")}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("eligibility.title")}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {t("eligibility.description")}
          </p>
        </header>

        <form onSubmit={form.handleSubmit(handleCheckEligibility)} className="rounded-3xl bg-card ring-1 ring-black/5 p-6 md:p-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.state")}</span>
              <select
                {...form.register("state")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {stateOptions.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-sm text-destructive mt-2">{errors.state.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.age")}</span>
              <Input type="number" min={16} max={100} {...form.register("age", { valueAsNumber: true })} />
              {errors.age && <p className="text-sm text-destructive mt-2">{errors.age.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.gender")}</span>
              <select
                {...form.register("gender")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
              {errors.gender && <p className="text-sm text-destructive mt-2">{errors.gender.message}</p>}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.income")}</span>
              <Input type="number" min={1} step={1000} {...form.register("income", { valueAsNumber: true })} />
              {errors.income && <p className="text-sm text-destructive mt-2">{errors.income.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.education")}</span>
              <select
                {...form.register("education")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {educationOptions.map((education) => (
                  <option key={education} value={education}>{education}</option>
                ))}
              </select>
              {errors.education && <p className="text-sm text-destructive mt-2">{errors.education.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.category")}</span>
              <select
                {...form.register("category")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-destructive mt-2">{errors.category.message}</p>}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.occupation")}</span>
              <select
                {...form.register("occupation")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {occupationOptions.map((occupation) => (
                  <option key={occupation} value={occupation}>{occupation}</option>
                ))}
              </select>
              {errors.occupation && <p className="text-sm text-destructive mt-2">{errors.occupation.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.disability")}</span>
              <select
                {...form.register("disabilityStatus")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {disabilityStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.disabilityStatus && <p className="text-sm text-destructive mt-2">{errors.disabilityStatus.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.minority")}</span>
              <select
                {...form.register("minorityStatus")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {minorityStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.minorityStatus && <p className="text-sm text-destructive mt-2">{errors.minorityStatus.message}</p>}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.farmer")}</span>
              <select
                {...form.register("farmerStatus")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {farmerStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.farmerStatus && <p className="text-sm text-destructive mt-2">{errors.farmerStatus.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.startup")}</span>
              <select
                {...form.register("startupFounder")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {startupFounderOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.startupFounder && <p className="text-sm text-destructive mt-2">{errors.startupFounder.message}</p>}
            </label>

            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.women")}</span>
              <select
                {...form.register("womenEntrepreneur")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {womenEntrepreneurOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.womenEntrepreneur && <p className="text-sm text-destructive mt-2">{errors.womenEntrepreneur.message}</p>}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.rural")}</span>
              <select
                {...form.register("ruralUrban")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {ruralUrbanOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.ruralUrban && <p className="text-sm text-destructive mt-2">{errors.ruralUrban.message}</p>}
            </label>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">{t("eligibility.required")}</p>
            <Button type="submit">
              {t("eligibility.check")}
            </Button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="mt-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4">{t("eligibility.matches")} ({results.length})</h2>
            
            {/* Occupation-relevant opportunities */}
            {results.filter((r: any) => r.isOccupationRelevant).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("eligibility.bestMatches")}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.filter((r: any) => r.isOccupationRelevant).map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border-2 border-primary bg-card p-6 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() =>
                        navigate({
                          to: "/opportunities/$id",
                          params: { id: item.id },
                        })
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{item.category}</p>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{t("eligibility.perfectMatch")}</span>
                          </div>
                          <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
                        </div>
                        <div className={`rounded-full px-4 py-2 text-sm font-semibold ${item.calculatedScore >= 80 ? 'bg-green-100 text-green-700' : item.calculatedScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {item.calculatedScore}% {t("eligibility.match")}
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-muted-foreground leading-6">{item.description}</p>

                      <div className="mt-3 space-y-2">
                        <p className="text-green-600 font-semibold">{item.benefit}</p>
                        <p className="text-sm text-muted-foreground">{item.benefitDetail}</p>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("eligibility.deadlineLabel")}</p>
                        <p className={`text-sm font-semibold ${item.deadline === 'Rolling' ? 'text-green-600' : 'text-orange-600'}`}>
                          {item.deadline}
                        </p>
                      </div>

                      {item.isEligible && item.reasons.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-xl">
                          <p className="text-xs font-mono uppercase tracking-widest text-green-700 mb-2">{t("eligibility.whyEligible")}</p>
                          <ul className="space-y-1">
                            {item.reasons.map((reason: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                                ✓ {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!item.isEligible && item.failures.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 rounded-xl">
                          <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-2">{t("eligibility.whyNot")}</p>
                          <ul className="space-y-1">
                            {item.failures.map((failure: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                                ✗ {failure}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.documents")}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.documents.map((doc: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-muted rounded-full text-xs">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({
                              to: "/opportunities/$id",
                              params: { id: item.id },
                            });
                          }}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold"
                        >
                          {t("opportunities.view")}
                        </button>
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background"
                        >
                          {t("opportunities.apply")}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other opportunities */}
            {results.filter((r: any) => !r.isOccupationRelevant).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground">{t("eligibility.other")}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.filter((r: any) => !r.isOccupationRelevant).map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-border bg-card p-6 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() =>
                        navigate({
                          to: "/opportunities/$id",
                          params: { id: item.id },
                        })
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{item.category}</p>
                          <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
                        </div>
                        <div className={`rounded-full px-4 py-2 text-sm font-semibold ${item.calculatedScore >= 80 ? 'bg-green-100 text-green-700' : item.calculatedScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {item.calculatedScore}% {t("eligibility.match")}
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-muted-foreground leading-6">{item.description}</p>

                      <div className="mt-3 space-y-2">
                        <p className="text-green-600 font-semibold">{item.benefit}</p>
                        <p className="text-sm text-muted-foreground">{item.benefitDetail}</p>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("eligibility.deadlineLabel")}</p>
                        <p className={`text-sm font-semibold ${item.deadline === 'Rolling' ? 'text-green-600' : 'text-orange-600'}`}>
                          {item.deadline}
                        </p>
                      </div>

                      {item.isEligible && item.reasons.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-xl">
                          <p className="text-xs font-mono uppercase tracking-widest text-green-700 mb-2">{t("eligibility.whyEligible")}</p>
                          <ul className="space-y-1">
                            {item.reasons.map((reason: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                                ✓ {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!item.isEligible && item.failures.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 rounded-xl">
                          <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-2">{t("eligibility.whyNot")}</p>
                          <ul className="space-y-1">
                            {item.failures.map((failure: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                                ✗ {failure}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("eligibility.documents")}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.documents.map((doc: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-muted rounded-full text-xs">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({
                              to: "/opportunities/$id",
                              params: { id: item.id },
                            });
                          }}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold"
                        >
                          {t("opportunities.view")}
                        </button>
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background"
                        >
                          {t("opportunities.apply")}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <EligibilityResultDialog
          open={showResultDialog}
          onClose={() => setShowResultDialog(false)}
          results={results}
        />
      </motion.div>
    </AppShell>
  );
}
