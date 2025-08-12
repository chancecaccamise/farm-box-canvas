import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";
import billyAna2 from "@/assets/billyanna2.png";
import billyPortrait from "@/assets/billyPortrait.png";
import AnaPortrait from "@/assets/anaPortrait.png";
import mtf1 from "@/assets/mtf1.jpg";
import mtf2 from "@/assets/mtf2.jpg";

const MeetFarmers = () => {
  const teamMembers = [
  {
    name: "Billy",
    title: "Co-Founder & Head Grower",
    image: billyPortrait,
    bio: "Billy co-founded Billy's Botanicals and can be found every weekend working the farmers market stand at Forsyth Park. With a deep passion for sustainable growing, he leads all the planting, harvesting, and behind-the-scenes operations that keep the farm thriving.",
    funFact: "Billy knows nearly every regular customer by name and starts each market day with a cup of black coffee and a weather check — he swears he can feel the rain before it hits.",
    experience: "18 years"
  },
  {
    name: "Ana",
    title: "Co-Founder & Floral Artist",
    image: AnaPortrait,
    bio: "Ana is the creative heart of Billy's Botanicals and co-runs the stand with Billy at Forsyth Park. In addition to farming, she operates her own flower business, designing custom bouquets for weddings, events, and local deliveries — always using fresh, seasonal blooms.",
    funFact: "Ana has a signature flower for every month of the year and once built an entire wedding arch using only wildflowers and reclaimed driftwood.",
    experience: "15 years"
  }
];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-fresh overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src={billyAna2} 
          alt="Billy and Maria Thompson at their farmers market stand" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
            The hearts behind your harvest
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            We empower people to care for themselves and their families with fresh, affordable local produce. When your body is nurtured by clean bounty, good health rewards you — this is our anthem. 
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
          <div className="grid gap-8 justify-center sm:grid-cols-1 md:grid-cols-2">
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
            <h2 className="text-4xl font-bold mb-8">Generational growth</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
              Farming runs deep in our family&apos;s roots. Some of us grew up in family fields, learning the rhythms of the land from an early age. Others found our calling through study, curiosity, and the thrill of compassionately cohabitating with the earth. What brings us together is a shared belief in aquaponic farming and the promise it holds. Its farming reimagined, producing efficient, earth-conscious, highest-quality food during every season. 
              </p>
              
              
              
              <div className="bg-primary/10 p-6 rounded-lg">
                <blockquote className="text-lg italic mb-4">
                  "Billy and Ana Quote"
                </blockquote>
                <cite className="text-muted-foreground">— Billy and Ana, Owners</cite>
              </div>
            </div>
            
            <div className="flex justify-center">
              <img 
                src={mtf1} 
                alt="Team working in hydroponic greenhouse" 
                className="rounded-lg shadow-soft w-full max-w-lg h-96 object-cover"
              />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-accent/10 p-8 rounded-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Family-Owned, Community-Focused</h3>
              <p className="text-lg leading-relaxed">
              We maintain the family values and community focus that have been the foundation of successful farms for generations. Every decision we make considers not just our customers, but our community and our planet, which includes fellow farmers, foragers, and makers. 
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeetFarmers;