import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Leaf, Truck, Clock, Fish, Droplets, Settings } from "lucide-react";

const FAQs = () => {
  const generalFAQs = [
    {
      id: "1",
      question: "How do farm boxes work?",
      answer: "Billy's boxes are weekly deliveries of fresh, hydroponically-grown produce. Billy personally curates each box with the best seasonal vegetables and herbs from his greenhouse. You choose your box size (Small $35, Medium $50, or Large $70), and can add optional extras like fresh fish or proteins. You can skip weeks, pause your subscription, or cancel anytime.",
      icon: <Leaf className="w-5 h-5 text-accent" />
    },
    {
      id: "3",
      question: "Can I pause or skip a week?",
      answer: "Absolutely! You have complete control over your deliveries. You can skip any week, pause your subscription for up to 8 weeks, or cancel anytime through your account dashboard. Just make sure to make changes before Wednesday at 11:59 PM for the following week's delivery.",
      icon: <Clock className="w-5 h-5 text-accent" />
    },
    {
      id: "7",
      question: "Can I change my preferences?",
      answer: "Yes! You can change your box size (Small, Medium, or Large) and delivery frequency anytime through your account. You can also add or remove optional add-ons like fresh fish and proteins for any upcoming delivery. Changes take effect for your next scheduled delivery.",
      icon: <Settings className="w-5 h-5 text-accent" />
    },
    {
      id: "8",
      question: "What if I don't like something in my box?",
      answer: "Billy stands behind every item! If you receive something you don't enjoy, let us know and we'll credit your account. Since Billy curates each box based on what's fresh and seasonal from his greenhouse, the contents may vary weekly, but quality is always guaranteed.",
      icon: <HelpCircle className="w-5 h-5 text-accent" />
    }
  ];

  const sourcingFAQs = [
    {
      id: "2",
      question: "How is the produce grown?",
      answer: "We specialize in aquaponic farming practices, producing soil-free, organic fruits, roots, veggies, and herbs using sustainable fish tanks and natural nitrates.",
      icon: <Truck className="w-5 h-5 text-accent" />
    },
    {
      id: "4",
      question: "Is everything organic?",
      answer: "Everything we grow is organic by all standards. To have our produce officially “certified” by USDA agencies would require a cost hike in our produce, so we promote our “word of mouth” organic status.",
      icon: <Leaf className="w-5 h-5 text-accent" />
    },
    {
      id: "5",
      question: "What is aquaponic farming?",
      answer: "Aquaponic farming is a method of growing plants without soil, using nutrient-rich water solutions. This allows for year-round growing, uses 90% less water than traditional farming, and produces incredibly fresh, clean produce. Several of our partner farms use hydroponic systems for leafy greens and herbs.",
      icon: <Fish className="w-5 h-5 text-accent" />
    },
    {
      id: "6",
      question: "Where is the fish caught?",
      answer: "All our fish, shrimp, and oceanic proteins are caught off the Georgia coast by our fishing team.",
      icon: <Droplets className="w-5 h-5 text-accent" />
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

        {/* General FAQ Accordion */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">General Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {generalFAQs.map((faq) => (
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

        {/* Sourcing FAQ Accordion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sourcing & Sustainability</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sourcingFAQs.map((faq) => (
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
