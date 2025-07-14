import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";
import farmersMarketImage from "@/assets/farmers-market-couple.jpg";

const MeetFarmers = () => {
  const teamMembers = [
    {
      name: "Billy Thompson",
      title: "Co-Founder & Head Farmer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Billy co-founded Billy's Botanicals with a vision to bring fresh, sustainably grown produce directly to families. With 18 years in sustainable agriculture, he oversees all growing operations and maintains our commitment to organic practices.",
      funFact: "Billy can predict the weather by observing plant behavior and has never owned a TV, preferring to spend evenings reading about new farming techniques.",
      experience: "18 years"
    },
    {
      name: "Maria Thompson",
      title: "Co-Founder & Community Manager",
      image: "https://images.unsplash.com/photo-1494790108755-2616c333fb2c?w=300&h=300&fit=crop&crop=face",
      bio: "Maria handles all customer relationships and community partnerships for Billy's Botanicals. Her background in nutrition and her passion for connecting people with their food sources makes her the heart of our customer experience.",
      funFact: "Maria speaks three languages fluently and personally writes thank-you notes to every new subscriber. She also maintains a recipe blog featuring our seasonal produce.",
      experience: "15 years"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-fresh overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src={farmersMarketImage} 
          alt="Billy and Maria Thompson at their farmers market stand" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Meet the Heart Behind Your Food
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Our team is made up of <span className="text-accent font-semibold">passionate farmers</span>, growers, and experts in <span className="text-accent font-semibold">sustainable agriculture</span>. Get to know the faces behind the produce that goes into your <span className="text-accent font-semibold">farm boxes</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Introduction Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 relative">
              <span className="bg-accent/10 px-4 py-2 rounded-lg">Our Team</span>
            </h2>
            <h3 className="text-2xl text-muted-foreground mb-8">Dedicated to Fresh, Sustainable Produce</h3>
          </div>
          
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-lg leading-relaxed">
              From our greenhouse experts to the farm hands who harvest your food, our team is 
              committed to growing the best food possible. We all share a love for fresh, local, 
              and healthy food, and we're excited to share our passion with you.
            </p>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">16+</div>
              <div className="text-muted-foreground">Years Average Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">2</div>
              <div className="text-muted-foreground">Core Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">100%</div>
              <div className="text-muted-foreground">Passionate About Food</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">365</div>
              <div className="text-muted-foreground">Days Growing Fresh</div>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-soft"
                    />
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-accent font-medium mb-2">{member.title}</p>
                    <Badge variant="secondary" className="text-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      {member.experience} experience
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Heart className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Fun Fact:</h4>
                        <p className="text-sm text-muted-foreground">{member.funFact}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Background Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">Our Farmers' Background</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                Our collective farming experience spans generations, with some team members 
                coming from family farming traditions while others discovered their passion 
                for sustainable agriculture through education and hands-on experience.
              </p>
              
              <p className="text-lg leading-relaxed">
                What unites us is our commitment to hydroponic farming and <span className="text-accent font-semibold">sustainable practices</span>. We believe this innovative approach to agriculture represents 
                the future of farming – efficient, environmentally friendly, and capable 
                of producing the highest quality food year-round.
              </p>
              
              <div className="bg-primary/10 p-6 rounded-lg">
                <blockquote className="text-lg italic mb-4">
                  "I've always been passionate about sustainable food, and hydroponics was 
                  a natural fit for me. There's something amazing about watching plants 
                  thrive in our perfectly controlled environment."
                </blockquote>
                <cite className="text-muted-foreground">— Billy Thompson, Co-Founder</cite>
              </div>
            </div>
            
            <div className="space-y-4">
              <img 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop" 
                alt="Team working in hydroponic greenhouse" 
                className="rounded-lg shadow-soft w-full h-48 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&h=300&fit=crop" 
                alt="Team harvesting fresh produce" 
                className="rounded-lg shadow-soft w-full h-48 object-cover"
              />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-accent/10 p-8 rounded-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Family-Owned, Community-Focused</h3>
              <p className="text-lg leading-relaxed">
                While we embrace modern farming technology, we maintain the family values 
                and community focus that have been the foundation of successful farms for 
                generations. Every decision we make considers not just our customers, but 
                our community and our planet.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeetFarmers;