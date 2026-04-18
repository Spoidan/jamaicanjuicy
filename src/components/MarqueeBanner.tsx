interface Props {
  items?: string[];
}

const DEFAULT_ITEMS = [
  '🥭 Fresh Daily', '🌺 No Preservatives', '🍊 Real Fruit Only',
  '🌿 Jamaican Recipes', '🥥 Made to Order', '🍋 Zero Fillers',
  '🌶️ Authentic Flavors', '❤️ Family Owned',
];

export function MarqueeBanner({ items = DEFAULT_ITEMS }: Props) {
  return (
    <div className="bg-mango py-3 overflow-hidden marquee-container">
      <div className="flex whitespace-nowrap">
        <div className="flex gap-8 animate-marquee min-w-max px-4">
          {items.map((item, i) => (
            <span key={i} className="text-white font-semibold text-sm tracking-wide">{item}</span>
          ))}
        </div>
        <div className="flex gap-8 animate-marquee2 min-w-max px-4" aria-hidden>
          {items.map((item, i) => (
            <span key={i} className="text-white font-semibold text-sm tracking-wide">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
