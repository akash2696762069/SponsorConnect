import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, CreditCard, Smartphone, QrCode, Edit, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const paymentTypes = [
  {
    id: "bank",
    name: "Bank Account",
    icon: CreditCard,
    description: "Add account number and IFSC",
  },
  {
    id: "upi_number",
    name: "UPI Number", 
    icon: Smartphone,
    description: "Link mobile number for UPI",
  },
  {
    id: "upi_id",
    name: "UPI ID",
    icon: QrCode,
    description: "Add your UPI ID",
  },
];

export default function Payment() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    upiNumber: "", 
    upiId: "",
  });
  const { toast } = useToast();
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

  const { data: paymentMethods = [], refetch } = useQuery({
    queryKey: ["/api/payment-methods"],
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/payment-methods", {
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
        description: "Payment method added successfully!",
      });
      await refetch();
      setIsDialogOpen(false);
      setFormData({
        accountNumber: "",
        ifscCode: "",
        upiNumber: "",
        upiId: "",
      });
      setSelectedType("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  const handleAddPaymentMethod = (type: string) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let paymentData: any = { type: selectedType };
    if (selectedType === "bank") {
      if (!formData.accountNumber || !formData.ifscCode) {
        toast({
          title: "Error",
          description: "Please fill in all bank details",
          variant: "destructive",
        });
        return;
      }
      paymentData.accountNumber = formData.accountNumber;
      paymentData.ifscCode = formData.ifscCode;
    } else if (selectedType === "upi_number") {
      if (!formData.upiNumber) {
        toast({
          title: "Error", 
          description: "Please enter UPI number",
          variant: "destructive",
        });
        return;
      }
      paymentData.upiNumber = formData.upiNumber;
    } else if (selectedType === "upi_id") {
      if (!formData.upiId) {
        toast({
          title: "Error",
          description: "Please enter UPI ID", 
          variant: "destructive",
        });
        return;
      }
      paymentData.upiId = formData.upiId;
    }
    addPaymentMethodMutation.mutate(paymentData);
  };

  const getPaymentMethodDisplay = (method: any) => {
    switch (method.type) {
      case "bank":
        return `****${method.accountNumber?.slice(-4)} - ${method.ifscCode}`;
      case "upi_number":
        return `+91-****-${method.upiNumber?.slice(-4)}`;
      case "upi_id":
        return method.upiId;
      default:
        return "Unknown method";
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    const config = paymentTypes.find(pt => pt.id === type);
    return config ? config.icon : CreditCard;
  };

  if (loadingUser) return <div>Loading...</div>;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-b-3xl">
        <h1 className="text-xl font-semibold">Payment Methods</h1>
        <p className="text-blue-100">Manage your payment information</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Current Payment Methods */}
        {paymentMethods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.filter((m: any) => m.userId === user.id).map((method: any) => {
                const Icon = getPaymentMethodIcon(method.type);
                return (
                  <div 
                    key={method.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="text-primary" size={20} />
                        <div>
                          <p className="font-medium text-gray-800">
                            {paymentTypes.find(pt => pt.id === method.type)?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getPaymentMethodDisplay(method)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
        {/* Add New Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {paymentTypes.map((type) => (
                <Button
                  key={type.id}
                  variant="outline"
                  className="flex items-center space-x-2 justify-start"
                  onClick={() => handleAddPaymentMethod(type.id)}
                >
                  <type.icon className="mr-2" size={18} />
                  <span>{type.name}</span>
                </Button>
              ))}
                  </div>
          </CardContent>
        </Card>
      {/* Add Payment Method Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Add {paymentTypes.find(pt => pt.id === selectedType)?.name}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedType === "bank" && (
              <>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                        placeholder="Account Number"
                    value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    type="text"
                        placeholder="IFSC Code"
                    value={formData.ifscCode}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            {selectedType === "upi_number" && (
              <div>
                    <Label htmlFor="upiNumber">UPI Number</Label>
                <Input
                  id="upiNumber"
                      type="text"
                      placeholder="UPI Number"
                  value={formData.upiNumber}
                      onChange={(e) => setFormData({ ...formData, upiNumber: e.target.value })}
                  required
                />
              </div>
            )}
            {selectedType === "upi_id" && (
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                      placeholder="UPI ID"
                  value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  required
                />
              </div>
            )}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addPaymentMethodMutation.isPending}>
                    {addPaymentMethodMutation.isPending ? "Adding..." : "Add"}
            </Button>
                </div>
          </form>
            </div>
          </div>
        )}
        {/* Security Note */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment information is securely stored and only visible to you and the admin.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
