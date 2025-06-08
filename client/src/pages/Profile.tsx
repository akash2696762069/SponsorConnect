import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Platform, Application } from "@/lib/types";

export default function Profile({ user: initialUser }: { user: User }) {
  const [profile, setProfile] = useState<User>(initialUser);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for profile update (existing logic, but now using the prop user and apiRequest)
  const updateProfileMutation = useMutation({
    mutationFn: (updatedData: Partial<User>) =>
      apiRequest("PATCH", `/api/user/${profile.id}`, updatedData),
    onSuccess: (response) => {
      response.json().then((updatedUser) => {
        setProfile((prev) => ({ ...prev, ...updatedUser }));
        queryClient.invalidateQueries({ queryKey: ["/api/user", profile.id] });
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
        });
      });
      setSaving(false);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
    },
  });

  const handleSave = () => {
    setSaving(true);
    updateProfileMutation.mutate({
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      // profilePhoto will be updated via a separate mutation
    });
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      return apiRequest("POST", "/api/upload/profile-photo", formData, true); // true for multipart/form-data
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        const newPhotoUrl = data.profilePhotoUrl; // Assuming backend returns this
        setProfile((prev) => ({ ...prev, profilePhoto: newPhotoUrl })); // Update local state
        updateProfileMutation.mutate({ profilePhoto: newPhotoUrl }); // Update profile in DB as well
        toast({
          title: "Profile Photo Uploaded",
          description: "Your profile picture has been updated.",
        });
      });
    },
    onError: (error) => {
      console.error("Failed to upload profile photo:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  // Fetch platforms and applications using the user prop
  const { data: platforms = [] } = useQuery({
    queryKey: ["/api/platforms/user", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
        const res = await apiRequest("GET", `/api/platforms/user/${profile.id}`);
        return res.json();
    }
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications/user", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
        const res = await apiRequest("GET", `/api/applications/user/${profile.id}`);
        return res.json();
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
    }
  };

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case "youtube":
        return "🎥";
      case "instagram":
        return "📷";
      case "facebook":
        return "📘";
      default:
        return "🔗";
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-b-3xl">
        <h1 className="text-xl font-semibold">My Profile</h1>
        <p className="text-blue-100">Manage your account information</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || profile.firstName)}&background=3b82f6&color=fff`}
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadButtonClick}
                disabled={uploadPhotoMutation.isPending}
              >
                {uploadPhotoMutation.isPending ? "Uploading..." : "Change Photo"}
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" // Hide the default file input
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={profile.username || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={profile.firstName || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={profile.lastName || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                  name="email"
                    type="email"
                    placeholder="your.email@example.com"
                  value={profile.email || ""}
                  onChange={handleChange}
                />
              </div>
              <Button onClick={handleSave} disabled={saving || updateProfileMutation.isPending} className="mt-2">
                {saving || updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connected Platforms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            {platforms.length > 0 ? (
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div 
                    key={platform.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlatformIcon(platform.platformType)}</span>
                      <div>
                        <p className="font-medium text-gray-800 capitalize">
                          {platform.platformType}
                        </p>
                        <p className="text-sm text-gray-600">@{platform.username}</p>
                        <p className="text-xs text-gray-500">
                          {platform.followerCount.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {platform.isVerified ? (
                        <div className="flex items-center text-success">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium ml-1">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-warning">
                          <Clock size={16} />
                          <span className="text-sm font-medium ml-1">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No platforms connected yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div 
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{app.platformType} - {app.platformUsername}</p>
                      <p className="text-sm text-gray-600">{app.category} ({app.followerCount.toLocaleString()} followers)</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No applications submitted yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
