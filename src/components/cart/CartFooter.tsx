import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface CartFooterProps {
  selectedCount?: number;
  totalAmount?: number;
  onCheckout?: () => void;
}

const CartFooter = ({
  selectedCount = 0,
  totalAmount = 0,
  onCheckout = () => {},
}: CartFooterProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShoppingCart className="w-5 h-5" />
          <div>
            <span className="font-medium">{selectedCount} images selected</span>
            <span className="text-gray-600 ml-2">× ₹1000 = ₹{totalAmount}</span>
          </div>
        </div>
        <Button onClick={onCheckout} size="lg">
          Proceed to Pay
        </Button>
      </div>
    </div>
  );
};

export default CartFooter;
