import chronographGold from '@/assets/watches/chronograph-gold.jpg';
import diverBlue from '@/assets/watches/diver-blue.jpg';
import skeletonRose from '@/assets/watches/skeleton-rose.jpg';
import dressGrey from '@/assets/watches/dress-grey.jpg';
import sportBlack from '@/assets/watches/sport-black.jpg';
import moonphaseBlue from '@/assets/watches/moonphase-blue.jpg';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model_number: string;
  category: string;
  category_name?: string;
  collection: string;
  mrp?: number;
  price: number;
  case_diameter: string;
  case_material: string;
  dial_colour: string;
  movement_type: string;
  caliber: string;
  water_resistance: string;
  strap_material: string;
  crystal: string;
  functions: string;
  power_reserve: string;
  case_thickness: string;
  lug_width: string;
  warranty: string;
  key_highlights: string;
  whats_in_the_box: string;
  image: string;
  images: string[];
  status: 'active' | 'inactive';
  stock_quantity: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Rolex Submariner Date 126610LN',
    brand: 'Rolex',
    model_number: '126610LN',
    category: 'Luxury Sports',
    collection: 'Submariner',
    mrp: 1250000,
    price: 1190000,
    case_diameter: '41mm',
    case_material: 'Oystersteel',
    dial_colour: 'Black',
    movement_type: 'Automatic',
    caliber: 'Cal. 3235',
    water_resistance: '300m / 1000ft',
    strap_material: 'Oystersteel Oyster bracelet',
    crystal: 'Scratch-resistant sapphire with cyclops lens',
    functions: 'Date, Bidirectional rotating bezel, Luminescent hands',
    power_reserve: '70 hours',
    case_thickness: '12.5mm',
    lug_width: '21mm',
    warranty: '5 years international',
    key_highlights: '• Iconic Cerachrom bezel in black ceramic.\n• New generation Calibre 3235 with 70-hour power reserve.\n• Enhanced 41mm Oystersteel case for superior wrist presence.',
    whats_in_the_box: 'Watch, Rolex box, papers, warranty card',
    image: chronographGold,
    images: [chronographGold, chronographGold, chronographGold],
    status: 'active',
    stock_quantity: 5,
  },
];
