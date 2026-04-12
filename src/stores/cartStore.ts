import { create } from 'zustand';
import type { CartItem, ItemModifier, Order } from '../types';

interface CartState {
    /** The table this cart is for */
    tableId: string | null;
    /** All items currently in the cart */
    items: CartItem[];
    /** The ID of the existing order we are editing, if any */
    editingOrderId: string | null;
    /** The timestamp of the order when we loaded it, used for optimistic locking */
    baseUpdatedAt: string | null;

    /** Set which table we are taking order for */
    setTable: (tableId: string) => void;
    /** Load an existing order into the cart for editing */
    loadOrder: (order: Order) => void;
    /** Add an item to the cart */
    addItem: (item: CartItem) => void;
    /** Update quantity for an existing item */
    updateQuantity: (menuItemId: string, modifiers: ItemModifier[], quantity: number) => void;
    /** Remove an item from the cart */
    removeItem: (menuItemId: string, modifiers: ItemModifier[]) => void;
    /** Update notes for a cart item */
    updateNotes: (menuItemId: string, modifiers: ItemModifier[], notes: string) => void;
    /** Clear the entire cart */
    clearCart: () => void;
    /** Get total item count */
    totalItems: () => number;
    /** Get subtotal price */
    subtotal: () => number;
}

/**
 * Generate a unique key for a cart item based on its menuItemId + selected modifiers.
 * Two items with different modifiers should be separate cart entries.
 */
function itemKey(menuItemId: string, modifiers: ItemModifier[]): string {
    const modKey = modifiers.map((m) => `${m.name}:${m.option}`).sort().join('|');
    return `${menuItemId}__${modKey}`;
}

export const useCartStore = create<CartState>((set, get) => ({
    tableId: null,
    items: [],
    editingOrderId: null,
    baseUpdatedAt: null,

    setTable: (tableId) => set({ tableId }),

    loadOrder: (order) => {
        const cartItems: CartItem[] = order.items
            // Exclude tombstone items — they're for kitchen audit only, not editing
            .filter(item => item.status !== 'deleted' && item.quantity > 0)
            .map(item => ({
                menuItemId: item.menuItemId.toString(),
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                modifiers: item.modifiers || [],
                notes: item.notes || ''
            }));

        set({
            tableId: (order.tableId as any)._id || order.tableId.toString(),
            items: cartItems,
            editingOrderId: order._id,
            baseUpdatedAt: order.updatedAt as string || null
        });
    },

    addItem: (item) => {
        const key = itemKey(item.menuItemId, item.modifiers);
        const existing = get().items.find(
            (i) => itemKey(i.menuItemId, i.modifiers) === key,
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    itemKey(i.menuItemId, i.modifiers) === key
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i,
                ),
            });
        } else {
            set({ items: [...get().items, item] });
        }
    },

    updateQuantity: (menuItemId, modifiers, quantity) => {
        const key = itemKey(menuItemId, modifiers);
        if (quantity <= 0) {
            set({ items: get().items.filter((i) => itemKey(i.menuItemId, i.modifiers) !== key) });
        } else {
            set({
                items: get().items.map((i) =>
                    itemKey(i.menuItemId, i.modifiers) === key ? { ...i, quantity } : i,
                ),
            });
        }
    },

    removeItem: (menuItemId, modifiers) => {
        const key = itemKey(menuItemId, modifiers);
        set({ items: get().items.filter((i) => itemKey(i.menuItemId, i.modifiers) !== key) });
    },

    updateNotes: (menuItemId, modifiers, notes) => {
        const key = itemKey(menuItemId, modifiers);
        set({
            items: get().items.map((i) =>
                itemKey(i.menuItemId, i.modifiers) === key ? { ...i, notes } : i,
            ),
        });
    },

    clearCart: () => set({ tableId: null, items: [], editingOrderId: null, baseUpdatedAt: null }),

    totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

    subtotal: () =>
        get().items.reduce((sum, item) => {
            const modTotal = item.modifiers.reduce((ms, m) => ms + m.price, 0);
            return sum + (item.unitPrice + modTotal) * item.quantity;
        }, 0),
}));
