import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User, FileText, Globe, CheckCircle } from "lucide-react";
import type { Opportunity } from "@/lib/mock-data";

interface OpportunityDialogProps {
  item: Opportunity;
  onClose: () => void;
}

export function OpportunityDialog({ item, onClose }: OpportunityDialogProps) {
  const handleNotify = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Please log in to receive notifications");
      return;
    }
    const user = JSON.parse(userStr);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api/send-email";
      const response = await window.fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          message: `New opportunity available: ${item.name}`,
        }),
      });
      if (response.ok) {
        alert("Notification sent to your email!");
      } else {
        const error = await response.json();
        alert("Failed to send notification: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Email notification error:", error);
      alert("Failed to send notification. Please check if backend server is running.");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Ministry and Category */}
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Ministry</p>
              <p className="font-semibold">{item.ministry}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Category</p>
              <p className="font-semibold">{item.category}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Description</p>
            <p className="text-sm leading-6">{item.description}</p>
          </div>

          {/* Benefits */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Benefits</p>
            <p className="text-green-600 font-semibold text-lg">{item.benefit}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.benefitDetail}</p>
          </div>

          {/* Eligibility */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <User className="size-4" />
              Who can apply
            </p>
            <ul className="space-y-2">
              {item.eligibility.map((elig, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="size-4 text-primary mt-0.5 shrink-0" />
                  <span>{elig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Documents */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="size-4" />
              Required documents
            </p>
            <div className="flex flex-wrap gap-2">
              {item.documents.map((doc, idx) => (
                <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm">
                  {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Calendar className="size-4" />
              Last date
            </p>
            <p className="font-semibold">{item.deadline}</p>
          </div>

          {/* Official Website */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Globe className="size-4" />
              Official website
            </p>
            <a
              href={item.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              {item.officialUrl}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleNotify}
              variant="outline"
              className="flex-1"
            >
              🔔 Notify Me
            </Button>
            <Button
              asChild
              className="flex-1"
            >
              <a
                href={item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="size-4" />
                Apply Now
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
