interface PaymentItem {
  id: string;
  name: string;
  amount: number;
}

interface PaymentOptions {
  items: PaymentItem[];
  addons?: {
    qrCode?: boolean;
    bulkUpload?: boolean;
  };
}

export const calculateTotal = (options: PaymentOptions): number => {
  const baseAmount = options.items.reduce((sum, item) => sum + item.amount, 0);
  let addonAmount = 0;

  if (options.addons?.qrCode) {
    addonAmount += 150 * options.items.length; // ₹150 per fabric
  }

  if (options.addons?.bulkUpload) {
    addonAmount += 5000; // ₹5000 flat fee
  }

  return baseAmount + addonAmount;
};

export const initializePayment = async (options: PaymentOptions) => {
  const total = calculateTotal(options);

  // This would normally integrate with Razorpay/Stripe
  // For now, we'll simulate the payment flow
  console.log(`Initializing payment for ₹${total}`);

  return {
    success: true,
    transactionId: `tr_${Date.now()}`,
    amount: total,
  };
};
