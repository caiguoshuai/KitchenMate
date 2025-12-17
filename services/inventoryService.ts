import { InventoryItem } from '../types';

let localInventory: InventoryItem[] = [
  { id: '1', name: 'Chicken Breast', amount: 500, unit: 'g', expirationDate: '2023-11-20', status: 'expiring' },
  { id: '2', name: 'Pasta', amount: 500, unit: 'g', expirationDate: '2024-05-01', status: 'normal' },
  { id: '3', name: 'Eggs', amount: 4, unit: 'pcs', expirationDate: '2023-10-01', status: 'expired' },
  { id: '4', name: 'Rice', amount: 2000, unit: 'g', expirationDate: '2024-12-01', status: 'normal' }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    await delay(300);
    return [...localInventory];
  },

  async addItems(items: InventoryItem[]): Promise<void> {
    await delay(300);
    localInventory = [...localInventory, ...items];
  },

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    await delay(200);
    const idx = localInventory.findIndex(i => i.id === id);
    if (idx >= 0) {
      localInventory[idx] = { ...localInventory[idx], ...updates };
      return localInventory[idx];
    }
    return undefined;
  },

  async deleteItem(id: string): Promise<void> {
    await delay(200);
    localInventory = localInventory.filter(i => i.id !== id);
  },

  async mergeDuplicates(): Promise<void> {
    await delay(500); // Heavier operation
    const map = new Map<string, InventoryItem>();
    localInventory.forEach(item => {
      // Key based on name and unit
      const key = item.name.trim().toLowerCase() + '::' + item.unit.trim().toLowerCase();
      if (map.has(key)) {
        const existing = map.get(key)!;
        // Merge logic: sum amount, keep EARLIEST expiration date
        const newAmount = existing.amount + item.amount;
        const newExp = existing.expirationDate < item.expirationDate ? existing.expirationDate : item.expirationDate;
        
        // Simple recalculation of status (logic duplicated from frontend helper for now)
        const getFreshnessStatus = (date: string) => {
            const today = new Date(); today.setHours(0,0,0,0);
            const exp = new Date(date);
            const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return 'expired';
            if (diffDays <= 3) return 'expiring';
            return 'normal';
        };

        map.set(key, { ...existing, amount: newAmount, expirationDate: newExp, status: getFreshnessStatus(newExp) as any });
      } else {
        map.set(key, item);
      }
    });
    localInventory = Array.from(map.values());
  },

  // Used for cooking deduction
  async batchUpdate(updatedItems: InventoryItem[]): Promise<void> {
    await delay(300);
    // In a real DB, this would be a transaction
    // Here we just replace the items in our local store
    updatedItems.forEach(newItem => {
        const idx = localInventory.findIndex(i => i.id === newItem.id);
        if (idx !== -1) {
            localInventory[idx] = newItem;
        }
    });
    // Remove items with 0 amount
    localInventory = localInventory.filter(i => i.amount > 0);
  }
};
