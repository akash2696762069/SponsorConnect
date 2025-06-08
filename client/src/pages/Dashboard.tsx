import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Settings } from "lucide-react";
import SponsorshipCard from "@/components/SponsorshipCard";
import SponsorshipModal from "@/components/SponsorshipModal";
import ApplicationModal from "@/components/ApplicationModal";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [user, setUser] = useState({
    profilePhoto: "",
    username: "",
    telegramHandle: "",
    email: "",
    isAdmin: false,
    firstName: "User"
  });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser({
          profilePhoto: data.profilePhoto || "",
          username: data.username || "",
          telegramHandle: data.telegramHandle || "",
          email: data.email || "",
          isAdmin: data.isAdmin || false,
          firstName: data.username || "User"
        });
        setLoadingUser(false);
      });
  }, []);

  const [selectedSponsorship, setSelectedSponsorship] = useState(null);
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ["/api/sponsorships"],
  });

  const featuredSponsorships = sponsorships.slice(0, 2);

  const handleSponsorshipClick = (sponsorship) => {
    setSelectedSponsorship(sponsorship);
    setShowSponsorshipModal(true);
  };

  const handleApplyClick = () => {
    setShowSponsorshipModal(false);
    setShowApplicationModal(true);
  };

  if (loadingUser || isLoading) {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-b-3xl">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=3b82f6&color=fff`}
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-white object-cover"
            />
            <div>
              <h1 className="text-xl font-semibold">Welcome back, {user.username || "Creator"}!</h1>
              <p className="text-blue-100 text-sm">@{user.telegramHandle}</p>
            </div>
          </div>
          {user.isAdmin && (
            <Link href="/admin">
              <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                <Settings className="text-white" size={20} />
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Link Platform CTA */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-2xl border border-purple-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Link Your Platforms</h3>
              <p className="text-gray-600 text-sm">Connect your social accounts to unlock more opportunities</p>
            </div>
            <Link href="/platforms">
              <button className="bg-secondary text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                Link Now
              </button>
            </Link>
          </div>
        </div>

        {/* Featured Sponsorships */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Featured Sponsorships</h2>
          {featuredSponsorships.length > 0 ? (
            <div className="space-y-4">
              {featuredSponsorships.map((sponsorship) => (
                <SponsorshipCard
                  key={sponsorship.id}
                  sponsorship={sponsorship}
                  onClick={() => handleSponsorshipClick(sponsorship)}
                  showApplyButton={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No featured sponsorships available at the moment.</p>
            </div>
          )}
        </div>

        {/* Explore More Button */}
        <Link href="/sponsorships">
          <button className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <span>Explore All Sponsorships</span>
            <ArrowRight size={18} />
          </button>
        </Link>
      </div>

      {/* Modals */}
      <SponsorshipModal
        sponsorship={selectedSponsorship}
        isOpen={showSponsorshipModal}
        onClose={() => setShowSponsorshipModal(false)}
        onApply={handleApplyClick}
      />

      <ApplicationModal
        sponsorship={selectedSponsorship}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        userId={user.id}
      />
    </div>
  );
}
