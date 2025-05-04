import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally submit to a newsletter API
    alert('Thank you for subscribing to our newsletter!');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">Culinary Compass</h4>
            <p className="text-gray-400 text-sm">Discover and share delicious recipes from around the world. Cook, create, and connect.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Popular Recipes</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Categories</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Meal Types</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Dietary Restrictions</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/create">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Submit a Recipe</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Cooking Tips</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Food Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Forums</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">Subscribe to our newsletter for new recipes and cooking tips.</p>
            <form onSubmit={handleNewsletterSubmit} className="mt-2 flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 text-gray-800 rounded-l w-full focus:outline-none" 
                required
              />
              <Button className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-r transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Culinary Compass. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
