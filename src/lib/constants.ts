// Categories and subcategories for items
export const CATEGORIES = {
  'Clothing': [
    'Tops',
    'Bottoms', 
    'Dresses',
    'Outerwear',
    'Shoes',
    'Accessories',
    'Athletic Wear',
    'Formal Wear'
  ],
  'Books': [
    'Textbooks',
    'Fiction',
    'Non-Fiction',
    'Reference',
    'Study Guides',
    'Academic Journals'
  ],
  'Electronics': [
    'Computers',
    'Phones',
    'Audio',
    'Gaming',
    'Accessories',
    'Cables & Chargers'
  ],
  'Dorm Items': [
    'Storage',
    'Decor',
    'Bedding',
    'Kitchen',
    'Cleaning Supplies',
    'Furniture'
  ],
  'School Supplies': [
    'Writing Tools',
    'Notebooks',
    'Bags',
    'Calculators',
    'Art Supplies',
    'Lab Equipment'
  ],
  'Sports & Recreation': [
    'Equipment',
    'Clothing',
    'Shoes',
    'Accessories',
    'Games',
    'Outdoor Gear'
  ],
  'Other': [
    'Miscellaneous',
    'Gifts',
    'Collectibles',
    'Tools',
    'Health & Beauty'
  ]
}

// Campus locations for meetups
export const CAMPUS_LOCATIONS = [
  'Bothin Stairs',
  'Keck Lab', 
  'Lower Booth',
  'Upper Booth',
  'Day Student Lounge',
  'Old Gym',
  'New Gym',
  'Pars',
  'High House',
  'Schoolhouse',
  'Kirby Quad',
  'CHE',
  'CHW',
  'Bothin',
  'CoLab',
  'McBean',
  'Johnson Library',
  'Theater',
  'Senior Lawn',
  'Pizza Lawn'
]

// Item status options
export const ITEM_STATUS = {
  available: 'Available',
  pending: 'Pending Trade',
  traded: 'Traded'
}

// Listing type options
export const LISTING_TYPES = {
  free: 'Free',
  for_sale: 'For Sale'
}

// Payment method options
export const PAYMENT_METHODS = [
  'Apple Pay',
  'Zelle',
  'Venmo',
  'Cash'
]

// Condition options
export const CONDITIONS = ['Excellent', 'Good', 'OK', 'Subpar']

// Size options
export const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'N/A']

// Categories that require sizing (clothing items)
export const CLOTHING_CATEGORIES = ['Clothing', 'Sports & Recreation']

// Size preferences for different clothing types only
export const SIZE_PREFERENCES = {
  'Tops': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Bottoms': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Dresses': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Outerwear': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Shoes': ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  'Accessories': ['One Size', 'Small', 'Medium', 'Large'],
  'Athletic Wear': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Formal Wear': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
}

// SmartMatch AI categories for recommendations
export const SMARTMATCH_CATEGORIES = {
  'Clothing': ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Athletic Wear', 'Formal Wear'],
  'Electronics': ['Computers', 'Phones', 'Audio', 'Gaming', 'Accessories'],
  'Books': ['Textbooks', 'Fiction', 'Non-Fiction', 'Reference', 'Study Guides'],
  'Dorm Items': ['Storage', 'Decor', 'Bedding', 'Kitchen', 'Furniture'],
  'School Supplies': ['Writing Tools', 'Notebooks', 'Bags', 'Calculators'],
  'Sports & Recreation': ['Equipment', 'Clothing', 'Shoes', 'Accessories', 'Games']
}
