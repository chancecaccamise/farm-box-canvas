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
      question: "What types of Billy's Bags do you offer?",
      answer: "We offer three types of Billy's Bags: Veggie Billy's Bag ($30 or $25 for subscribers) with fresh vegetables and herbs, Full Billy's Bag ($55 or $50 for subscribers) with vegetables, herbs, protein, and carb, and Protein Billy's Bag ($100 or $95 for subscribers) with premium proteins and seafood. All bags feature Billy's fresh, hydroponically-grown produce.",
      icon: <Leaf className="w-5 h-5 text-accent" />
    },
    {
      id: "2",
      question: "How much do Billy's Bags cost?",
      answer: "Our bags are priced affordably with subscriber discounts: Veggie Billy's Bag is $30 ($25 for subscribers), Full Billy's Bag is $55 ($50 for subscribers), and Protein Billy's Bag is $100 ($95 for subscribers). You can choose between one-time purchases or weekly subscriptions to save money.",
      icon: <HelpCircle className="w-5 h-5 text-accent" />
    },
    {
      id: "3",
      question: "What delivery options are available?",
      answer: "We offer flexible fulfillment options including home delivery on Thursdays, Saturdays, and Sundays, as well as convenient pickup locations at local markets and directly from our farm. Choose the option that works best for your schedule during checkout.",
      icon: <Truck className="w-5 h-5 text-accent" />
    },
    {
      id: "4",
      question: "Can I add fresh fish and other extras?",
      answer: "Yes! Through our Fresh Catch program, you can add premium Georgia coast seafood caught by our fishing team. We also offer various add-ons and you can sign up for Fresh Fish Alerts to be notified when new catches are available.",
      icon: <Fish className="w-5 h-5 text-accent" />
    },
    {
      id: "5",
      question: "Do you offer floral arrangements?",
      answer: "Absolutely! Ana's Arrangements provides beautiful custom floral designs for weddings, events, and special occasions. From bridal bouquets to centerpieces, Ana creates stunning arrangements using fresh, locally-sourced flowers and greenery.",
      icon: <Leaf className="w-5 h-5 text-accent" />
    },
    {
      id: "7",
      question: "How do I manage my subscription?",
      answer: "You can manage your subscription through the My Plan page. From there, you can view your subscription details, update delivery preferences, and cancel your subscription if needed. For other account settings like delivery address and payment methods, visit your account dashboard.",
      icon: <Settings className="w-5 h-5 text-accent" />
    },
    {
      id: "8",
      question: "What if I'm not satisfied with my order?",
      answer: "Billy stands behind every item! If you receive something you don't enjoy or have any quality concerns, contact us and we'll make it right. Our commitment to quality means we guarantee the freshness and taste of everything in your Billy's Bag.",
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
                <p className="text-accent">duggerwd@billysbotanicals.com</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Phone Support</p>
                <p className="text-accent">912 727 3098</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQs;
