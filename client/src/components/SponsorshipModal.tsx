import { format } from "date-fns";
import { X, Users, Clock, Tag, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Sponsorship } from "@/lib/types";

interface SponsorshipModalProps {
  sponsorship: Sponsorship | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function SponsorshipModal({ 
  sponsorship, 
  isOpen, 
  onClose, 
  onApply 
}: SponsorshipModalProps) {
  if (!sponsorship) return null;

  const daysLeft = Math.ceil(
    (new Date(sponsorship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const budgetRange = `₹${(sponsorship.budgetMin / 1000).toFixed(0)}K-${(sponsorship.budgetMax / 1000).toFixed(0)}K`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Sponsorship Details
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {sponsorship.bannerImage && (
            <img 
              src={sponsorship.bannerImage} 
              alt={sponsorship.title}
              className="w-full h-32 object-cover rounded-xl"
            />
          )}
          
          <h3 className="font-semibold text-gray-800 text-lg">
            {sponsorship.title}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {sponsorship.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Budget Range:</span>
              <span className="text-sm font-medium text-success">{budgetRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Min. Followers:</span>
              <span className="text-sm font-medium">
                {(sponsorship.minFollowers / 1000).toFixed(0)}K+
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="text-sm font-medium">{sponsorship.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Deadline:</span>
              <span className={`text-sm font-medium ${daysLeft <= 3 ? 'text-error' : 'text-warning'}`}>
                {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onApply}
          disabled={daysLeft <= 0}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {daysLeft <= 0 ? "Application Closed" : "Apply Now"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
