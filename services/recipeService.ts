import { Recipe } from '../types';

// Mock Data
let localRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Kung Pao Chicken',
    image: 'https://images.unsplash.com/photo-1525755617299-7a88784337d5?auto=format&fit=crop&w=800&q=80',
    baseServings: 2,
    ingredients: [
      { name: 'Chicken Breast', amount: 300, unit: 'g', isSeasoning: false },
      { name: 'Peanuts', amount: 50, unit: 'g', isSeasoning: false },
      { name: 'Dried Chili', amount: 10, unit: 'g', isSeasoning: true },
      { name: 'Scallion', amount: 2, unit: 'stalks', isSeasoning: false }
    ],
    steps: ['Dice chicken', 'Fry peanuts', 'Stir fry everything'],
    tags: ['Chinese', 'Spicy']
  },
  {
    id: '2',
    title: 'Tomato Pasta',
    image: 'https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=800&q=80',
    baseServings: 1,
    ingredients: [
      { name: 'Pasta', amount: 150, unit: 'g', isSeasoning: false },
      { name: 'Tomato Sauce', amount: 200, unit: 'g', isSeasoning: false },
      { name: 'Basil', amount: 5, unit: 'leaves', isSeasoning: true }
    ],
    steps: ['Boil water', 'Cook pasta', 'Mix sauce'],
    tags: ['Western', 'Quick']
  },
  {
    id: '3',
    title: 'Steamed Rice',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
    baseServings: 2,
    ingredients: [
      { name: 'Rice', amount: 200, unit: 'g', isSeasoning: false },
      { name: 'Water', amount: 300, unit: 'ml', isSeasoning: true }
    ],
    steps: ['Wash rice', 'Cook in rice cooker'],
    tags: ['Basic', 'Side']
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const recipeService = {
  async getRecipes(): Promise<Recipe[]> {
    await delay(300); // Simulate network
    return [...localRecipes];
  },

  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    await delay(300);
    const idx = localRecipes.findIndex(r => r.id === recipe.id);
    if (idx >= 0) {
      localRecipes[idx] = recipe;
    } else {
      localRecipes.push(recipe);
    }
    return recipe;
  },

  async deleteRecipe(id: string): Promise<void> {
    await delay(300);
    localRecipes = localRecipes.filter(r => r.id !== id);
  }
};
