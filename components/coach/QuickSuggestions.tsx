import { ListGroup, ListRow } from '@/components/ui/ListRow';

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

/** Starter questions for an empty chat, as a grouped list of rows. */
export function QuickSuggestions({ suggestions, onSelect, disabled }: QuickSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ListGroup>
      {suggestions.map((suggestion) => (
        <ListRow
          key={suggestion}
          icon="chatbubble-outline"
          title={suggestion}
          onPress={() => onSelect(suggestion)}
          disabled={disabled}
          accessibilityHint="Sends this question to the coach"
        />
      ))}
    </ListGroup>
  );
}
