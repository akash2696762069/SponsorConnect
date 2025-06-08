import { format } from "date-fns";
import { Users, Clock } from "lucide-react";
import type { Sponsorship } from "@/lib/types";

interface SponsorshipCardProps {
  sponsorship: Sponsorship;
  onClick: () => void;
  showApplyButton?: boolean;
}

export default function SponsorshipCard({ 
  sponsorship, 
  onClick, 
  showApplyButton = true 
}: SponsorshipCardProps) {
  const daysLeft = Math.ceil(
    (new Date(sponsorship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const budgetRange = `₹${(sponsorship.budgetMin / 1000).toFixed(0)}K-${(sponsorship.budgetMax / 1000).toFixed(0)}K`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {sponsorship.bannerImage && (
        <img 
          src={sponsorship.bannerImage} 
          alt={sponsorship.title}
          className="w-full h-32 sm:h-40 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
            {sponsorship.title}
          </h3>
          <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
            {budgetRange}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {sponsorship.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{(sponsorship.minFollowers / 1000).toFixed(0)}K+ followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{daysLeft > 0 ? `${daysLeft} days left` : "Expired"}</span>
            </div>
          </div>
        </div>
        
        {showApplyButton && (
          <button 
            onClick={onClick}
            className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            View Details & Apply
          </button>
        )}
      </div>
    </div>
  );
}
