
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import billysLogo from "@/assets/billysBotanicals-Logo-v1.png";

const Footer = () => {

  return (
    <footer className="bg-gradient-subtle border-t">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-8">
              <img 
                src={billysLogo} 
                alt="Billy's Botanicals Logo" 
                className="h-16 w-auto object-contain transition-smooth hover:opacity-80"
              />
            </Link>
            <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
              Tapping the natural magic of sun, water, and land, Billy&apos;s Botanicals provides local, sustainably raised and harvested fish, fruit, herbs, vegetables, greens, & more. 
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary hover:text-primary-foreground">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary hover:text-primary-foreground">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-8 text-foreground">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Link to="/how-we-grow" className="block text-muted-foreground hover:text-primary transition-colors text-base">
              Grown for good
              </Link>
              <Link to="/how-farm-bags-work" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                Billy's Box To Go 101
              </Link>
              <Link to="/meet-farmers" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                Meet the Duggers
              </Link>
              <Link to="/faqs" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                FAQs
              </Link>
              <Link to="/support-local" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                Support Local
              </Link>
              <Link to="/fresh-catch" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                Fresh Catch
              </Link>
              <Link to="/anas-flowers" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                Ana's Arrangements
              </Link>
            
              
              <Link to="/become-a-partner" className="block text-muted-foreground hover:text-primary transition-colors text-base">
                Become a Partner
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-8 text-foreground">Contact Us</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-base">(555) 789-GROW</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-base">hello@billysbotanicals.com</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-base leading-relaxed">
                  456 Greenhouse Lane<br />
                  Botanical Valley, CA 95420
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-border/50" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <p className="text-muted-foreground text-base">
            © 2025 Billy's Botanicals. All rights reserved. | Website Designed by Mangia DMA
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
