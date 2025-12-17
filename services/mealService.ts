import { MealSlot, MealItem } from '../types';

let localSlots: MealSlot[] = [
  { 
    id: '101', 
    date: new Date().toISOString().split('T')[0], 
    type: 'dinner', 
    items: [
      { id: 'item1', recipeId: '1', multiplier: 2 },
      { id: 'item2', recipeId: '3', multiplier: 2 }
    ] 
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mealService = {
  async getSlots(startDate?: string, endDate?: string): Promise<MealSlot[]> {
    await delay(300);
    return [...localSlots];
  },

  async addItem(date: string, type: 'breakfast'|'lunch'|'dinner', recipeId: string, multiplier: number): Promise<void> {
    await delay(300);
    const existingIdx = localSlots.findIndex(s => s.date === date && s.type === type);
    const newItem: MealItem = { id: Math.random().toString(), recipeId, multiplier };
    
    if (existingIdx >= 0) {
      localSlots[existingIdx] = { 
        ...localSlots[existingIdx], 
        items: [...localSlots[existingIdx].items, newItem] 
      };
    } else {
      localSlots.push({ 
        id: Math.random().toString(), 
        date, 
        type, 
        items: [newItem] 
      });
    }
  },

  async removeItem(slotId: string, itemId: string): Promise<void> {
    await delay(200);
    localSlots = localSlots.map(s => {
      if (s.id !== slotId) return s;
      return { ...s, items: s.items.filter(i => i.id !== itemId) };
    }).filter(s => s.items.length > 0);
  },

  async updateItemMultiplier(slotId: string, itemId: string, multiplier: number): Promise<void> {
    await delay(200);
    localSlots = localSlots.map(s => {
      if (s.id !== slotId) return s;
      return { ...s, items: s.items.map(i => i.id === itemId ? { ...i, multiplier } : i) };
    });
  },

  async clearSlot(slotId: string): Promise<void> {
    await delay(200);
    localSlots = localSlots.map(s => {
      if (s.id === slotId) return { ...s, items: [] };
      return s;
    }).filter(s => s.items.length > 0); // Optionally remove empty slots or keep them empty
  }
};
