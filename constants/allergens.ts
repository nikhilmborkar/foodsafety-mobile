export const ALLERGEN_LABELS: Record<string, string> = {
  gluten_cereals: 'Gluten',
  milk:           'Milk',
  eggs:           'Eggs',
  peanuts:        'Peanuts',
  soybeans:       'Soy',
  tree_nuts:      'Tree nuts',
  fish:           'Fish',
  crustaceans:    'Crustaceans',
  molluscs:       'Molluscs',
  sesame:         'Sesame',
  celery:         'Celery',
  mustard:        'Mustard',
  lupin:          'Lupin',
  sulphites:      'Sulphites',
};

export const EU14_ALLERGENS = [
  { id: 'gluten_cereals', label: 'Gluten (wheat, rye, barley, oats)' },
  { id: 'crustaceans',    label: 'Crustaceans (shrimp, crab, lobster)' },
  { id: 'eggs',           label: 'Eggs' },
  { id: 'fish',           label: 'Fish' },
  { id: 'peanuts',        label: 'Peanuts' },
  { id: 'soybeans',       label: 'Soy / Soja' },
  { id: 'milk',           label: 'Milk / Dairy (lactose)' },
  { id: 'tree_nuts',      label: 'Tree Nuts (almonds, hazelnuts, walnuts etc.)' },
  { id: 'celery',         label: 'Celery' },
  { id: 'mustard',        label: 'Mustard' },
  { id: 'sesame',         label: 'Sesame' },
  { id: 'sulphites',      label: 'Sulphites / Sulphur dioxide' },
  { id: 'lupin',          label: 'Lupin' },
  { id: 'molluscs',       label: 'Molluscs (squid, mussels, oysters)' },
] as const;

export const PET_DOG_ALLERGENS = [
  { id: 'chicken',        label: 'Chicken / Poultry' },
  { id: 'beef',           label: 'Beef' },
  { id: 'lamb',           label: 'Lamb' },
  { id: 'pork',           label: 'Pork' },
  { id: 'fish',           label: 'Fish / Seafood' },
  { id: 'milk',           label: 'Dairy / Milk' },
  { id: 'eggs',           label: 'Eggs' },
  { id: 'soybeans',       label: 'Soy' },
  { id: 'gluten_cereals', label: 'Wheat / Gluten' },
  { id: 'corn',           label: 'Corn / Maize' },
] as const;

export const PET_CAT_ALLERGENS = [
  { id: 'fish',           label: 'Fish / Seafood' },
  { id: 'chicken',        label: 'Chicken / Poultry' },
  { id: 'beef',           label: 'Beef' },
  { id: 'milk',           label: 'Dairy / Milk' },
  { id: 'eggs',           label: 'Eggs' },
  { id: 'soybeans',       label: 'Soy' },
  { id: 'gluten_cereals', label: 'Wheat / Gluten' },
  { id: 'corn',           label: 'Corn / Maize' },
] as const;
