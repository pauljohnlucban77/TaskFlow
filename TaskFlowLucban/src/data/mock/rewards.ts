import { Reward } from '../../types/loyalty';

export const mockRewards: Reward[] = [
  {
    id: 'reward-1',
    name: 'Free Slice of Pie',
    description: 'Enjoy any slice of our freshly baked fruit or cream pie on the house.',
    pointsRequired: 50,
    active: true,
  },
  {
    id: 'reward-2',
    name: 'Complimentary Artisan Coffee',
    description: 'Choice of hot brewed coffee, espresso, or house iced tea.',
    pointsRequired: 30,
    active: true,
  },
  {
    id: 'reward-3',
    name: '₱100 Off Your Order',
    description: 'Get ₱100 off any purchase over ₱300 at Fred\'s Pies.',
    pointsRequired: 100,
    active: true,
  },
  {
    id: 'reward-4',
    name: 'Master Baker\'s Special Box',
    description: 'Exclusive family assortment box containing 1 full pie and 4 croissants.',
    pointsRequired: 200,
    active: false, // Inactive reward to demonstrate filtering
  },
];
