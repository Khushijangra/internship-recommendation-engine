import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Map, 
  Home, 
  User, 
  Search, 
  FileText, 
  HelpCircle, 
  MessageCircle,
  X,
  ChevronRight
} from 'lucide-react';

interface SiteMapProps {
  onNavigate: (page: string) => void;
}

interface SiteMapItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: SiteMapItem[];
}

const siteMapData: SiteMapItem[] = [
  {
    id: 'home',
    title: 'Home',
    description: 'Main landing page with hero section and overview',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'profile',
    title: 'Profile Setup',
    description: 'Create and manage your candidate profile',
    icon: <User className="w-5 h-5" />,
    children: [
      {
        id: 'profile-form',
        title: 'Profile Form',
        description: 'Fill in your skills, education, and preferences',
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: 'profile-settings',
        title: 'Profile Settings',
        description: 'Update your profile information and preferences',
        icon: <User className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    description: 'View personalized internship recommendations',
    icon: <Search className="w-5 h-5" />,
    children: [
      {
        id: 'recommendation-results',
        title: 'Recommendation Results',
        description: 'Browse and filter recommended internships',
        icon: <Search className="w-4 h-4" />,
      },
      {
        id: 'internship-details',
        title: 'Internship Details',
        description: 'View detailed information about specific internships',
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'applications',
    title: 'My Applications',
    description: 'Track your submitted internship applications',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Get help and support for using the platform',
    icon: <HelpCircle className="w-5 h-5" />,
    children: [
      {
        id: 'chatbot',
        title: 'AI Assistant',
        description: 'Chat with our AI assistant for instant help',
        icon: <MessageCircle className="w-4 h-4" />,
      },
      {
        id: 'faq',
        title: 'FAQ',
        description: 'Frequently asked questions and answers',
        icon: <HelpCircle className="w-4 h-4" />,
      },
    ],
  },
];

export function SiteMap({ onNavigate }: SiteMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: SiteMapItem) => {
    if (item.children) {
      toggleExpanded(item.id);
    } else {
      onNavigate(item.id);
      setIsOpen(false);
    }
  };

  const renderSiteMapItem = (item: SiteMapItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            hasChildren
              ? 'hover:bg-gray-100'
              : 'hover:bg-blue-50 hover:text-blue-700'
          }`}
          onClick={() => handleItemClick(item)}
        >
          <div className="flex-shrink-0 text-gray-600">
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          </div>
          {hasChildren && (
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children!.map((child) => renderSiteMapItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        <Map className="w-6 h-6" />
      </Button>

      {/* Site Map Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Site Map
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              {siteMapData.map((item) => renderSiteMapItem(item))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
