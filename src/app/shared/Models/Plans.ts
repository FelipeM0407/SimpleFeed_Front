export interface PricingRule {
    item: string;
    unitSize: number;
    price: number;
    discountedPrice: number | null;
}

export interface Plan {
    id: number;
    name: string;
    maxForms: number | null;
    maxResponses: number | null;
    basePrice: number;
    aiReportsPerForm: number | null;
    aiReportsDiscount: boolean;
    unlimitedResponses: boolean;
    planType: string;
    pricing: PricingRule[];
}
