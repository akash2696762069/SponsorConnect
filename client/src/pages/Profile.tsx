import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Platform, Application } from "@/lib/types";

export default function Profile() {
  const [profile, setProfile] = useState({
    id: 1, // default id, update if needed
    profilePhoto: "",
    username: "",
    telegramHandle: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          id: 1, // update if you have user id logic
          profilePhoto: data.profilePhoto || "",
          username: data.username || "",
          telegramHandle: data.telegramHandle || "",
          email: data.email || ""
        });
        setLoading(false);
      });
  }, []);

  // Always call hooks at the top level
  const { data: platforms = [] } = useQuery({
    queryKey: ["/api/platforms/user", profile.id],
    enabled: !!profile.id,
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications/user", profile.id],
    enabled: !!profile.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    setSaving(false);
    alert("Profile updated successfully!");
  };

  if (loading) return <div>Loading...</div>;

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
                src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=3b82f6&color=fff`}
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{profile.username}</h3>
                <p className="text-gray-600">@{profile.telegramHandle}</p>
                <p className="text-gray-500 text-sm">Telegram User</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profilePhoto">Profile Photo URL</Label>
                <Input
                  id="profilePhoto"
                  name="profilePhoto"
                  type="text"
                  placeholder="Profile photo URL"
                  value={profile.profilePhoto}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={profile.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="telegramHandle">Telegram Handle</Label>
                <Input
                  id="telegramHandle"
                  name="telegramHandle"
                  type="text"
                  placeholder="Telegram handle"
                  value={profile.telegramHandle}
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
                  value={profile.email}
                  onChange={handleChange}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="mt-2">
                {saving ? "Saving..." : "Save"}
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
              <div className="text-center py-4 text-gray-500">
                <p>No platforms connected yet.</p>
                <p className="text-sm">Go to Platforms section to link your social accounts.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 5).map((application) => (
                  <div 
                    key={application.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        Application #{application.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.platformType} • {application.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No applications yet.</p>
                <p className="text-sm">Apply to sponsorships to see your history here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
