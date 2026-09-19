import { memo } from 'react';

import { ListRow } from '@/components/ui/ListRow';
import { QUICK_WIN_CATEGORIES, type QuickWin } from '@/constants/quickWins';

type QuickWinCardProps = {
  win: QuickWin;
  onPress: () => void;
};

/** A quick win as a list row: icon, title, "Calm, 3 min", chevron. */
function QuickWinCardBase({ win, onPress }: QuickWinCardProps) {
  const cat = QUICK_WIN_CATEGORIES[win.category];
  return (
    <ListRow
      icon={win.icon}
      iconTone="secondary"
      title={win.title}
      subtitle={`${cat.label}, ${win.duration}`}
      trailing="chevron"
      onPress={onPress}
      accessibilityLabel={`${win.title}, ${win.duration}, ${cat.label}`}
    />
  );
}

export const QuickWinCard = memo(QuickWinCardBase);
