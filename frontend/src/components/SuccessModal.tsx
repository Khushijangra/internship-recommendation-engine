import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Award, Star, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'registration' | 'application' | 'profile_complete';
  data?: {
    internshipTitle?: string;
    organizationName?: string;
    nextSteps?: string[];
  };
}

export function SuccessModal({ isOpen, onClose, type, data }: SuccessModalProps) {
  const getModalContent = () => {
    switch (type) {
      case 'registration':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: "Registration Successful! 🎉",
          description: "Welcome to the PM Internship Scheme platform! Your profile has been created successfully.",
          nextSteps: [
            "Complete your profile with detailed information",
            "Browse and apply for relevant internships",
            "Check your notifications for updates",
            "Contact support if you need any assistance"
          ]
        };
      
      case 'application':
        return {
          icon: <Award className="w-16 h-16 text-blue-500" />,
          title: "Application Submitted Successfully! 🚀",
          description: `Your application for "${data?.internshipTitle}" at ${data?.organizationName} has been submitted.`,
          nextSteps: data?.nextSteps || [
            "You will receive an acknowledgment email shortly",
            "Track your application status in your dashboard",
            "Prepare for potential interviews or assessments",
            "Continue applying to other relevant positions"
          ]
        };
      
      case 'profile_complete':
        return {
          icon: <Star className="w-16 h-16 text-purple-500" />,
          title: "Profile Updated Successfully! ✨",
          description: "Your profile information has been updated. This will help us provide better internship recommendations.",
          nextSteps: [
            "Review your updated recommendations",
            "Apply to newly matched internships",
            "Keep your profile updated regularly",
            "Set up notification preferences"
          ]
        };
      
      default:
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: "Success!",
          description: "Your action was completed successfully.",
          nextSteps: []
        };
    }
  };

  const content = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {content.icon}
          </div>
          <DialogTitle className="text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {content.nextSteps.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3 text-center">What's Next?</h4>
                <ul className="space-y-2">
                  {content.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button onClick={onClose} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SuccessModal;