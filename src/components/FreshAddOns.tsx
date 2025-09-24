
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import leafyGreens from "@/assets/leafy-greens.jpg";
import tomatoes from "@/assets/tomatoes.jpg";
import bellPeppers from "@/assets/bell-peppers.jpg";

const FreshAddOns = () => {
  const addOnCategories = [
    {
      name: "Fresh Seafood & Proteins",
      description: "Daily fresh catch from local fishermen",
      image: "https://umfjwvucdqmzufczisca.supabase.co/storage/v1/object/public/product-images/products/gnyvhcnat4j-1758657183940.jpg",
      examples: "Atlantic Scallops, GA Shrimp, Local Fish"
    },
    {
      name: "Artisan Pantry Items",
      description: "Small-batch local treasures",
      image: "https://umfjwvucdqmzufczisca.supabase.co/storage/v1/object/public/product-images/products/qzfpmtx6yn8-1758658017874.webp",
      examples: "Wild Light Honey, Hot Sauces, Local Jams"
    },
    {
      name: "Fresh Flowers & Herbs",
      description: "Beautiful seasonal arrangements and extra herbs",
      image: "https://umfjwvucdqmzufczisca.supabase.co/storage/v1/object/public/product-images/products/imy97712ge-1758658115305.png",
      examples: "Mini Bouquet Arrangements, Fresh Herbs, Edible Flowers"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Personalize Your Weekly Delivery</h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Add seasonal extras to complement your weekly box. Available items change based on local harvests and catches.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {addOnCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{category.examples}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreshAddOns;
