import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddressSuggestion {
  id: string;
  name: string;
  address: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: AddressSuggestion[];
  placeholder?: string;
  id?: string;
  className?: string;
}

export const AddressAutocomplete = ({
  value, onChange, suggestions,
  placeholder = 'Enter address', id, className,
}: AddressAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.trim()
    ? suggestions.filter(s =>
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        s.address.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const showDropdown = isOpen && filtered.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setHighlightedIndex(-1); }, [filtered.length]);

  const handleSelect = (s: AddressSuggestion) => { onChange(s.address); setIsOpen(false); inputRef.current?.focus(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(prev => prev < filtered.length - 1 ? prev + 1 : prev); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev); }
    else if (e.key === 'Enter') { e.preventDefault(); if (highlightedIndex >= 0) handleSelect(filtered[highlightedIndex]); }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input ref={inputRef} id={id} placeholder={placeholder} value={value}
        onChange={e => { onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)} onKeyDown={handleKeyDown}
        className={cn('h-10', className)} autoComplete="off" />
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.map((s, i) => (
              <li key={s.id} onClick={() => handleSelect(s)} onMouseEnter={() => setHighlightedIndex(i)}
                className={cn('cursor-pointer px-3 py-2 text-sm',
                  highlightedIndex === i ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                )}>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.address}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
