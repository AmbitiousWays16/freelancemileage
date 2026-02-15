import { Car, FileText, DollarSign, Calculator, MapPin, Clock, Shield, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FeaturesOverview = () => {
  const features = [
    {
      icon: Car,
      title: 'Intelligent Mileage Tracking',
      description: 'Automatically track and log business miles with precision. Our advanced route calculation system integrates with Google Maps to provide accurate mileage for every trip, ensuring IRS-compliant documentation for maximum tax deductions.'
    },
    {
      icon: FileText,
      title: 'Professional Invoice Generation',
      description: 'Generate polished, professional invoices instantly from your mileage logs. Customize with your company logo and branding, and export to PDF for seamless billing. Perfect for freelancers, contractors, and small business owners who need to bill clients for travel expenses.'
    },
    {
      icon: DollarSign,
      title: 'Maximize Tax Deductions',
      description: 'Leverage the IRS standard mileage rate to calculate your deductions automatically. MileTrack keeps your records organized and audit-ready, helping you claim every penny you deserve at tax time. Our 2025-compliant calculations ensure accuracy for business travel deductions.'
    },
    {
      icon: Calculator,
      title: 'Expense Management',
      description: 'Track gas expenses, upload receipts, and manage all your vehicle-related costs in one place. Premium users can monitor fuel efficiency, calculate cost per mile, and gain insights into their business travel spending patterns.'
    },
    {
      icon: MapPin,
      title: 'Route Visualization',
      description: 'View detailed maps of your traveled routes with start and end point markers. Our integrated mapping system provides visual confirmation of your trips and generates map images for your records and invoices.'
    },
    {
      icon: Clock,
      title: 'Monthly Archive System',
      description: 'Organize trips by month for easy access and reporting. Archive past months while keeping current data at your fingertips. Perfect for quarterly reviews, annual tax preparation, or client billing cycles.'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Your data is protected with enterprise-grade security. All information is securely stored and backed up, ensuring your mileage logs are safe and accessible when you need them. Built with privacy and compliance in mind.'
    },
    {
      icon: Smartphone,
      title: 'Access Anywhere',
      description: 'Log trips on the go from any device. MileTrack works seamlessly on desktop, tablet, and mobile, so you can track mileage whether you are in the office or on the road. No app download required—just sign in and go.'
    }
  ];

  return (
    <section className="w-full bg-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Comprehensive Mileage Tracking for Modern Professionals
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            MileTrack is the ultimate mileage tracker and invoicing tool designed specifically for independent contractors, 
            freelancers, rideshare drivers, delivery professionals, and small business owners. Whether you're tracking miles 
            for tax deductions, client billing, or business expense reporting, MileTrack simplifies the entire process.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center space-y-4 bg-card border border-border rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-foreground">
            Why Choose MileTrack?
          </h3>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built by professionals for professionals, MileTrack understands the unique needs of independent workers. 
            From real estate agents logging property visits to consultants tracking client meetings, from rideshare drivers 
            documenting daily routes to delivery professionals managing multiple stops—MileTrack handles it all with ease. 
            Our platform eliminates the headache of manual mileage logs, lost receipts, and complicated spreadsheets. 
            With automated route calculations, IRS-compliant reporting, and professional invoice generation, you can focus 
            on your work while we handle the details. Join thousands of independent contractors who trust MileTrack to 
            maximize their tax deductions and streamline their business operations.
          </p>

        </div>
      </div>
    </section>
  );
};
