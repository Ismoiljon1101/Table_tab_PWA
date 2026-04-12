/** Mirrors BE: src/libs/enums/index.ts */
export enum UserRole {
    WAITER = 'waiter',
    OWNER = 'owner',
    ADMIN = 'admin',
}

/** Mirrors BE: src/orders/schemas/order.schema.ts */
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    READY = 'ready',
    SERVED = 'served',
    CANCELLED = 'cancelled',
}

/** Mirrors BE: src/orders/schemas/order.schema.ts */
export enum OrderItemStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    READY = 'ready',
    SERVED = 'served',
    DELETED = 'deleted',
}

/** Mirrors BE: src/tables/schemas/table.schema.ts */
export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved',
}

/** Mirrors BE: src/libs/enums/index.ts */
export enum PaymentStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    REFUNDED = 'refunded',
}
