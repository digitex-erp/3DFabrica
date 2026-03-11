import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  features: PlanFeature[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₹999",
    features: [
      { text: "10 conversions per month", included: true },
      { text: "Basic 3D outputs", included: true },
      { text: "Email support", included: true },
      { text: "GLTF export", included: false },
      { text: "Blockchain certification", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    price: "₹2,499",
    isPopular: true,
    features: [
      { text: "50 conversions per month", included: true },
      { text: "Advanced 3D outputs", included: true },
      { text: "Priority support", included: true },
      { text: "GLTF export", included: true },
      { text: "Blockchain certification", included: true },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      { text: "Unlimited conversions", included: true },
      { text: "White-label solution", included: true },
      { text: "24/7 support", included: true },
      { text: "GLTF export", included: true },
      { text: "Blockchain certification", included: true },
      { text: "API access", included: true },
    ],
  },
];

const addOns = [
  {
    name: "QR Code Generation",
    price: "₹150",
    description: "Per fabric QR code generation",
  },
  {
    name: "Legacy Fabric Bulk Upload",
    price: "₹5,000",
    description: "Upload up to 50 fabrics at once",
  },
];

const PricingPlans = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 ${plan.isPopular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.isPopular && (
                <div className="flex items-center gap-1 text-primary mb-4">
                  <Star className="w-5 h-5 fill-primary" />
                  <span className="text-sm font-medium">Most Popular</span>
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-gray-600">/month</span>
                )}
              </div>
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check
                      className={`w-5 h-5 ${feature.included ? "text-green-500" : "text-gray-300"}`}
                    />
                    <span
                      className={
                        feature.included ? "text-gray-900" : "text-gray-400"
                      }
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                variant={plan.isPopular ? "default" : "outline"}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Add-ons</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {addOns.map((addon) => (
              <Card
                key={addon.name}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-medium">{addon.name}</h4>
                  <p className="text-sm text-gray-600">{addon.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{addon.price}</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
