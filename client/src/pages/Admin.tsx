import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [isCreateSponsorshipOpen, setIsCreateSponsorshipOpen] = useState(false);
  const [sponsorshipForm, setSponsorshipForm] = useState({
    title: "",
    description: "",
    bannerImage: "",
    budgetMin: "",
    budgetMax: "",
    minFollowers: "",
    category: "",
    deadline: "",
  });
  const { toast } = useToast();
  const [user, setUser] = useState({ isAdmin: false });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser({
          isAdmin: data.isAdmin || false
        });
        setLoadingUser(false);
      });
  }, []);

  const { data: sponsorships = [], refetch: refetchSponsorships } = useQuery({
    queryKey: ["/api/sponsorships"],
  });
  const { data: pendingPlatforms = [], refetch: refetchPlatforms } = useQuery({
    queryKey: ["/api/platforms/pending"],
  });
  const { data: pendingApplications = [], refetch: refetchApplications } = useQuery({
    queryKey: ["/api/applications/pending"],
  });

  const createSponsorshipMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Sponsorship created successfully!",
      });
      await refetchSponsorships();
      setIsCreateSponsorshipOpen(false);
      setSponsorshipForm({
        title: "",
        description: "",
        bannerImage: "",
        budgetMin: "",
        budgetMax: "",
        minFollowers: "",
        category: "",
        deadline: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create sponsorship",
        variant: "destructive",
      });
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      fetch(`/api/platforms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Platform updated successfully!",
      });
      await refetchPlatforms();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update platform",
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Application updated successfully!",
      });
      await refetchApplications();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    },
  });

  const handleCreateSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorshipForm.title || !sponsorshipForm.description || !sponsorshipForm.budgetMin || 
        !sponsorshipForm.budgetMax || !sponsorshipForm.minFollowers || !sponsorshipForm.category || 
        !sponsorshipForm.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createSponsorshipMutation.mutate({
      title: sponsorshipForm.title,
      description: sponsorshipForm.description,
      bannerImage: sponsorshipForm.bannerImage || null,
      budgetMin: parseInt(sponsorshipForm.budgetMin),
      budgetMax: parseInt(sponsorshipForm.budgetMax),
      minFollowers: parseInt(sponsorshipForm.minFollowers),
      category: sponsorshipForm.category,
      deadline: new Date(sponsorshipForm.deadline),
      isActive: true,
    });
  };

  const handlePlatformApproval = (id: number, approved: boolean) => {
    updatePlatformMutation.mutate({
      id,
      updates: { isVerified: approved },
    });
  };

  const handleApplicationApproval = (id: number, approved: boolean) => {
    updateApplicationMutation.mutate({
      id,
      updates: { status: approved ? "approved" : "rejected" },
    });
  };

  if (loadingUser) return <div>Loading...</div>;
  if (!user.isAdmin) {
    return (
      <div className="pb-20">
        <div className="p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-secondary text-white p-6 rounded-b-3xl">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <p className="text-red-100">Manage sponsorships and creators</p>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="pt-4">
              <h4 className="text-2xl font-bold text-primary">{sponsorships.length}</h4>
              <p className="text-sm text-gray-600">Active Sponsorships</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <h4 className="text-2xl font-bold text-secondary">{pendingApplications.length}</h4>
              <p className="text-sm text-gray-600">Pending Applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="sponsorships" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          {/* Sponsorships Tab */}
          <TabsContent value="sponsorships" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Manage Sponsorships</h3>
              <Button onClick={() => setIsCreateSponsorshipOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Sponsorship
              </Button>
            </div>

            <div className="space-y-3">
              {sponsorships.map((sponsorship) => (
                <Card key={sponsorship.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{sponsorship.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{sponsorship.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Budget: ₹{(sponsorship.budgetMin / 1000).toFixed(0)}K-{(sponsorship.budgetMax / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <Badge variant={sponsorship.isActive ? "default" : "secondary"}>
                        {sponsorship.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4">
            <h3 className="text-lg font-semibold">Platform Verifications</h3>
            
            {pendingPlatforms.length > 0 ? (
              <div className="space-y-3">
                {pendingPlatforms.map((platform) => (
                  <Card key={platform.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800 capitalize">
                            {platform.platformType} - @{platform.username}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {platform.followerCount.toLocaleString()} followers
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Verification Code: {platform.verificationCode}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlatformApproval(platform.id, false)}
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePlatformApproval(platform.id, true)}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending platform verifications.</p>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <h3 className="text-lg font-semibold">Sponsorship Applications</h3>
            
            {pendingApplications.length > 0 ? (
              <div className="space-y-3">
                {pendingApplications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            Application #{application.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Platform: {application.platformType} (@{application.platformUsername})
                          </p>
                          <p className="text-sm text-gray-600">
                            Category: {application.category}
                          </p>
                          <p className="text-sm text-gray-600">
                            Followers: {application.followerCount.toLocaleString()}
                          </p>
                          {application.message && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{application.message}"
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationApproval(application.id, false)}
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApplicationApproval(application.id, true)}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending applications.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Sponsorship Dialog */}
      <Dialog open={isCreateSponsorshipOpen} onOpenChange={setIsCreateSponsorshipOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Sponsorship</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateSponsorship} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={sponsorshipForm.title}
                onChange={(e) => setSponsorshipForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Sponsorship title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={sponsorshipForm.description}
                onChange={(e) => setSponsorshipForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the sponsorship"
                className="h-20"
                required
              />
            </div>

            <div>
              <Label htmlFor="bannerImage">Banner Image URL</Label>
              <Input
                id="bannerImage"
                value={sponsorshipForm.bannerImage}
                onChange={(e) => setSponsorshipForm(prev => ({ ...prev, bannerImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin">Min Budget (₹) *</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  value={sponsorshipForm.budgetMin}
                  onChange={(e) => setSponsorshipForm(prev => ({ ...prev, budgetMin: e.target.value }))}
                  placeholder="15000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="budgetMax">Max Budget (₹) *</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  value={sponsorshipForm.budgetMax}
                  onChange={(e) => setSponsorshipForm(prev => ({ ...prev, budgetMax: e.target.value }))}
                  placeholder="30000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="minFollowers">Min Followers *</Label>
              <Input
                id="minFollowers"
                type="number"
                value={sponsorshipForm.minFollowers}
                onChange={(e) => setSponsorshipForm(prev => ({ ...prev, minFollowers: e.target.value }))}
                placeholder="10000"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={sponsorshipForm.category}
                onChange={(e) => setSponsorshipForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Technology, Beauty, Fitness"
                required
              />
            </div>

            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={sponsorshipForm.deadline}
                onChange={(e) => setSponsorshipForm(prev => ({ ...prev, deadline: e.target.value }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createSponsorshipMutation.isPending}
            >
              {createSponsorshipMutation.isPending ? "Creating..." : "Create Sponsorship"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
