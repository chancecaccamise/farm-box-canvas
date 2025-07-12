import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";

const MeetFarmers = () => {
  const teamMembers = [
    {
      name: "Sarah Chen",
      title: "Farm Manager & Hydroponic Specialist",
      image: "https://images.unsplash.com/photo-1494790108755-2616c333fb2c?w=300&h=300&fit=crop&crop=face",
      bio: "Sarah has over 15 years of experience in sustainable agriculture and pioneered our hydroponic growing systems. She holds a Master's degree in Agricultural Engineering and is passionate about water-efficient farming.",
      funFact: "Sarah can identify over 200 plant varieties by sight and loves hiking in her free time.",
      experience: "15 years"
    },
    {
      name: "Miguel Rodriguez",
      title: "Head Grower",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Miguel comes from a family of farmers spanning three generations. He specializes in leafy greens and herbs, ensuring every plant receives the perfect balance of nutrients and care.",
      funFact: "Miguel speaks four languages and plays guitar for the farm team during lunch breaks.",
      experience: "12 years"
    },
    {
      name: "Emma Thompson",
      title: "Sustainability Coordinator",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Emma oversees all our environmental initiatives, from composting programs to renewable energy systems. She has a background in environmental science and is dedicated to minimizing our carbon footprint.",
      funFact: "Emma has a collection of over 50 heirloom seed varieties and maintains a pollinator garden at home.",
      experience: "8 years"
    },
    {
      name: "David Kim",
      title: "Quality Control Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "David ensures every piece of produce meets our high standards before it goes into your box. His attention to detail and commitment to quality has made him an invaluable part of our team.",
      funFact: "David is a certified sommelier and loves pairing our fresh produce with wines in his spare time.",
      experience: "10 years"
    },
    {
      name: "Ana Gutierrez",
      title: "Community Outreach & Flower Specialist",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
      bio: "Ana manages our community partnerships and runs Ana's Flowers, our floral division. She has a natural talent for creating beautiful arrangements and connecting with our customers.",
      funFact: "Ana has won three local floral design competitions and volunteers at the community garden every weekend.",
      experience: "6 years"
    },
    {
      name: "James Wilson",
      title: "Harvest Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      bio: "James coordinates our daily harvest operations, ensuring optimal timing for peak flavor and nutrition. His background in logistics helps us maintain the freshest possible produce for our customers.",
      funFact: "James is an amateur photographer who captures stunning sunrise photos during early morning harvests.",
      experience: "7 years"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-fresh overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1200&h=600&fit=crop" 
          alt="Farm team working together" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Meet the Heart Behind Your Food
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Our team is made up of passionate farmers, growers, and experts in sustainable 
              agriculture. Get to know the faces behind the produce that goes into your farm boxes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Introduction Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Team</h2>
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
              <div className="text-3xl font-bold text-accent mb-2">15+</div>
              <div className="text-muted-foreground">Years Average Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">6</div>
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
                What unites us is our commitment to hydroponic farming and sustainable 
                practices. We believe this innovative approach to agriculture represents 
                the future of farming – efficient, environmentally friendly, and capable 
                of producing the highest quality food year-round.
              </p>
              
              <div className="bg-primary/10 p-6 rounded-lg">
                <blockquote className="text-lg italic mb-4">
                  "I've always been passionate about sustainable food, and hydroponics was 
                  a natural fit for me. There's something amazing about watching plants 
                  thrive in our perfectly controlled environment."
                </blockquote>
                <cite className="text-muted-foreground">— Sarah Chen, Farm Manager</cite>
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