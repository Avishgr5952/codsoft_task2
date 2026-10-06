import { Role, OrderStatus, PaymentStatus, PaymentMethod, TableStatus, ReservationStatus } from '@prisma/client';

export type { Role, OrderStatus, PaymentStatus, PaymentMethod, TableStatus, ReservationStatus };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
}

export interface MenuItemWithCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CartItemType {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string | null;
  notes?: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    menuItemId?: string | null;
    itemName: string;
    itemPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  payment?: {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionRef?: string | null;
    paidAt?: string | null;
  } | null;
}
