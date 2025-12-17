export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  isSeasoning: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  baseServings: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  isCookable?: boolean; // Frontend computed property
}

export interface MealItem {
  id: string;
  recipeId: string;
  multiplier: number;
}

export interface MealSlot {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  items: MealItem[]; 
}

export interface InventoryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  expirationDate: string;
  status: 'normal' | 'expiring' | 'expired';
}

export interface ShoppingListItem {
  id: string;
  name: string;
  needed: number;
  unit: string;
  checked: boolean;
  notes?: string;
}

export interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  joinedDate: string;
}
