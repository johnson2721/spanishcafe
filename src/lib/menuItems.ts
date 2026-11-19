export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  unit?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "tea",
    name: "Tea",
    description: "Fresh hot tea prepared with premium milk.",
    price: 20,
    category: "Beverages",
    image: "https://images.pexels.com/photos/8696759/pexels-photo-8696759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "mandazi",
    name: "Mandazi",
    description: "Fresh soft mandazi, perfectly fried to golden perfection.",
    price: 10,
    category: "Snacks",
    image: "https://images.pexels.com/photos/20067069/pexels-photo-20067069.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  },
  {
    id: "ugali",
    name: "Ugali",
    description: "Freshly prepared maize meal, a Kenyan staple.",
    price: 30,
    category: "Main Course",
    image: "https://images.pexels.com/photos/17486836/pexels-photo-17486836.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "beans",
    name: "Beans",
    description: "Delicious beans cooked to perfection with spices.",
    price: 50,
    category: "Main Course",
    image: "https://images.pexels.com/photos/32612769/pexels-photo-32612769.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "sukuma_wiki",
    name: "Sukuma Wiki",
    description: "Fresh vegetables cooked with onions and seasoning.",
    price: 40,
    category: "Vegetables",
    image: "https://images.pexels.com/photos/17486827/pexels-photo-17486827.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "chapati",
    name: "Chapati",
    description: "Soft layered chapati, freshly made from scratch.",
    price: 20,
    category: "Bread",
    image: "https://images.pexels.com/photos/20434734/pexels-photo-20434734.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "eggs",
    name: "Eggs",
    description: "Fresh farm eggs, cooked your way.",
    price: 30,
    category: "Protein",
    image: "https://images.pexels.com/photos/33489605/pexels-photo-33489605.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    unit: "each",
  },
  {
    id: "kienyeji_eggs",
    name: "Kienyeji Eggs",
    description: "Organic village eggs, rich in nutrients.",
    price: 35,
    category: "Protein",
    image: "https://images.pexels.com/photos/33489599/pexels-photo-33489599.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    unit: "each",
  },
  {
    id: "chips",
    name: "Chips",
    description: "Golden crispy fries, seasoned to perfection.",
    price: 50,
    category: "Snacks",
    image: "https://images.pexels.com/photos/5041473/pexels-photo-5041473.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "milk_cup",
    name: "Milk (Cup)",
    description: "Fresh whole milk served in a cup.",
    price: 30,
    category: "Beverages",
    image: "https://images.pexels.com/photos/19378972/pexels-photo-19378972.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    unit: "cup",
  },
  {
    id: "milk_litre",
    name: "Milk (Litre)",
    description: "Fresh whole milk, one full litre.",
    price: 50,
    category: "Beverages",
    image: "https://images.pexels.com/photos/19378972/pexels-photo-19378972.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    unit: "litre",
  },
  {
    id: "minji_mix",
    name: "Minji Mix",
    description: "Delicious green peas mix, hearty and filling.",
    price: 60,
    category: "Main Course",
    image: "https://images.pexels.com/photos/32986452/pexels-photo-32986452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "githeri_mix",
    name: "Githeri Mix",
    description: "Traditional Kenyan githeri, nutritious and satisfying.",
    price: 50,
    category: "Main Course",
    image: "https://images.pexels.com/photos/32986467/pexels-photo-32986467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "mala",
    name: "Mala",
    description: "Fresh sour milk, a Kenyan fermented dairy delight.",
    price: 30,
    category: "Beverages",
    image: "https://images.pexels.com/photos/8696759/pexels-photo-8696759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    unit: "cup",
  },
  {
    id: "mukimo",
    name: "Mukimo",
    description: "Mashed potatoes with green vegetables and corn.",
    price: 50,
    category: "Main Course",
    image: "https://images.pexels.com/photos/17486836/pexels-photo-17486836.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

export const categories = [...new Set(menuItems.map((item) => item.category))];
