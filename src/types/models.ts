import { UserRole, OrderStatus, OrderItemStatus, TableStatus, PaymentStatus } from './enums';

/* ─── User ─── */
export interface User {
    _id: string;
    email: string;
    nickname: string;
    role: UserRole;
    restaurantId: string;
    isActive: boolean;
    googleId?: string;
    createdAt: string;
    updatedAt: string;
}

/* ─── Restaurant ─── */
export interface RestaurantSettings {
    currency: string;
    taxRate: number;
    timezone: string;
    autoPrint: boolean;
}

export interface RestaurantSubscription {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive';
    currentPeriodEnd?: string;
}

export interface Restaurant {
    _id: string;
    name: string;
    ownerId: string;
    subscription: RestaurantSubscription;
    settings: RestaurantSettings;
    createdAt: string;
    updatedAt: string;
}

/* ─── Table ─── */
export interface TablePosition {
    x: number;
    y: number;
}

export interface Table {
    _id: string;
    name: string;
    displayName: string;
    /** Short display code e.g. 'T1', 'VIP-2' */
    code?: string;
    restaurantId: string;
    capacity: number;
    status: TableStatus;
    position: TablePosition;
    rotation: number;
    section: string | null;
    /** Width in grid units (1 = CELL_SIZE_PX pixels) */
    width: number;
    /** Height in grid units (1 = CELL_SIZE_PX pixels) */
    height: number;
    shape: string;
    currentOrderId?: string;
    createdAt: string;
    updatedAt: string;
}

/* ─── Section ─── */
export interface Section {
    _id: string;
    name: string;
    /** Short display code e.g. 'H1', 'SEC-A' */
    code?: string;
    restaurantId: string;
}

/* ─── Category ─── */
export interface Category {
    _id: string;
    name: string;
    code?: string;
    restaurantId: string;
}

/* ─── Menu ─── */
export interface ModifierOption {
    name: string;
    price: number;
}

export interface Modifier {
    name: string;
    options: ModifierOption[];
}

export interface MenuItem {
    _id: string;
    restaurantId: string;
    name: string;
    code?: string;
    price: number;
    category: Category | string;
    isAvailable: boolean;
    isPopular: boolean;
    modifiers: Modifier[];
    createdAt: string;
    updatedAt: string;
}

/* ─── Order ─── */
export interface ItemModifier {
    name: string;
    option: string;
    price: number;
}

export interface OrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    modifiers: ItemModifier[];
    notes?: string;
    status: OrderItemStatus;
}

export interface Order {
    _id: string;
    orderNumber: number;
    restaurantId: string;
    tableId: string | Table;
    waiterId: string | Pick<User, '_id' | 'nickname' | 'email'>;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    servedAt?: string;
    paidAt?: string;
}

/* ─── Auth Responses ─── */
export interface AuthResponse {
    user: User;
    restaurant: Restaurant;
    accessToken: string;
    refreshToken: string;
}

/* ─── Cart (Client-only) ─── */
export interface CartItem {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    modifiers: ItemModifier[];
    notes?: string;
}
