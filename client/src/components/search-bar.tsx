import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search for recipes or ingredients...", className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow-lg p-2 flex items-stretch ${className}`}>
      <div className="flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-l-lg focus:outline-none border-0"
        />
      </div>
      <Button 
        type="submit" 
        className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-r-lg transition-colors"
      >
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
