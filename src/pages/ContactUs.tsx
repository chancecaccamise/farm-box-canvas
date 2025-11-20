import { ContactForm } from "@/components/ContactForm";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-fresh py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about our farm bags, delivery, or anything else? We're here to help!
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactUs;
