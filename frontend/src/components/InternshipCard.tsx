import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Clock, Users, Star, Calendar, DollarSign, Eye, Bookmark } from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  formatLocation, 
  formatDuration, 
  formatOrganization, 
  formatTitle, 
  formatMatchPercent,
  formatSkills,
  formatTools,
  formatTags,
  formatCityState,
  formatExperienceLevel,
  formatEducationLevel,
  formatMode,
  fallback
} from '../utils/formatters';

export interface Internship {
  // Core identification
  InternshipID: string;
  Title: string;
  Description?: string;
  
  // Organization and location
  Organisation: string;
  City?: string;
  State?: string;
  Location?: string; // Legacy field for compatibility
  
  // Categorization
  Sector: string;
  Subsector?: string;
  
  // Requirements and skills
  RequiredSkills?: string;
  MatchedSkills: string[];
  EducationLevel?: string;
  ExperienceLevel?: string;
  
  // Work details
  Mode?: string;
  Duration: string;
  Language?: string;
  
  // Compensation and timeline
  Stipend: string;
  StipendFormatted?: string; // New formatted stipend field
  LastDateToApply?: string;
  Deadline?: string; // Legacy field for compatibility
  
  // Tools and tags
  ToolsUsed?: string;
  Tags?: string;
  
  // Matching and scoring
  FinalScore: number;
  MatchPercent: number;
  IsBestMatch?: boolean;
  Reason?: string;
  Explanation?: string; // New explanation field
  CosineSimilarity?: number;
  SkillOverlapScore?: number;
  LocationScore?: number;
  EducationSectorBoost?: number;
  RuralBoost?: number;
  
  // Legacy fields for compatibility
  applications?: number;
  description?: string;
}

interface InternshipCardProps {
  internship: Internship;
  onApply: (internshipId: string) => void;
  onViewDetails?: (internshipId: string) => void;
}

export function InternshipCard({ internship, onApply, onViewDetails }: InternshipCardProps) {
  // Format data using utility functions
  const formattedTitle = formatTitle(internship.Title);
  const formattedOrganization = formatOrganization(internship.Organisation);
  const formattedLocation = internship.City && internship.State 
    ? formatCityState(internship.City, internship.State)
    : formatLocation(internship.Location || '');
  const formattedDuration = formatDuration(internship.Duration);
  const formattedStipend = internship.StipendFormatted || formatCurrency(internship.Stipend);
  const formattedDeadline = formatDate(internship.LastDateToApply || internship.Deadline || '');
  const formattedMatchPercent = formatMatchPercent(internship.MatchPercent);
  const formattedMode = formatMode(internship.Mode || '');
  const formattedEducationLevel = formatEducationLevel(internship.EducationLevel || '');
  const formattedExperienceLevel = formatExperienceLevel(internship.ExperienceLevel || '');
  const formattedLanguage = fallback(internship.Language, 'English');
  const formattedTools = formatTools(internship.ToolsUsed || '');
  const formattedTags = formatTags(internship.Tags || '');
  const formattedRequiredSkills = formatSkills(internship.RequiredSkills || '');

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

  const getMatchBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0';
    if (score >= 75) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0';
    return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Great';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  const isHighMatch = internship.MatchPercent >= 60;
  const isUrgent = formattedDeadline !== 'Rolling' && new Date(internship.Deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 border-0 ${
      isHighMatch ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-white hover:bg-gray-50'
    }`}>
      {/* High match indicator */}
      {isHighMatch && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      )}
      
      {/* Urgent deadline badge */}
      {isUrgent && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-red-500 text-white border-0 animate-pulse">
            ⚡ Urgent
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Sector and Organization */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xl shadow-sm">
                {getSectorIcon(internship.Sector)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                  {formattedTitle}
                </h3>
                <p className="text-muted-foreground font-medium text-sm">{formattedOrganization}</p>
              </div>
            </div>
          </div>
          
          {/* Match Score Badge */}
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getMatchBadgeColor(internship.MatchPercent)} px-3 py-1 shadow-sm`}>
              <Star className="w-3 h-3 mr-1" />
              {formattedMatchPercent}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {getMatchLabel(internship.MatchPercent)} Match
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium truncate">{formattedLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{formattedDuration}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stipend</p>
              <p className="font-semibold text-green-600">{formattedStipend}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mode</p>
              <p className="font-medium">{formattedMode}</p>
            </div>
          </div>
        </div>

        {/* Additional Information Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Education</p>
              <p className="font-medium">{formattedEducationLevel}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-medium">{formattedExperienceLevel}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {internship.Description || internship.description || `Internship opportunity in ${internship.Sector}${internship.Subsector ? ` - ${internship.Subsector}` : ''} sector.`}
          </p>
        </div>

        {/* Explanation */}
        {internship.Explanation && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Why this match:</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 leading-relaxed">
                {internship.Explanation}
              </p>
            </div>
          </div>
        )}

        {/* Skills and Tags */}
        <div className="space-y-3">
          {/* Matched Skills */}
          {internship.MatchedSkills && internship.MatchedSkills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Matched Skills:</p>
              <div className="flex flex-wrap gap-1">
                {internship.MatchedSkills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs py-1 bg-green-50 text-green-700 border-green-200">
                    {skill}
                  </Badge>
                ))}
                {internship.MatchedSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs py-1 bg-gray-50 text-gray-600 border-gray-200">
                    +{internship.MatchedSkills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {formattedRequiredSkills && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {formattedRequiredSkills.split(', ').slice(0, 2).map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs py-1 bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
                ))}
                {formattedRequiredSkills.split(', ').length > 2 && (
                  <Badge variant="outline" className="text-xs py-1 bg-gray-50 text-gray-600 border-gray-200">
                    +{formattedRequiredSkills.split(', ').length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tools Used */}
          {formattedTools && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tools:</p>
              <div className="flex flex-wrap gap-1">
                {formattedTools.split(', ').slice(0, 2).map(tool => (
                  <Badge key={tool} variant="outline" className="text-xs py-1 bg-purple-50 text-purple-700 border-purple-200">
                    {tool}
                  </Badge>
                ))}
                {formattedTools.split(', ').length > 2 && (
                  <Badge variant="outline" className="text-xs py-1 bg-gray-50 text-gray-600 border-gray-200">
                    +{formattedTools.split(', ').length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {formattedTags && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tags:</p>
              <div className="flex flex-wrap gap-1">
                {formattedTags.split(', ').slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs py-1 bg-orange-50 text-orange-700 border-orange-200">
                    {tag}
                  </Badge>
                ))}
                {formattedTags.split(', ').length > 3 && (
                  <Badge variant="outline" className="text-xs py-1 bg-gray-50 text-gray-600 border-gray-200">
                    +{formattedTags.split(', ').length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          {/* Deadline and Language */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
                {formattedDeadline}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Language:</span>
              <span className="font-medium">{formattedLanguage}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(internship.InternshipID)}
                className="group-hover:border-blue-300 group-hover:text-blue-600 transition-colors flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            )}
            <Button 
              onClick={() => onApply(internship.InternshipID)}
              size="sm"
              className={`shadow-sm transition-all duration-200 flex-1 ${
                isHighMatch 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              Apply Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}