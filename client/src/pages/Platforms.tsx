import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle, Clock, Youtube, Instagram, Facebook, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const platformConfig = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    id: "instagram", 
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    id: "facebook",
    name: "Facebook", 
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export default function Platforms() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState({ id: 1, username: "" });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser({
          id: 1, // You can update this if you have user id logic
          username: data.username || ""
        });
        setLoadingUser(false);
      });
  }, []);

  const { data: platforms = [], refetch } = useQuery({
    queryKey: ["/api/platforms"],
  });

  const addPlatformMutation = useMutation({
    mutationFn: (data: { platformType: string; username: string; followerCount: number }) =>
      fetch("/api/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        userId: user.id,
        ...data,
        }),
      }),
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Platform added successfully! Please add the verification code to your bio.",
      });
      await refetch();
      setIsDialogOpen(false);
      setUsername("");
      setFollowerCount("");
      setSelectedPlatform(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add platform",
        variant: "destructive",
      });
    },
  });

  const handleAddPlatform = (platformType: string) => {
    setSelectedPlatform(platformType);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !username || !followerCount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    addPlatformMutation.mutate({
      platformType: selectedPlatform,
      username: username.replace('@', ''),
      followerCount: parseInt(followerCount),
    });
  };

  const getPlatformStatus = (platformType: string) => {
    const platform = platforms.find((p: any) => p.platformType === platformType);
    if (!platform) return "not_connected";
    return platform.isVerified ? "verified" : "pending";
  };

  const getPlatformData = (platformType: string) => {
    return platforms.find((p: any) => p.platformType === platformType);
  };

  if (loadingUser) return <div>Loading...</div>;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-b-3xl">
        <h1 className="text-xl font-semibold">Link Platforms</h1>
        <p className="text-blue-100">Connect your social media accounts</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Platform Cards */}
        <div className="space-y-4">
          {platformConfig.map((config) => {
            const Icon = config.icon;
            const status = getPlatformStatus(config.id);
            const platformData = getPlatformData(config.id);
            return (
              <Card key={config.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${config.bgColor}`}>
                        <Icon className={config.color} size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{config.name}</h3>
                        <p className="text-sm text-gray-600">
                          {status === "verified" ? "Connected & Verified" :
                           status === "pending" ? "Pending Verification" : "Not Connected"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {status === "verified" && (
                        <>
                          <CheckCircle className="text-success" size={20} />
                          <span className="text-sm font-medium text-success">Verified</span>
                        </>
                      )}
                      {status === "pending" && (
                        <>
                          <Clock className="text-warning" size={20} />
                          <span className="text-sm font-medium text-warning">Pending</span>
                        </>
                      )}
                      {status === "not_connected" && (
                        <Button
                          onClick={() => handleAddPlatform(config.id)}
                          size="sm"
                          className="rounded-full"
                        >
                          <Plus size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  {platformData && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">
                        Username: <span className="font-medium">@{platformData.username}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Followers: <span className="font-medium">{platformData.followerCount.toLocaleString()}</span>
                      </p>
                      {!platformData.isVerified && (
                        <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-lg">
                          <p className="text-sm text-warning font-medium mb-1">
                            Verification Code: {platformData.verificationCode}
                          </p>
                          <p className="text-xs text-gray-600">
                            Add this code to your {config.name} bio and wait for admin approval
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div>
              To verify your platform, add the verification code to your bio/description and wait for admin approval.
            </div>
          </AlertDescription>
        </Alert>
      {/* Add Platform Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Link {selectedPlatform && platformConfig.find(p => p.id === selectedPlatform)?.name}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Platform Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="@your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="followerCount">Follower Count</Label>
              <Input
                id="followerCount"
                type="number"
                placeholder="e.g., 25000"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                required
              />
            </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addPlatformMutation.isPending}>
              {addPlatformMutation.isPending ? "Adding..." : "Add Platform"}
            </Button>
                </div>
          </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
