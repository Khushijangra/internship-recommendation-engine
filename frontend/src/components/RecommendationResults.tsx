import React from 'react';
import { InternshipCard, Internship } from './InternshipCard';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  formatLocation, 
  formatDuration, 
  formatOrganization, 
  formatTitle, 
  formatMatchPercent 
} from '../utils/formatters';

interface RecommendationResultsProps {
  recommendations: Internship[];
  onBack: () => void;
  onApply: (internshipId: string) => void;
  onViewDetails?: (internshipId: string) => void;
}

export function RecommendationResults({ recommendations, onBack, onApply, onViewDetails }: RecommendationResultsProps) {
  // 🔍 Step 3 — Frontend render verification
  console.log('🔍 RecommendationResults - Render Verification:');
  console.log('[RecommendationResults] Received recommendations:', recommendations);
  console.log('[RecommendationResults] Recommendations count:', recommendations?.length || 0);
  
  // Detailed logging of recommendation structure
  if (recommendations && recommendations.length > 0) {
    console.log('[RecommendationResults] First recommendation structure:');
    const firstRec = recommendations[0];
    console.log('  ✓ InternshipID:', firstRec.InternshipID);
    console.log('  ✓ Title:', firstRec.Title);
    console.log('  ✓ Organisation:', firstRec.Organisation);
    console.log('  ✓ Location:', firstRec.Location);
    console.log('  ✓ Stipend:', firstRec.Stipend);
    console.log('  ✓ Duration:', firstRec.Duration);
    console.log('  ✓ FinalScore:', firstRec.FinalScore);
    console.log('  ✓ Reason:', firstRec.Reason);
    console.log('  ✓ MatchedSkills:', firstRec.MatchedSkills);
    console.log('  ✓ IsBestMatch:', firstRec.IsBestMatch);
    
    // Validate all required fields are present
    const requiredFields = ['InternshipID', 'Title', 'Organisation', 'Location', 'FinalScore', 'Reason'];
    const missingFields = requiredFields.filter(field => !firstRec[field]);
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing required fields in recommendation:', missingFields);
    } else {
      console.log('✅ All required fields present in recommendation');
    }
  } else {
    console.warn('⚠️ No recommendations received or empty array');
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Simple Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onBack}
          className="shrink-0 px-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-2xl mb-2">Your Best Matches</h1>
          <p className="text-muted-foreground text-lg">
            {recommendations.length} internships found for you
          </p>
        </div>
      </div>

      {/* Success Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-green-500 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-green-700 mb-1">Great Job!</h3>
              <p className="text-green-600">We found perfect internships for your skills and interests.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Instructions */}
      <Card className="bg-blue-50 border-l-4 border-l-blue-500">
        <CardContent className="py-4">
          <h3 className="text-blue-700 mb-2">What to do next:</h3>
          <div className="space-y-2 text-blue-600">
            <p>1. Look at each internship below</p>
            <p>2. Click "Apply Now" for ones you like</p>
            <p>3. Apply to 2-3 internships for better chances</p>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Recommendations */}
      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                No internships found. Please try different options.
              </p>
              <Button 
                onClick={onBack} 
                className="mt-4 px-8"
                size="lg"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommendations.map((internship, index) => (
              <div key={internship.InternshipID} className="relative">
                {(internship.IsBestMatch || index === 0) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg font-medium">
                      🏆 Best Match
                    </div>
                  </div>
                )}
                <SimplifiedInternshipCard 
                  internship={internship} 
                  onApply={onApply}
                  onViewDetails={onViewDetails}
                  rank={index + 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified Internship Card Component
interface SimplifiedInternshipCardProps {
  internship: Internship;
  onApply: (internshipId: string) => void;
  onViewDetails?: (internshipId: string) => void;
  rank: number;
}

function SimplifiedInternshipCard({ internship, onApply, onViewDetails, rank }: SimplifiedInternshipCardProps) {
  // Format data using utility functions
  const formattedTitle = formatTitle(internship.Title);
  const formattedOrganization = formatOrganization(internship.Organisation);
  const formattedLocation = formatLocation(internship.Location);
  const formattedDuration = formatDuration(internship.Duration);
  const formattedStipend = formatCurrency(internship.Stipend);
  const formattedDeadline = formatDate(internship.Deadline);
  const formattedMatchPercent = formatMatchPercent(internship.MatchPercent);

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, string> = {
      'Agriculture': '🌾',
      'Technology': '💻',
      'Healthcare': '🏥',
      'Education': '📚',
      'Finance': '💰',
      'Manufacturing': '🏭',
      'Tourism': '✈️',
      'Media': '📺',
      'Energy': '⚡',
      'Government': '🏛️',
      'Research': '🔬',
      'Logistics': '🚚',
      'Real Estate': '🏗️',
      'Consulting': '💼',
      'Environment': '🌱'
    };
    return icons[sector] || '💼';
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const isHighMatch = internship.MatchPercent >= 60;

  return (
    <Card className={`p-6 shadow-lg hover:shadow-xl transition-shadow border-0 ${
      isHighMatch ? 'bg-gradient-to-br from-green-50 to-blue-50 ring-2 ring-green-200' : 'bg-white'
    }`}>
      <CardContent className="p-0 space-y-4">
        {/* Header with rank and match */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
              {rank}
            </div>
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getMatchColor(internship.MatchPercent)}`}>
              {formattedMatchPercent} Match
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl shadow-sm">
            {getSectorIcon(internship.Sector)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {formattedTitle}
            </h3>
            <p className="text-muted-foreground font-medium mb-3">{formattedOrganization}</p>
            
            {/* Key Info - Simple Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">📍 Location</p>
                <p className="font-medium">{formattedLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">💰 Stipend</p>
                <p className="font-medium text-green-600">{formattedStipend}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">⏰ Duration</p>
                <p className="font-medium">{formattedDuration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">📅 Deadline</p>
                <p className="font-medium">{formattedDeadline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onViewDetails(internship.InternshipID)}
              className="flex-1 text-base"
            >
              Read More
            </Button>
          )}
          <Button 
            onClick={() => onApply(internship.InternshipID)}
            size="lg"
            className={`flex-1 text-base font-medium ${
              isHighMatch 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecommendationResults;