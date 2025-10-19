"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Check, Loader2, Globe, Zap, Target, Palette, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const steps = [
  { id: "info", title: "Your Info" },
  { id: "goals", title: "Your Goals" },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  interests: string[];
  specificFocus: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export default function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    businessType: "",
    interests: [],
    specificFocus: "",
  });

  const updateFormData = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest: string) =>
    setFormData((prev) => {
      const interests = [...prev.interests];
      return interests.includes(interest)
        ? { ...prev, interests: interests.filter((i) => i !== interest) }
        : { ...prev, interests: [...interests, interest] };
    });

  const nextStep = () => currentStep < steps.length - 1 && setCurrentStep((p) => p + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep((p) => p - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/profit-plan/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('Submission successful:', result.id);
      
      // Optional: Fire analytics
      // window.gtag?.('event', 'profit_plan_submitted');
      // window.posthog?.capture?.('profit_plan_submitted');
      
      toast.success("Form submitted successfully!");
      
      setTimeout(() => {
        router.push("/profit-plan/success");
      }, 900);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
      case 1:
        return formData.interests.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      {/* Go Back Home Button - Hidden since it's now in the page header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'none' }}
      >
        <Link href="/">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back Home
          </Button>
        </Link>
      </motion.div>

      {/* Progress */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-4">
          {steps.map((step, index) => (
            <motion.div key={index} className="flex items-center">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  index <= currentStep
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {index + 1}
              </motion.div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-16 h-1 mx-2 rounded-full transition-all duration-300",
                  index < currentStep ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gray-200"
                )} />
              )}
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-sm font-medium text-white/80">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </span>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl bg-gray-900/20">
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial="hidden" animate="visible" exit="exit" variants={contentVariants}>
                {/* Step 1 - Your Info */}
                {currentStep === 0 && (
                  <>
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl font-bold text-white mb-2">
                        Tell Us About You
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base">
                        We'll use this info to tailor your AI Profit Plan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-white/90">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => updateFormData("name", e.target.value)}
                          className="h-12 rounded-xl border-2 border-gray-600/50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-base bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
                        />
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-white/90">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className="h-12 rounded-xl border-2 border-gray-600/50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-base bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
                        />
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-white/90">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 555-555-5555"
                          value={formData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value)}
                          className="h-12 rounded-xl border-2 border-gray-600/50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-base bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
                        />
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="businessType" className="text-sm font-semibold text-white/90">
                          Business Type
                        </Label>
                        <Select value={formData.businessType} onValueChange={(v) => updateFormData("businessType", v)}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-gray-600/50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-base bg-gray-800/50 backdrop-blur-sm text-white">
                            <SelectValue placeholder="Select your business type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="ecommerce" className="text-white hover:bg-gray-700">E-commerce</SelectItem>
                            <SelectItem value="agency" className="text-white hover:bg-gray-700">Agency</SelectItem>
                            <SelectItem value="local-business" className="text-white hover:bg-gray-700">Local Business</SelectItem>
                            <SelectItem value="saas" className="text-white hover:bg-gray-700">SaaS</SelectItem>
                            <SelectItem value="freelancer" className="text-white hover:bg-gray-700">Freelancer</SelectItem>
                            <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 2 - Your Goals */}
                {currentStep === 1 && (
                  <>
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl font-bold text-white mb-2">
                        What Do You Want to Achieve?
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base">
                        Select the areas where AI can grow your business.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8">
                      <motion.div variants={fadeInUp} className="space-y-4">
                        <Label className="text-sm font-semibold text-white/90">
                          What are you interested in? *
                        </Label>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: "website-optimization", label: "Website Optimization", icon: Globe },
                            { id: "ai-automation", label: "AI Automation", icon: Zap },
                            { id: "marketing-strategy", label: "Marketing Strategy", icon: Target },
                            { id: "branding-design", label: "Branding & Design", icon: Palette },
                            { id: "lead-generation", label: "Lead Generation", icon: Users },
                          ].map((interest, i) => (
                            <motion.div
                              key={interest.id}
                              className={cn(
                                "flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-300",
                                formData.interests.includes(interest.id)
                                  ? "border-orange-500 bg-orange-500/20 shadow-md"
                                  : "border-gray-600/50 hover:border-orange-400/50 hover:bg-gray-800/30"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 * i, duration: 0.3 } }}
                              onClick={() => toggleInterest(interest.id)}
                            >
                              <Checkbox
                                id={interest.id}
                                checked={formData.interests.includes(interest.id)}
                                onCheckedChange={() => toggleInterest(interest.id)}
                                className="cursor-pointer"
                              />
                              <interest.icon className="h-5 w-5 text-gray-300" />
                              <Label 
                                htmlFor={interest.id} 
                                className="cursor-pointer w-full select-none text-base font-medium text-white"
                              >
                                {interest.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="specificFocus" className="text-sm font-semibold text-white/90">
                          Anything specific you'd like us to focus on?
                        </Label>
                        <Textarea
                          id="specificFocus"
                          placeholder="Tell us more about your specific needs or goals..."
                          value={formData.specificFocus}
                          onChange={(e) => updateFormData("specificFocus", e.target.value)}
                          className="min-h-[100px] rounded-xl border-2 border-gray-600/50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-base resize-none bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <CardFooter className="flex justify-between pt-8 pb-6 px-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 0} 
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-base font-medium border-2 border-gray-600/50 hover:border-gray-500 text-white hover:bg-gray-800/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                >
                  Back
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-2 rounded-xl px-8 py-3 text-base font-medium bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> 
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      {currentStep === steps.length - 1 ? "Generate My Plan" : "Next"}
                      {currentStep === steps.length - 1 ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

