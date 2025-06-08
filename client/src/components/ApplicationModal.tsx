import { useState } from "react";
import { X, Youtube, Instagram, Facebook } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Sponsorship } from "@/lib/types";

interface ApplicationModalProps {
  sponsorship: Sponsorship | null;
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

const platforms = [
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-500" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
];

const categories = [
  "Fitness & Health",
  "Technology", 
  "Beauty & Fashion",
  "Food & Lifestyle",
  "Entertainment",
  "Education",
  "Travel"
];

export default function ApplicationModal({ 
  sponsorship, 
  isOpen, 
  onClose, 
  userId 
}: ApplicationModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorship || !selectedPlatform || !username || !followerCount || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        userId,
        sponsorshipId: sponsorship.id,
          platform: selectedPlatform,
          username,
        followerCount: parseInt(followerCount),
        category,
        message: message || null,
        })
      });

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
      onClose();
      setSelectedPlatform("");
      setUsername("");
      setFollowerCount("");
      setCategory("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sponsorship) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Apply for Sponsorship
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Choose Platform *</Label>
            <RadioGroup 
              value={selectedPlatform} 
              onValueChange={setSelectedPlatform}
              className="mt-2"
            >
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div 
                    key={platform.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                  >
                    <RadioGroupItem value={platform.id} id={platform.id} />
                    <Icon className={`${platform.color}`} size={20} />
                    <Label htmlFor={platform.id} className="cursor-pointer">
                      {platform.name}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Platform Username */}
          <div>
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Platform Username *
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="@your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* Follower Count */}
          <div>
            <Label htmlFor="followerCount" className="text-sm font-medium text-gray-700">
              Follower Count *
            </Label>
            <Input
              id="followerCount"
              type="number"
              placeholder="e.g., 25000"
              value={followerCount}
              onChange={(e) => setFollowerCount(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* Content Category */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Content Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Why should we choose you? (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your content style and audience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 h-20 resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
