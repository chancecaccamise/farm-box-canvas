import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Leaf, Truck, Clock, Fish, Droplets, Settings } from "lucide-react";

const FAQs = () => {
  const faqs = [
    {
      id: "1",
      question: "How do farm boxes work?",
      answer: "Farm boxes are weekly deliveries of fresh, seasonal produce and local products. You customize your preferences, we curate a selection based on what's available from our partner farms, and deliver it fresh to your door every week. You can modify your selections, skip weeks, or pause your subscription anytime.",
      icon: <Leaf className="w-5 h-5 text-accent" />
    },
    {
      id: "2", 
      question: "Where is the food sourced from?",
      answer: "All our produce comes from local farms within 100 miles of our facility. We partner with over 25 small-scale, sustainable farms that practice organic or regenerative farming methods. Each item in your box includes information about which farm it came from, so you know exactly where your food was grown.",
      icon: <Truck className="w-5 h-5 text-accent" />
    },
    {
      id: "3",
      question: "Can I pause or skip a week?",
      answer: "Absolutely! You have complete control over your deliveries. You can skip any week, pause your subscription for up to 8 weeks, or cancel anytime through your account dashboard. Just make sure to make changes before Wednesday at 11:59 PM for the following week's delivery.",
      icon: <Clock className="w-5 h-5 text-accent" />
    },
    {
      id: "4",
      question: "Are the vegetables organic?",
      answer: "Most of our produce is certified organic, and all non-organic items are clearly labeled. Our farmers follow sustainable, chemical-free growing practices. You can set your preferences to 'Organic Only' if you prefer to receive only certified organic items in your box.",
      icon: <Leaf className="w-5 h-5 text-accent" />
    },
    {
      id: "5",
      question: "How are fish sourced?",
      answer: "Our fish and seafood come from local, sustainable fisheries that practice responsible fishing methods. We work with day-boat fishermen who bring in the freshest catch, and all our seafood is traceable to its source. You can opt out of fish entirely in your dietary preferences if preferred.",
      icon: <Fish className="w-5 h-5 text-accent" />
    },
    {
      id: "6",
      question: "What is hydroponic farming?",
      answer: "Hydroponic farming is a method of growing plants without soil, using nutrient-rich water solutions. This allows for year-round growing, uses 90% less water than traditional farming, and produces incredibly fresh, clean produce. Several of our partner farms use hydroponic systems for leafy greens and herbs.",
      icon: <Droplets className="w-5 h-5 text-accent" />
    },
    {
      id: "7",
      question: "Can I change my preferences?",
      answer: "Yes! You can update your dietary preferences, box size, and delivery frequency anytime through your account. Changes to preferences will take effect for your next scheduled delivery. You can also customize individual weeks by adding or removing specific items.",
      icon: <Settings className="w-5 h-5 text-accent" />
    },
    {
      id: "8",
      question: "What if I don't like something in my box?",
      answer: "We want you to love everything in your box! If you receive something you don't enjoy, let us know and we'll credit your account. You can also rate items in your account to help us better customize future selections based on your preferences.",
      icon: <HelpCircle className="w-5 h-5 text-accent" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our farm boxes, sourcing, and delivery process
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-3">
                      {faq.icon}
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pl-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our customer support team is here to help you Monday through Friday, 9 AM to 6 PM EST.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <p className="font-medium">Email Support</p>
                <p className="text-accent">hello@farmbox.com</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Phone Support</p>
                <p className="text-accent">(555) 123-FARM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQs;