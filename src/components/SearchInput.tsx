
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onInputChange,
  className,
  placeholder = "Enter an item (e.g., water bottle, newspaper, old t-shirt)",
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  useEffect(() => {
    // Auto-focus the input on component mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out", 
        isFocused ? "scale-[1.02]" : "scale-100",
        className
      )}
    >
      <div 
        className={cn(
          "relative flex items-center overflow-hidden rounded-2xl transition-all duration-300",
          "border border-border bg-white shadow-sm",
          isFocused ? "shadow-md border-primary/30" : ""
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 md:py-5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/70"
          aria-label="Search for items to recycle"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          className={cn(
            "flex items-center justify-center h-full aspect-square bg-primary text-primary-foreground transition-all",
            "hover:bg-primary/90 active:bg-primary/80",
            (query.trim() === "" || isLoading) ? "opacity-70 cursor-not-allowed" : "opacity-100"
          )}
          disabled={query.trim() === "" || isLoading}
          aria-label="Search"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/5 blur-xl opacity-50 transform scale-95"></div>
    </div>
  );
};

export default SearchInput;
