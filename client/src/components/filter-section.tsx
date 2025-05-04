import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cuisines, mealTypes, dietaryOptions } from "@shared/schema";

interface FilterSectionProps {
  onFilterChange: (type: string, value: string) => void;
  onSortChange: (value: string) => void;
  selectedCuisine?: string;
  selectedMealType?: string;
  selectedDietaryOption?: string;
  selectedSort?: string;
}

export default function FilterSection({
  onFilterChange,
  onSortChange,
  selectedCuisine = "",
  selectedMealType = "",
  selectedDietaryOption = "",
  selectedSort = "popular"
}: FilterSectionProps) {
  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select 
              value={selectedCuisine} 
              onValueChange={(value) => onFilterChange("cuisine", value)}
            >
              <SelectTrigger className="w-[140px] bg-gray-100">
                <SelectValue placeholder="All Cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedMealType} 
              onValueChange={(value) => onFilterChange("mealType", value)}
            >
              <SelectTrigger className="w-[140px] bg-gray-100">
                <SelectValue placeholder="Meal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meal Types</SelectItem>
                {mealTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedDietaryOption} 
              onValueChange={(value) => onFilterChange("dietaryOption", value)}
            >
              <SelectTrigger className="w-[160px] bg-gray-100">
                <SelectValue placeholder="Dietary Needs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dietary Needs</SelectItem>
                {dietaryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select 
              value={selectedSort} 
              onValueChange={onSortChange}
            >
              <SelectTrigger className="w-[140px] bg-gray-100">
                <SelectValue placeholder="Most Popular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="cookingTime">Cooking Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
