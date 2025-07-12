import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Thank you for subscribing!",
        description: "You'll receive fresh updates about our weekly harvests.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold">BB</span>
              </div>
              <span className="text-2xl font-bold">Billy's Botanicals</span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Family-owned since 2018. Fresh, hydroponic produce grown with love and 
              delivered weekly to your doorstep. Supporting sustainable agriculture in our community.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/how-we-grow" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                How We Grow
              </Link>
              <Link to="/how-farm-bags-work" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                How Farm Bags Work
              </Link>
              <Link to="/meet-farmers" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                Meet the Farmers
              </Link>
              <Link to="/sustainability" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                Sustainability
              </Link>
              <Link to="/faqs" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                FAQs
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/80">(555) 789-GROW</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/80">hello@billysbotanicals.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent mt-1" />
                <span className="text-primary-foreground/80">
                  456 Greenhouse Lane<br />
                  Botanical Valley, CA 95420
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Join Billy's Botanical Family</h3>
            <p className="text-primary-foreground/80 mb-4">
              Get weekly farm updates, Billy's growing tips, and first access to seasonal harvests.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                required
              />
              <Button type="submit" variant="secondary" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Billy's Botanicals. All rights reserved. | Family-owned since 2018
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <Link to="/support-local" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Support Local
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;