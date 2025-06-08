import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SponsorshipCard from "@/components/SponsorshipCard";
import SponsorshipModal from "@/components/SponsorshipModal";
import ApplicationModal from "@/components/ApplicationModal";

const categories = ["All", "Tech", "Beauty", "Fitness", "Food", "Fashion", "Education"];

export default function Sponsorships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSponsorship, setSelectedSponsorship] = useState(null);
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [user, setUser] = useState({ id: 1, username: "", telegramHandle: "" });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser({
          id: 1, // You can update this if you have user id logic
          username: data.username || "",
          telegramHandle: data.telegramHandle || ""
        });
        setLoadingUser(false);
      });
  }, []);

  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ["/api/sponsorships"],
  });

  const filteredSponsorships = sponsorships.filter((sponsorship) => {
    const matchesSearch = sponsorship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sponsorship.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
                           sponsorship.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleSponsorshipClick = (sponsorship) => {
    setSelectedSponsorship(sponsorship);
    setShowSponsorshipModal(true);
  };

  const handleApplyClick = () => {
    setShowSponsorshipModal(false);
    setShowApplicationModal(true);
  };

  if (loadingUser) return <div>Loading...</div>;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-b-3xl">
        <h1 className="text-xl font-semibold">All Sponsorships</h1>
        <p className="text-blue-100">Find the perfect collaboration opportunity</p>
      </div>

      <div className="p-6">
        {/* Search & Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search sponsorships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tags */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Sponsorship Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-32 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSponsorships.length > 0 ? (
          <div className="space-y-4">
            {filteredSponsorships.map((sponsorship) => (
              <SponsorshipCard
                key={sponsorship.id}
                sponsorship={sponsorship}
                onClick={() => handleSponsorshipClick(sponsorship)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No sponsorships found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
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
        backendApplyEndpoint={true}
      />
    </div>
  );
}
