export type CartItem = {
  id: string;
  raffle_title: string;
  raffle_slug?: string;
  featured_image_url?: string | null;
  ticket_quantity: number;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
  ticket_numbers: number[];
  expires_at: string;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  expires_at: string | null;
};
