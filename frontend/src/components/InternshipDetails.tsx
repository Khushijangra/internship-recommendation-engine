import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  DollarSign,
  Building,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import { Internship } from './InternshipCard';
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

interface InternshipDetailsProps {
  internship: Internship;
  onBack: () => void;
  onApply: (internshipId: string) => void;
}

export function InternshipDetails({ internship, onBack, onApply }: InternshipDetailsProps) {
  const [isApplying, setIsApplying] = useState(false);

  // Format all data using utility functions
  const formattedTitle = formatTitle(internship.Title);
  const formattedOrganization = formatOrganization(internship.Organisation);
  const formattedLocation = internship.City && internship.State 
    ? formatCityState(internship.City, internship.State)
    : formatLocation(internship.Location || '');
  const formattedDuration = formatDuration(internship.Duration);
  const formattedStipend = formatCurrency(internship.Stipend);
  const formattedDeadline = formatDate(internship.LastDateToApply || internship.Deadline || '');
  const formattedMatchPercent = formatMatchPercent(internship.MatchPercent);
  const formattedMode = formatMode(internship.Mode || '');
  const formattedEducationLevel = formatEducationLevel(internship.EducationLevel || '');
  const formattedExperienceLevel = formatExperienceLevel(internship.ExperienceLevel || '');
  const formattedLanguage = fallback(internship.Language, 'English');
  const formattedTools = formatTools(internship.ToolsUsed || '');
  const formattedTags = formatTags(internship.Tags || '');
  const formattedRequiredSkills = formatSkills(internship.RequiredSkills || '');
  const formattedDescription = fallback(internship.Description || internship.description, 'No description available');

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, string> = {
      'agriculture': '🌾',
      'technology': '💻',
      'healthcare': '🏥',
      'education': '📚',
      'finance': '💰',
      'manufacturing': '🏭',
      'tourism': '🏨',
      'media': '📺'
    };
    return icons[sector] || '💼';
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-chart-3 text-white';
    if (score >= 80) return 'bg-chart-2 text-white';
    if (score >= 70) return 'bg-chart-1 text-white';
    return 'bg-muted-foreground text-white';
  };

  const handleApply = async () => {
    setIsApplying(true);
    // Simulate application process
    await new Promise(resolve => setTimeout(resolve, 1500));
    onApply(internship.InternshipID);
    setIsApplying(false);
  };

  // Extended data for detailed view
  const detailedInfo = {
    responsibilities: [
      "Assist in day-to-day operations and project implementation",
      "Support data collection and analysis activities",
      "Participate in team meetings and collaborative projects",
      "Prepare reports and documentation as required",
      "Engage with stakeholders and community members"
    ],
    requirements: [
      "Currently enrolled in relevant academic program",
      "Basic knowledge of computer applications",
      "Good communication skills in English/Hindi",
      "Willingness to learn and adapt",
      "Previous volunteer or internship experience (preferred)"
    ],
    benefits: [
      "Monthly stipend as per government guidelines",
      "Certificate of completion",
      "Hands-on experience in government operations",
      "Networking opportunities with professionals",
      "Skill development and training programs"
    ],
    selectionProcess: [
      { step: "Application Review", completed: false },
      { step: "Document Verification", completed: false },
      { step: "Interview/Assessment", completed: false },
      { step: "Final Selection", completed: false }
    ],
    contactInfo: {
      coordinator: "Dr. Rajesh Kumar",
      email: "coordinator@example.gov.in",
      phone: "+91-11-2345-6789",
      website: "https://pminternship.gov.in"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Internship Header */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getSectorIcon(internship.Sector)}</span>
                      <div>
                        <h1 className="text-2xl font-bold mb-1">{formattedTitle}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="w-4 h-4" />
                          <span className="font-medium">{formattedOrganization}</span>
                        </div>
                        {internship.Subsector && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {internship.Subsector}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getMatchBadgeColor(internship.MatchPercent)} text-lg px-3 py-1`}>
                    <Star className="w-4 h-4 mr-1" />
                    {formattedMatchPercent} Match
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{formattedLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{formattedDuration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Stipend</p>
                      <p className="font-medium text-emerald-600">{formattedStipend}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{formattedDeadline}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About This Internship
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {formattedDescription}
                </p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Key Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {detailedInfo.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-chart-3 mt-1 shrink-0" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Requirements & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {detailedInfo.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-chart-1 mt-1 shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Benefits & Learning Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {detailedInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-chart-2 mt-1 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements and Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Requirements & Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Education Level</h4>
                    <Badge variant="outline" className="text-sm">
                      {formattedEducationLevel}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Experience Level</h4>
                    <Badge variant="outline" className="text-sm">
                      {formattedExperienceLevel}
                    </Badge>
                  </div>
                </div>
                
                {formattedRequiredSkills && (
                  <div>
                    <h4 className="font-semibold mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {formattedRequiredSkills.split(', ').map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {internship.MatchedSkills && internship.MatchedSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">Your Matched Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {internship.MatchedSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Mode</h4>
                    <Badge variant="outline" className="text-sm">
                      {formattedMode}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Language</h4>
                    <Badge variant="outline" className="text-sm">
                      {formattedLanguage}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Duration</h4>
                    <Badge variant="outline" className="text-sm">
                      {formattedDuration}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools and Tags */}
            {(formattedTools || formattedTags) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Tools & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formattedTools && (
                    <div>
                      <h4 className="font-semibold mb-2">Tools Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {formattedTools.split(', ').map(tool => (
                          <Badge key={tool} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formattedTags && (
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {formattedTags.split(', ').map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Why You Were Recommended */}
            {internship.Reason && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Why You Were Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {internship.Reason}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Application Deadline:</span>
                    <span className="font-medium">{formattedDeadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Match Score:</span>
                    <span className="font-medium text-emerald-600">{formattedMatchPercent}</span>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={handleApply} 
                  className="w-full" 
                  size="lg"
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Apply for This Internship'
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Free to apply • No application fee • Quick process
                </p>
              </CardContent>
            </Card>

            {/* Selection Process */}
            <Card>
              <CardHeader>
                <CardTitle>Selection Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailedInfo.selectionProcess.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed ? 'bg-chart-3 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={step.completed ? 'text-chart-3 font-medium' : ''}>{step.step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="font-medium">{detailedInfo.contactInfo.coordinator}</p>
                  <p className="text-sm text-muted-foreground">Program Coordinator</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{detailedInfo.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{detailedInfo.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-blue-600">{detailedInfo.contactInfo.website}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Match */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {internship.MatchedSkills && internship.MatchedSkills.length > 0 ? (
                    internship.MatchedSkills.map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                        <span className="text-xs text-chart-3 font-medium">Match</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No matched skills available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternshipDetails;