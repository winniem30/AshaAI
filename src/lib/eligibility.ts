import { getOpportunities } from "./opportunities";
import { generateContent, extractJsonFromText } from "./gemini";
import type { VerifiedUser } from "./auth";

export interface UserProfile {
  state: string;
  age: number;
  gender: string;
  income: number;
  education: string;
  category: string;
  occupation: string;
  disability: string;
  minority: string;
  farmer: string;
  startup: string;
  women: string;
  rural: string;
}

export interface EligibilityResult {
  matches: Array<{
    opportunity: any;
    matchPercentage: number;
    whyEligible: string[];
    whyNotEligible: string[];
    documents: string[];
  }>;
  aiAnalysis?: string;
}

export async function analyzeEligibility(profile: UserProfile, userId?: string): Promise<EligibilityResult> {
  try {
    const opportunities = await getOpportunities();
    
    // Simple eligibility matching logic
    const matches = opportunities.map(opp => {
      let matchScore = 0;
      const whyEligible: string[] = [];
      const whyNotEligible: string[] = [];
      
      // Basic matching logic (simplified)
      if (opp.state === profile.state || opp.state === "All India") {
        matchScore += 20;
        whyEligible.push("State matches");
      } else {
        whyNotEligible.push("State does not match");
      }
      
      if (opp.educationLevel && profile.education.includes(opp.educationLevel)) {
        matchScore += 30;
        whyEligible.push("Education level matches");
      }
      
      // Add more matching logic as needed
      
      return {
        opportunity: opp,
        matchPercentage: Math.min(matchScore, 100),
        whyEligible,
        whyNotEligible,
        documents: opp.documents || [],
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 10);
    
    // Try to get AI analysis if Gemini is configured
    let aiAnalysis;
    try {
      const prompt = `Analyze this user profile for government scheme eligibility:\n${JSON.stringify(profile, null, 2)}\n\nProvide a brief summary of what types of schemes they might qualify for.`;
      aiAnalysis = await generateContent(prompt);
    } catch (error) {
      console.warn("AI analysis failed:", error);
    }
    
    return { matches, aiAnalysis };
  } catch (error) {
    console.error("Failed to analyze eligibility:", error);
    return { matches: [] };
  }
}
