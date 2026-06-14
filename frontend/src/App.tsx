import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import {
  Brain,
  Sparkles,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  IndianRupee,
  Phone,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
// PM Modi image with white background
import pmModiImage from "figma:asset/24e077d7ecb4971527095dba28b8281638dbdb2a.png";
import nationalEmblemColorful from "figma:asset/076c1fce40e331fa68b90d505a199e1f328ef0d4.png";
// Hero slideshow images
import heroImage1 from "figma:asset/e1de816d161fe18e9b7b866a169efd449581ee95.png";
import heroImage2 from "figma:asset/69abdf35ad1b7c7893a773c0be20878013936dc2.png";
import heroImage3 from "figma:asset/10c79baa4be2ef5c68093f30fe4340d0d432847f.png";
import heroImage4 from "figma:asset/a74d9f0fc3730614d9354642f09129fa06bd1c19.png";
import heroImage5 from "figma:asset/a8ae913845f36c6465ceb5998f0f90c91e29b0ba.png";
import heroImage6 from "figma:asset/396ae6e8c9df0921816aa4dd790d94d78990facb.png";

// Import components directly
import { CandidateProfileForm } from "./components/CandidateProfileForm";
import { RecommendationResults } from "./components/RecommendationResults";
import { InternshipDetails } from "./components/InternshipDetails";
import { ProfileSettings } from "./components/ProfileSettings";
import { SuccessModal } from "./components/SuccessModal";
import { SubmittedApplications } from "./components/SubmittedApplications";
import { AuthModal } from "./components/AuthModal";
import { Navbar } from "./components/Navbar";
import { GoogleTranslate } from "./components/GoogleTranslate";
import { SiteMap } from "./components/SiteMap";
import { Chatbot, ChatbotButton } from "./components/Chatbot";
import { ProfilePictureUpload } from "./components/ProfilePictureUpload";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ApplicationsProvider, useApplications } from "./contexts/ApplicationsContext";
// Removed mock engine; will fetch from backend

interface Internship {
  id: string;
  title: string;
  organization: string;
  location: string;
  stipend: string;
  duration: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  sector: string;
  type: string;
  skills: string[];
  eligibility: string[];
  applicationProcess: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  matchReason: string;
  matchScore: number;
  isBestMatch?: boolean;
}

interface CandidateProfile {
  EducationLevel: string;
  Location: string;
  SectorInterest: string;
  Skills: string;
  Mode: string;
  Language: string;
  ExperienceLevel: string;
}

interface User {
  name: string;
  email: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface SubmittedApplication {
  id: string;
  internshipTitle: string;
  organization: string;
  location: string;
  appliedDate: string;
  status:
    | "pending"
    | "under-review"
    | "accepted"
    | "rejected"
    | "withdrawn";
  deadline: string;
  stipend: string;
  sector: string;
}

type AppView =
  | "welcome"
  | "form"
  | "results"
  | "internship-details"
  | "profile-settings"
  | "submitted-applications"
  | "guidelines";

function AppContent() {
  const { user, logout } = useAuth();
  const { addApplication, applications } = useApplications();
  const [currentView, setCurrentView] =
    useState<AppView>("welcome");
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [recommendations, setRecommendations] = useState<
    Internship[]
  >([]);
  const [selectedInternship, setSelectedInternship] =
    useState<Internship | null>(null);
  const [submittedApps, setSubmittedApps] = useState<
    SubmittedApplication[]
  >([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  // Hero slideshow images
  const heroImages = [
    {
      src: heroImage1,
      alt: "AI-powered technology and virtual reality in modern workspace",
    },
    {
      src: heroImage2,
      alt: "Software developer coding and programming for digital innovation",
    },
    {
      src: heroImage3,
      alt: "Industrial engineering and manufacturing technology internship",
    },
    {
      src: heroImage4,
      alt: "Smart agriculture and farming technology with AI integration",
    },
    {
      src: heroImage5,
      alt: "Offshore engineering and marine technology internship",
    },
    {
      src: heroImage6,
      alt: "Healthcare and medical research team collaboration",
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "registration" | "application" | "profile_complete";
    data?: any;
  }>({
    isOpen: false,
    type: "registration",
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hero slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % heroImages.length,
      );
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Static notifications
  const notifications = useMemo(
    () => [
      {
        id: "1",
        title: "New Internship Match",
        message:
          "We found 3 new internships that match your profile",
        time: "2 hours ago",
        read: false,
      },
      {
        id: "2",
        title: "Application Deadline Reminder",
        message:
          "Your application for Digital India Initiative is due in 2 days",
        time: "1 day ago",
        read: false,
      },
      {
        id: "3",
        title: "Profile Update Suggestion",
        message:
          "Add more skills to get better recommendations",
        time: "3 days ago",
        read: true,
      },
    ],
    [],
  );

  const [dynamicNotifications, setDynamicNotifications] =
    useState<Notification[]>([]);
  const allNotifications = useMemo(
    () => [...dynamicNotifications, ...notifications],
    [dynamicNotifications, notifications],
  );

  const handleProfileSubmitOld = useCallback(
    async (profile: CandidateProfile) => {
      setCandidateProfile(profile);
      setIsLoading(true);
      // Use the profile data directly as it already matches backend schema
      const payload = {
        EducationLevel: profile.EducationLevel,
        Skills: profile.Skills,
        SectorInterest: profile.SectorInterest,
        Location: profile.Location,
        Mode: profile.Mode,
        Language: profile.Language,
        ExperienceLevel: profile.ExperienceLevel,
      };
      try {
        // 🔍 Step 2 — Frontend payload check (App.tsx level)
        console.log('🔍 App.tsx - API Request Logging:');
        console.log('[Recommend] Request payload:', payload);
        console.log('[Recommend] Payload structure validation:');
        console.log('  ✓ EducationLevel:', payload.EducationLevel);
        console.log('  ✓ Skills:', payload.Skills);
        console.log('  ✓ SectorInterest:', payload.SectorInterest);
        console.log('  ✓ Location:', payload.Location);
        console.log('  ✓ Mode:', payload.Mode);
        console.log('  ✓ Language:', payload.Language);
        console.log('  ✓ ExperienceLevel:', payload.ExperienceLevel);
        
        const response = await fetch('http://localhost:8000/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 App.tsx - API Response Logging:');
        console.log('[Recommend] Response data:', data);
        console.log('[Recommend] Recommendations count:', data.recommendations?.length || 0);
        console.log('[Recommend] User profile in response:', data.user_profile);
        const recs = (data?.recommendations || []).map((r: any, idx: number) => ({
          InternshipID: String(r.InternshipID ?? r.id ?? idx + 1),
          Title: r.Title ?? 'Internship Position',
          Description: r.Description ?? '',
          Organisation: r.Organisation ?? r.Organization ?? 'Not specified',
          City: r.City ?? '',
          State: r.State ?? '',
          Location: r.Location ?? 'Remote/Not specified',
          Sector: r.Sector ?? 'general',
          Subsector: r.Subsector ?? '',
          RequiredSkills: r.RequiredSkills ?? '',
          EducationLevel: r.EducationLevel ?? '',
          ExperienceLevel: r.ExperienceLevel ?? '',
          Mode: r.Mode ?? '',
          Duration: r.Duration ?? '1-3 months',
          Language: r.Language ?? 'English',
          Stipend: r.Stipend ?? 'Unpaid',
          StipendFormatted: r.StipendFormatted ?? r.Stipend ?? '₹0 (Unpaid)',
          ToolsUsed: r.ToolsUsed ?? '',
          Tags: r.Tags ?? '',
          LastDateToApply: r.LastDateToApply ?? r.Deadline ?? 'Rolling basis',
          Deadline: r.Deadline ?? 'Rolling basis',
          MatchedSkills: r.MatchedSkills ?? r.Skills ?? [],
          FinalScore: Number(r.FinalScore ?? 0),
          MatchPercent: Number(r.MatchPercent ?? r.FinalScore * 100 ?? 0),
          IsBestMatch: r.IsBestMatch ?? (idx === 0),
          Reason: r.Reason ?? '',
          Explanation: r.Explanation ?? '',
          // Legacy fields for compatibility
          id: String(r.InternshipID ?? r.id ?? idx + 1),
          title: r.Title ?? 'Internship Position',
          organization: r.Organisation ?? r.Organization ?? 'Not specified',
          location: r.Location ?? 'Remote/Not specified',
          stipend: r.Stipend ?? 'Unpaid',
          duration: r.Duration ?? '1-3 months',
          deadline: r.Deadline ?? 'Rolling basis',
          description: r.Description ?? (r.Reason || ''),
          requirements: r.Requirements ?? [],
          benefits: r.Benefits ?? [],
          sector: r.Sector ?? 'general',
          type: r.Type ?? 'internship',
          skills: r.MatchedSkills ?? r.Skills ?? [],
          eligibility: r.Eligibility ?? [],
          applicationProcess: r.ApplicationProcess ?? [],
          contactInfo: { email: '', phone: '', website: '' },
          matchReason: r.Reason ?? '',
          matchScore: Number(r.MatchPercent ?? r.FinalScore * 100 ?? 0),
          isBestMatch: r.IsBestMatch ?? (idx === 0),
        }));
        // 🔍 Step 3 — Frontend render verification
        console.log('🔍 App.tsx - Transformation Logging:');
        console.log('[Recommend] Transformed recommendations:', recs);
        console.log('[Recommend] First recommendation details:');
        if (recs.length > 0) {
          const firstRec = recs[0];
          console.log('  ✓ InternshipID:', firstRec.InternshipID);
          console.log('  ✓ Title:', firstRec.Title);
          console.log('  ✓ Organisation:', firstRec.Organisation);
          console.log('  ✓ Location:', firstRec.Location);
          console.log('  ✓ Stipend:', firstRec.Stipend);
          console.log('  ✓ Duration:', firstRec.Duration);
          console.log('  ✓ MatchPercent:', firstRec.MatchPercent);
          console.log('  ✓ MatchedSkills:', firstRec.MatchedSkills);
          console.log('  ✓ Reason:', firstRec.Reason);
          console.log('  ✓ IsBestMatch:', firstRec.IsBestMatch);
        }
        console.log('[Recommend] Setting recommendations state with count:', recs.length);
        setRecommendations(recs);
        setCurrentView('results');
        toast.success(`Found ${recs.length} personalized recommendations for you!`);
        setModalState({ isOpen: true, type: 'profile_complete', data: {} });
      } catch (err) {
        console.error('[Recommend] Error fetching recommendations:', err);
        toast.error(`Failed to get recommendations: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleApplyOld = useCallback(
    (internshipId: string) => {
      const internship = recommendations.find(
        (i) => i.id === internshipId,
      );
      if (internship) {
        const newApplication: SubmittedApplication = {
          id: Date.now().toString(),
          internshipTitle: internship.title,
          organization: internship.organization,
          location: internship.location,
          appliedDate: new Date().toLocaleDateString(),
          status: "pending",
          deadline: internship.deadline,
          stipend: internship.stipend,
          sector: internship.sector,
        };

        setSubmittedApps((prev) => [newApplication, ...prev]);
        toast.success(
          `Application submitted for ${internship.title}!`,
        );

        setModalState({
          isOpen: true,
          type: "application",
          data: {
            internshipTitle: internship.title,
            organizationName: internship.organization,
            nextSteps: [
              "You will receive an acknowledgment email shortly",
              "Track your application status in your dashboard",
              "Prepare for potential interviews or assessments",
              "Continue applying to other relevant positions",
            ],
          },
        });

        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "Application Submitted",
          message: `Your application for ${internship.title} has been submitted successfully`,
          time: "Just now",
          read: false,
        };
        setDynamicNotifications((prev) => [
          newNotification,
          ...prev,
        ]);
      }
    },
    [recommendations],
  );

  const handleWithdrawApplication = useCallback(
    (applicationId: string) => {
      setSubmittedApps((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: "withdrawn" as const }
            : app,
        ),
      );

      const application = submittedApps.find(
        (app) => app.id === applicationId,
      );
      if (application) {
        toast.success(
          `Application for ${application.internshipTitle} has been withdrawn`,
        );
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "Application Withdrawn",
          message: `Your application for ${application.internshipTitle} has been withdrawn`,
          time: "Just now",
          read: false,
        };
        setDynamicNotifications((prev) => [
          newNotification,
          ...prev,
        ]);
      }
    },
    [submittedApps],
  );

  const handleViewDetailsOld = useCallback(
    (internshipId: string) => {
      const internship = recommendations.find(
        (i) => i.id === internshipId,
      );
      if (internship) {
        setSelectedInternship(internship);
        setCurrentView("internship-details");
      }
    },
    [recommendations],
  );

  const handleBack = useCallback(() => {
    setCurrentView("results");
  }, []);

  const handleStartForm = useCallback(() => {
    setCurrentView("form");
  }, []);

  const handleStartJourney = useCallback(() => {
    if (user) {
      // User is logged in - go directly to profile form
      setCurrentView("form");
    } else {
      // User is not logged in - open registration modal
      setAuthModalOpen(true);
    }
  }, [user]);

  const handleProfileSettings = useCallback(() => {
    setCurrentView("profile-settings");
  }, []);

  const handleSubmittedApplications = useCallback(() => {
    setCurrentView("submitted-applications");
  }, []);

  const handleEligibilityClick = useCallback(() => {
    const eligibilitySection = document.getElementById(
      "eligibility-section",
    );
    if (eligibilitySection) {
      eligibilitySection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleGuidelinesClick = useCallback(() => {
    setCurrentView("guidelines");
  }, []);

  const handleHomeClick = useCallback(() => {
    setCurrentView("welcome");
  }, []);

  const handleSupportClick = useCallback(() => {
    // Link to official MCA helpline resources
    window.open(
      "https://www.mca.gov.in/content/mca/global/en/home.html",
      "_blank",
    );
    toast.info("Redirecting to official MCA support resources");
  }, []);

  const fetchRecommendations = useCallback(async (profile: CandidateProfile) => {
    try {
      const response = await fetch('/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch recommendations. Please try again.');
    }
  }, []);

  const handleProfileSubmit = useCallback(async (profile: CandidateProfile) => {
    try {
      // Store the profile data
      setCandidateProfile(profile);
      
      // Show success message
      toast.success("Profile updated successfully!");
      
      // Navigate to results view
      setCurrentView("results");
      
      // Fetch recommendations based on the profile
      await fetchRecommendations(profile);
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  }, [fetchRecommendations]);

  const handleProfileSaveOld = useCallback((profileData: any) => {
    // Update the candidate profile with new data
    const updatedProfile: CandidateProfile = {
      EducationLevel: profileData.education || candidateProfile?.EducationLevel || '',
      Location: profileData.location || candidateProfile?.Location || '',
      SectorInterest: profileData.sector || candidateProfile?.SectorInterest || '',
      Skills: profileData.skills?.join(', ') || candidateProfile?.Skills || '',
      Mode: profileData.mode || candidateProfile?.Mode || '',
      Language: profileData.language || candidateProfile?.Language || '',
      ExperienceLevel: profileData.experience || candidateProfile?.ExperienceLevel || ''
    };
    
    setCandidateProfile(updatedProfile);
    toast.success("Profile saved successfully!");
  }, [candidateProfile]);

  const handleApply = useCallback(async (internshipId: string) => {
    if (!user) {
      toast.error('Please sign in to apply for internships');
      setAuthModalOpen(true);
      return;
    }

    // Find the internship from recommendations
    const internship = recommendations.find(rec => rec.InternshipID === internshipId);
    if (!internship) {
      toast.error('Internship not found');
      return;
    }

    try {
      // Create application object for Supabase
      const application = {
        user_id: user.uid,
        internship_id: internshipId,
        internship_title: internship.Title || 'Unknown Title',
        organization: internship.Organisation || 'Unknown Organization',
        status: 'applied' as const,
        notes: 'Applied through InternMatch'
      };

      // Use the applications context to save to Supabase
      await addApplication(application);
      
      // Show success modal
      setModalState({
        isOpen: true,
        type: 'application',
        data: {
          internshipTitle: internship.Title || 'Unknown Title',
          organizationName: internship.Organisation || 'Unknown Organization',
          nextSteps: [
            'Check your email for confirmation',
            'View application status in My Applications',
            'Prepare for potential interviews'
          ]
        }
      });
      
    } catch (error) {
      console.error('Error applying for internship:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  }, [user, recommendations, addApplication]);

  const handleViewDetails = useCallback((internshipId: string) => {
    const internship = recommendations.find(rec => rec.InternshipID === internshipId);
    if (internship) {
      setSelectedInternship(internship);
      setCurrentView('internship-details');
    }
  }, [recommendations]);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  }, []);

  const handleRegister = useCallback((user: User) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  }, []);

  // Helper function to render SiteMap and Chatbot on all pages
  const renderGlobalComponents = () => (
    <>
      <SiteMap onNavigate={(page) => {
        console.log('Navigate to:', page);
        
        switch (page) {
          case 'home':
            setCurrentView('welcome');
            toast.success('Navigated to Home');
            break;
          case 'profile':
            if (user) {
              setCurrentView('profile-settings');
              toast.success('Navigated to Profile Settings');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to access your profile');
            }
            break;
          case 'recommendations':
            if (user) {
              setCurrentView('results');
              toast.success('Navigated to Recommendations');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to view recommendations');
            }
            break;
          case 'applications':
            if (user) {
              setCurrentView('submitted-applications');
              toast.success('Navigated to My Applications');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to view your applications');
            }
            break;
          case 'profile-form':
            if (user) {
              setCurrentView('form');
              toast.success('Navigated to Profile Form');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to create your profile');
            }
            break;
          case 'internship-details':
            if (recommendations.length > 0) {
              setCurrentView('results');
              toast.success('Navigated to Internship Details');
            } else {
              setCurrentView('welcome');
              toast.info('No internships available. Please create your profile first.');
            }
            break;
          case 'guidelines':
            setCurrentView('guidelines');
            toast.success('Navigated to Guidelines');
            break;
          case 'ai-assistant':
            setIsChatbotOpen(true);
            toast.success('AI Assistant opened');
            break;
          default:
            console.warn('Unknown navigation page:', page);
            toast.error('Navigation page not found');
            break;
        }
      }} />
      
      <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </>
  );

  const handleProfileSave = useCallback((profileData: any) => {
    toast.success("Profile updated successfully!");
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: "Profile Updated",
      message:
        "Your profile has been updated and recommendations refreshed",
      time: "Just now",
      read: false,
    };
    setDynamicNotifications((prev) => [
      newNotification,
      ...prev,
    ]);
    setCurrentView("results");
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Render different views
  if (currentView === "form") {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar
          notifications={allNotifications}
          onProfileClick={handleProfileSettings}
          onSubmittedApplicationsClick={
            handleSubmittedApplications
          }
          onHomeClick={handleHomeClick}
          onEligibilityClick={handleEligibilityClick}
          onGuidelinesClick={handleGuidelinesClick}
          onLoginClick={() => setAuthModalOpen(true)}
          onRegisterClick={() => setAuthModalOpen(true)}
          currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
          submittedApplicationsCount={applications.length}
        />
        <div
          className="py-12"
          style={{
            background:
              "linear-gradient(135deg, #1E40AF 0%, #6366f1 100%)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-white mb-2 text-3xl font-bold">
              Build Your Smart Profile
            </h1>
            <p className="text-white/80 text-lg">
              Help our AI understand you better for perfect
              internship matches
            </p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <CandidateProfileForm
            onSubmit={handleProfileSubmit}
          />
        </div>
        <SuccessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        
        {/* Global Components - Available on all pages */}
        {renderGlobalComponents()}
      </div>
    );
  }

  console.log('[App] Current view:', currentView);
  console.log('[App] Recommendations count:', recommendations.length);
  
  if (currentView === "results") {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar
          notifications={allNotifications}
          onProfileClick={handleProfileSettings}
          onSubmittedApplicationsClick={
            handleSubmittedApplications
          }
          onHomeClick={handleHomeClick}
          onEligibilityClick={handleEligibilityClick}
          onGuidelinesClick={handleGuidelinesClick}
          onLoginClick={() => setAuthModalOpen(true)}
          onRegisterClick={() => setAuthModalOpen(true)}
          currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
          submittedApplicationsCount={applications.length}
        />
        <div
          className="py-12"
          style={{
            background:
              "linear-gradient(135deg, #1E40AF 0%, #6366f1 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-white mb-2 text-3xl font-bold">
              Your Smart Recommendations
            </h1>
            <p className="text-white/80 text-lg">
              AI-powered internship matches tailored just for
              you
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <RecommendationResults
            recommendations={recommendations}
            onBack={() => setCurrentView("form")}
            onApply={handleApply}
            onViewDetails={handleViewDetails}
          />
        </div>
        <SuccessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        
        {/* Global Components - Available on all pages */}
        {renderGlobalComponents()}
      </div>
    );
  }

  if (
    currentView === "internship-details" &&
    selectedInternship
  ) {
    return (
      <>
        <Navbar
          notifications={allNotifications}
          onProfileClick={handleProfileSettings}
          onSubmittedApplicationsClick={
            handleSubmittedApplications
          }
          onHomeClick={handleHomeClick}
          onEligibilityClick={handleEligibilityClick}
          onGuidelinesClick={handleGuidelinesClick}
          onLoginClick={() => setAuthModalOpen(true)}
          onRegisterClick={() => setAuthModalOpen(true)}
          currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
          submittedApplicationsCount={applications.length}
        />
        <InternshipDetails
          internship={selectedInternship}
          onBack={handleBack}
          onApply={handleApply}
        />
        <SuccessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        
        {/* Global Components - Available on all pages */}
        {renderGlobalComponents()}
      </>
    );
  }

  if (currentView === "profile-settings") {
    return (
      <>
        <Navbar
          notifications={allNotifications}
          onProfileClick={handleProfileSettings}
          onSubmittedApplicationsClick={
            handleSubmittedApplications
          }
          onHomeClick={handleHomeClick}
          onEligibilityClick={handleEligibilityClick}
          onGuidelinesClick={handleGuidelinesClick}
          onLoginClick={() => setAuthModalOpen(true)}
          onRegisterClick={() => setAuthModalOpen(true)}
          currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
          submittedApplicationsCount={applications.length}
        />
        <ProfileSettings
          onBack={() => setCurrentView("results")}
          onSave={handleProfileSave}
          currentProfile={candidateProfile ? {
            name: user?.displayName || user?.email?.split('@')[0] || 'User',
            email: user?.email || '',
            phone: '',
            location: candidateProfile.Location,
            education: candidateProfile.EducationLevel,
            skills: candidateProfile.Skills.split(',').map(s => s.trim()),
            interests: ['technology', 'education'], // Add missing interests
            bio: 'Motivated student seeking internship opportunities', // Add missing bio
            experience: candidateProfile.ExperienceLevel,
            sector: candidateProfile.SectorInterest,
            mode: candidateProfile.Mode,
            language: candidateProfile.Language
          } : undefined}
        />
        <SuccessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        
        {/* Global Components - Available on all pages */}
        {renderGlobalComponents()}
      </>
    );
  }

  if (currentView === "submitted-applications") {
    return (
      <>
        <Navbar
          notifications={allNotifications}
          onProfileClick={handleProfileSettings}
          onSubmittedApplicationsClick={
            handleSubmittedApplications
          }
          onHomeClick={handleHomeClick}
          onEligibilityClick={handleEligibilityClick}
          onGuidelinesClick={handleGuidelinesClick}
          onLoginClick={() => setAuthModalOpen(true)}
          onRegisterClick={() => setAuthModalOpen(true)}
          currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
          submittedApplicationsCount={applications.length}
        />
        <SubmittedApplications
          onBack={() => setCurrentView("results")}
        />
        <SuccessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        
        {/* Global Components - Available on all pages */}
        {renderGlobalComponents()}
      </>
    );
  }

  if (currentView === "guidelines") {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar
          notifications={allNotifications}
          onProfileClick={handleProfileSettings}
          onSubmittedApplicationsClick={
            handleSubmittedApplications
          }
          onHomeClick={handleHomeClick}
          onEligibilityClick={handleEligibilityClick}
          onGuidelinesClick={handleGuidelinesClick}
          onLoginClick={() => setAuthModalOpen(true)}
          onRegisterClick={() => setAuthModalOpen(true)}
          currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
          submittedApplicationsCount={applications.length}
        />
        <div className="bg-gradient-to-r from-gov-blue to-gov-purple py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-white mb-2 text-3xl">
              Guidelines
            </h1>
            <p className="text-white/80 text-lg">
              Complete guide for using InternMatch
            </p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="space-y-8">
              <div>
                <h2 className="mb-4">How to Register</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    1. Click on "Youth Registration" in the top
                    navigation
                  </p>
                  <p>
                    2. Fill in your personal details including
                    name, email, and phone number
                  </p>
                  <p>
                    3. Verify your email address through the
                    confirmation link
                  </p>
                  <p>
                    4. Complete your profile with education and
                    skills information
                  </p>
                </div>
              </div>

              <div>
                <h2 className="mb-4">How to Login</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    1. Click on "Login" in the top navigation
                  </p>
                  <p>
                    2. Enter your registered email and password
                  </p>
                  <p>
                    3. Click "Sign In" to access your dashboard
                  </p>
                </div>
              </div>

              <div>
                <h2 className="mb-4">
                  How to Search for Internships
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    1. Complete your profile by clicking "Start
                    Your Internship Journey"
                  </p>
                  <p>
                    2. Fill in your education level, preferred
                    location, areas of interest, and skills
                  </p>
                  <p>
                    3. Our AI will generate 3-5 personalized
                    recommendations based on your profile
                  </p>
                  <p>
                    4. Browse through the recommended
                    internships and view detailed descriptions
                  </p>
                </div>
              </div>

              <div>
                <h2 className="mb-4">
                  How to Apply for Internships
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    1. Click "View Details" on any internship
                    that interests you
                  </p>
                  <p>
                    2. Review the internship requirements,
                    duration, and stipend details
                  </p>
                  <p>
                    3. Click "Apply Now" to submit your
                    application
                  </p>
                  <p>
                    4. Track your applications through "My
                    Applications" in your profile menu
                  </p>
                  <p>
                    5. You'll receive notifications about your
                    application status updates
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-blue-900 mb-2">
                  Important Notes:
                </h3>
                <ul className="list-disc pl-4 space-y-2 text-blue-800 text-sm">
                  <li>
                    Ensure all information in your profile is
                    accurate and up-to-date
                  </li>
                  <li>
                    You can apply to multiple internships but
                    avoid duplicate applications
                  </li>
                  <li>
                    Check your email regularly for important
                    updates and communications
                  </li>
                  <li>
                    Contact support if you face any technical
                    issues during the process
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        <SuccessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        
        {/* Global Components - Available on all pages */}
        {renderGlobalComponents()}
      </div>
    );
  }

  // Welcome page (default)
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar
        notifications={allNotifications}
        onProfileClick={handleProfileSettings}
        onSubmittedApplicationsClick={
          handleSubmittedApplications
        }
        onHomeClick={handleHomeClick}
        onEligibilityClick={handleEligibilityClick}
        onGuidelinesClick={handleGuidelinesClick}
        onSupportClick={handleSupportClick}
        onLoginClick={() => setAuthModalOpen(true)}
        onRegisterClick={() => setAuthModalOpen(true)}
        onLogoutClick={() => {
          console.log('Logout clicked in App.tsx');
          logout();
        }}
        currentUser={user ? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' } : null}
        submittedApplicationsCount={applications.length}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="relative">
          {/* Full-width rectangular card with gradient background */}
          <div
            className="w-full"
            style={{
              background:
                "linear-gradient(90deg, #fdfdfd 0%, #E8EEF3 50%, #CDEAE1 100%)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-24 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="text-left relative">
                  {/* Background decoration */}
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#FF9933]/10 to-[#138808]/10 rounded-full blur-3xl"></div>
                  <div className="absolute top-16 -right-8 w-24 h-24 bg-gradient-to-br from-[#1E40AF]/10 to-[#6366f1]/10 rounded-full blur-2xl"></div>

                  <div className="relative z-10">
                    {/* Pre-title badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#E2E8F0] mb-6 shadow-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-[#475569]">
                        AI-Powered Matching Engine
                      </span>
                      <Brain className="w-4 h-4 text-[#1E40AF]" />
                    </div>

                    {/* Main heading */}
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 leading-tight text-left">
                      <span className="block bg-gradient-to-r from-[#FF9933] via-[#1E40AF] to-[#138808] bg-clip-text text-transparent">
                        Your Skills, Your City,
                      </span>
                      <span className="block text-[#0F172A] mt-2 relative">
                        The Right Internship
                        <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full"></div>
                      </span>
                    </h1>

                    {/* Taglines */}
                    <div className="space-y-3 mb-8">
                      
                      <p className="text-[#475569] font-medium">
                        InternMatch • SIH 2025 • Government of
                        India
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="mb-8">
                      <Button
                        onClick={handleStartJourney}
                        size="lg"
                        className="px-12 py-6 text-xl font-medium text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF9933 0%, #138808 100%)",
                        }}
                      >
                        Start Your Internship Journey
                        <Sparkles className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                      </Button>
                    </div>

                    {/* Description */}
                    <div className="max-w-2xl">
                      <p className="text-[#475569] text-lg leading-relaxed mb-6">
                        Advanced AI matching system designed
                        specifically for India's diverse talent.
                        Get personalized internship
                        recommendations based on your unique
                        profile, skills, and location
                        preferences.
                      </p>

                      {/* Feature highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#FF9933] to-[#FFB366] rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[#475569] font-medium">
                            Quick setup
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#1E40AF] to-[#6366f1] rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[#475569] font-medium">
                            Smart matching
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#138808] to-[#22c55e] rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[#475569] font-medium">
                            Accurate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Enhanced Slideshow Container */}
                  <div className="relative w-full h-[480px] overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-[#1E40AF]/5 to-[#6366f1]/5 border border-[#E2E8F0]/50">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                    {/* Image slides with enhanced effects */}
                    {heroImages.map((image, index) => {
                      const sectorLabels = [
                        "AI & Technology",
                        "Software Development",
                        "Engineering & Manufacturing",
                        "Agriculture & Innovation",
                        "Marine & Offshore",
                        "Healthcare & Research",
                      ];

                      return (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                            index === currentImageIndex
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-105"
                          }`}
                        >
                          <ImageWithFallback
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#1E40AF]/20 via-transparent to-[#FF9933]/20"></div>

                          {/* Sector label */}
                          <div className="absolute bottom-20 left-6 right-6">
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full"></div>
                                <h3 className="font-semibold text-[#0F172A]">
                                  {sectorLabels[index]}
                                </h3>
                                <div className="ml-auto flex items-center gap-1 text-xs text-[#475569]">
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI Powered</span>
                                </div>
                              </div>
                              <p className="text-sm text-[#475569] mt-2">
                                Discover internship
                                opportunities in India's growing{" "}
                                {sectorLabels[
                                  index
                                ].toLowerCase()}{" "}
                                sector
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Navigation arrows */}
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0
                            ? heroImages.length - 1
                            : prev - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20 flex items-center justify-center hover:bg-white transition-all duration-300 group"
                    >
                      <svg
                        className="w-5 h-5 text-[#1E40AF] group-hover:text-[#FF9933] transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) =>
                            (prev + 1) % heroImages.length,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20 flex items-center justify-center hover:bg-white transition-all duration-300 group"
                    >
                      <svg
                        className="w-5 h-5 text-[#1E40AF] group-hover:text-[#FF9933] transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Enhanced indicators with progress bars */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg border border-white/20">
                        {heroImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              setCurrentImageIndex(index)
                            }
                            className={`relative w-8 h-2 rounded-full transition-all duration-300 ${
                              index === currentImageIndex
                                ? "bg-gradient-to-r from-[#FF9933] to-[#138808]"
                                : "bg-[#E2E8F0] hover:bg-[#CBD5E1]"
                            }`}
                          >
                            {index === currentImageIndex && (
                              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full animate-pulse"></div>
                            )}
                          </button>
                        ))}

                        {/* Counter */}
                        <div className="ml-2 text-xs font-medium text-[#475569]">
                          {currentImageIndex + 1}/
                          {heroImages.length}
                        </div>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/20">
                      <Brain className="w-5 h-5 text-[#1E40AF]" />
                    </div>
                  </div>

                  {/* Slideshow meta info */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-[#475569] flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF9933]" />
                      Explore diverse internship sectors across
                      India
                      
                      
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 bg-[#F9FAFB]">
        {/* PM Internship Scheme Section */}
        <div
          className="relative overflow-hidden rounded-xl mb-16 shadow-lg max-w-4xl mx-auto"
          style={{
            background:
              "linear-gradient(135deg, #1E40AF 0%, #6366f1 100%)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 lg:p-12 relative">
            {/* Background decorative elements */}
            <div className="absolute top-8 right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="text-center lg:text-left order-2 lg:order-1 relative z-10">
              {/* Enhanced title with better hierarchy */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                    Government Initiative
                  </span>
                  <Sparkles className="w-4 h-4 text-white/80" />
                </div>
                
                <h2 className="font-bold text-3xl lg:text-4xl xl:text-5xl mb-4 text-white leading-tight">
                  <span className="block">PM Internship</span>
                  <span className="block bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                    Scheme
                  </span>
                </h2>
                
                <div className="w-16 h-1 bg-gradient-to-r from-white to-white/60 rounded-full"></div>
              </div>

              {/* Enhanced description with better readability */}
              <div className="mb-8">
                <p className="text-lg lg:text-xl text-white/95 mb-4 leading-relaxed font-medium">
                  Empowering India's youth with world-class internship opportunities
                </p>
                <p className="text-white/80 leading-relaxed">
                  Real-world experience in leading organizations across the nation, designed to bridge the skills gap and create future-ready professionals.
                </p>
              </div>

              {/* Enhanced benefits grid with better visual design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="group flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 hover:bg-white/15 transition-all duration-300">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">12 Months</p>
                    <p className="text-white/70 text-sm">Real Experience</p>
                  </div>
                </div>

                <div className="group flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 hover:bg-white/15 transition-all duration-300">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">₹5,000</p>
                    <p className="text-white/70 text-sm">Monthly Stipend</p>
                  </div>
                </div>

                <div className="group flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 hover:bg-white/15 transition-all duration-300">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BriefcaseBusiness className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Top Industry</p>
                    <p className="text-white/70 text-sm">Partnerships</p>
                  </div>
                </div>

                <div className="group flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 hover:bg-white/15 transition-all duration-300">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Certified</p>
                    <p className="text-white/70 text-sm">Skills Training</p>
                  </div>
                </div>
              </div>

              {/* Additional stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10L+</div>
                  <div className="text-white/70">Opportunities</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-white/70">Partner Companies</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-white/70">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="text-center order-1 lg:order-2 relative z-10">
              <div className="relative max-w-sm mx-auto">
                {/* Enhanced image container with sophisticated styling */}
                <div className="relative group">
                  {/* Background glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  
                  {/* Image container with enhanced styling */}
                  <div className="relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    <ImageWithFallback
                      src={pmModiImage}
                      alt="Prime Minister Narendra Modi"
                      className="w-full max-w-xs mx-auto rounded-xl shadow-lg"
                    />
                    
                    {/* Decorative corner elements */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-white/40 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/30 rounded-full"></div>
                  </div>
                </div>

                {/* Enhanced quote section with better typography */}
                <div className="mt-8 relative">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                    {/* Quote icon */}
                    
                    
                    <blockquote className="text-white/95 font-medium text-lg leading-relaxed mb-4 italic">
                      "AI-powered internships will shape India's future workforce and drive our nation towards technological excellence"
                    </blockquote>
                    
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                      <cite className="text-white/80 text-sm font-semibold not-italic">
                        Hon'ble Prime Minister
                      </cite>
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-lg"></div>
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-lg"></div>
                  </div>
                </div>

                {/* Additional credibility badge */}
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <div className="w-2 h-2 bg-[#FF9933] rounded-full"></div>
                  <span className="text-white/90 text-sm font-medium">Government of India Initiative</span>
                  <div className="w-2 h-2 bg-[#138808] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="text-center mb-16 relative">
          {/* Background decorative elements */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-[#FF9933]/5 via-[#1E40AF]/5 to-[#138808]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-4 left-1/4 w-16 h-16 bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 rounded-full blur-2xl"></div>
          <div className="absolute top-8 right-1/4 w-20 h-20 bg-gradient-to-br from-[#FF9933]/10 to-[#138808]/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Enhanced AI badge with animated elements */}
            

            {/* Enhanced main heading with gradient text */}
            <h2 className="mb-6 leading-tight">
              <span className="block text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#0F172A] via-[#1E40AF] to-[#0F172A] bg-clip-text text-transparent mb-2">
                Why Choose
              </span>
              <span className="block text-4xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-[#FF9933] via-[#1E40AF] to-[#138808] bg-clip-text text-transparent">
                  InternMatch?
                </span>
              </span>
            </h2>

            {/* Enhanced description with better typography */}
            <div className="max-w-3xl mx-auto">
              <p className="text-[#475569] text-lg lg:text-xl leading-relaxed mb-4 font-medium">
                Experience the future of internship matching with our advanced AI technology
              </p>
              <p className="text-[rgba(100,116,139,1)] max-w-2xl mx-auto font-bold font-normal">
                Designed specifically for India's diverse talent ecosystem, our intelligent system understands your unique profile and connects you with opportunities that truly match your potential
              </p>
            </div>

            {/* Feature highlights row */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#FF9933] to-[#FFB366] rounded-full"></div>
                <span className="text-[#475569] font-medium">Smart Algorithms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1E40AF] to-[#6366f1] rounded-full"></div>
                <span className="text-[#475569] font-medium">Personalized Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#138808] to-[#22c55e] rounded-full"></div>
                <span className="text-[#475569] font-medium">Government Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Background decorative grid */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-8 left-8 w-24 h-24 bg-gradient-to-br from-[#FF9933]/5 to-[#FFB366]/5 rounded-full blur-2xl"></div>
            <div className="absolute top-16 right-12 w-20 h-20 bg-gradient-to-br from-[#1E40AF]/5 to-[#6366f1]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-12 left-16 w-28 h-28 bg-gradient-to-br from-[#138808]/5 to-[#22c55e]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[#6366f1]/5 to-[#a855f7]/5 rounded-full blur-2xl"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Smart AI Matching Card */}
            <Card className="group relative text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#E2E8F0]/80 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              {/* Card background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/5 via-transparent to-[#6366f1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Floating accent */}
              
              
              <CardContent className="relative space-y-6 pt-0">
                <div className="relative">
                  {/* Enhanced icon container with multiple layers */}
                  <div className="relative w-20 h-20 mx-auto">
                    {/* Outer ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/20 to-[#6366f1]/20 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    {/* Main gradient background */}
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #1E40AF 0%, #6366f1 100%)",
                      }}
                    >
                      <Brain className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-300" />
                      {/* Pulse effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full group-hover:animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#0F172A] font-bold text-lg group-hover:text-[#1E40AF] transition-colors duration-300">
                    Smart AI Matching
                  </h3>
                  <p className="text-[#475569] leading-relaxed">
                    Advanced machine learning algorithms analyze your profile for perfect internship matches
                  </p>
                </div>

                {/* Feature badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1E40AF]/10 to-[#6366f1]/10 rounded-full border border-[#1E40AF]/20">
                  <div className="w-1.5 h-1.5 bg-[#1E40AF] rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-[#1E40AF]">99% Accuracy</span>
                </div>
              </CardContent>
            </Card>

            {/* Lightning Fast Card */}
            <Card className="group relative text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#E2E8F0]/80 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 via-transparent to-[#FFB366]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              
              <CardContent className="relative space-y-6 pt-0">
                <div className="relative">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/20 to-[#FFB366]/20 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #FF9933 0%, #FFB366 100%)",
                      }}
                    >
                      <Zap className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full group-hover:animate-pulse"></div>
                    </div>
                  </div>
                  
                  
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#0F172A] font-bold text-lg group-hover:text-[#FF9933] transition-colors duration-300">
                    Lightning Fast
                  </h3>
                  <p className="text-[#475569] leading-relaxed">
                    Get personalized recommendations in under 3 minutes with our streamlined process
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FF9933]/10 to-[#FFB366]/10 rounded-full border border-[#FF9933]/20">
                  <div className="w-1.5 h-1.5 bg-[#FF9933] rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-[#FF9933]">Under 3 Minutes</span>
                </div>
              </CardContent>
            </Card>

            {/* Precision Targeting Card */}
            <Card className="group relative text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#E2E8F0]/80 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/5 via-transparent to-[#22c55e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              
              <CardContent className="relative space-y-6 pt-0">
                <div className="relative">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#22c55e]/20 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #138808 0%, #22c55e 100%)",
                      }}
                    >
                      <Target className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full group-hover:animate-pulse"></div>
                    </div>
                  </div>
                  
                  
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#0F172A] font-bold text-lg group-hover:text-[#138808] transition-colors duration-300">
                    Precision Targeting
                  </h3>
                  <p className="text-[#475569] leading-relaxed">
                    Location-aware matching ensures opportunities are accessible and relevant to you
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#138808]/10 to-[#22c55e]/10 rounded-full border border-[#138808]/20">
                  <div className="w-1.5 h-1.5 bg-[#138808] rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-[#138808]">Location Smart</span>
                </div>
              </CardContent>
            </Card>

            {/* Continuous Learning Card */}
            <Card className="group relative text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#E2E8F0]/80 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#a855f7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              
              <CardContent className="relative space-y-6 pt-0">
                <div className="relative">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      }}
                    >
                      <TrendingUp className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full group-hover:animate-pulse"></div>
                    </div>
                  </div>
                  
                  
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#0F172A] font-bold text-lg group-hover:text-[#6366f1] transition-colors duration-300">
                    Continuous Learning
                  </h3>
                  <p className="text-[#475569] leading-relaxed">
                    Our AI improves with every interaction, providing better matches over time
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-full border border-[#6366f1]/20">
                  <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-[#6366f1]">Self-Improving</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20 relative">
          {/* Background decorative elements */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-80 h-40 bg-gradient-to-r from-[#FF9933]/5 via-[#1E40AF]/5 to-[#138808]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-8 w-24 h-24 bg-gradient-to-br from-[#6366f1]/8 to-[#a855f7]/8 rounded-full blur-2xl"></div>
          <div className="absolute top-32 right-12 w-20 h-20 bg-gradient-to-br from-[#FF9933]/8 to-[#138808]/8 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            {/* Enhanced header section */}
            <div className="text-center mb-16">
              {/* Process badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-[#E2E8F0] shadow-lg mb-8">
                <div className="w-3 h-3 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold uppercase tracking-wide text-[#475569]">
                  Simple Process
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-[#1E40AF] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#FF9933] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#138808] rounded-full"></div>
                </div>
              </div>

              {/* Enhanced main heading with larger size */}
              <h2 className="mb-8 leading-tight">
                <span className="block text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-[#0F172A] via-[#1E40AF] to-[#0F172A] bg-clip-text text-transparent mb-4">
                  How It Works
                </span>
                <div className="mx-auto w-32 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#1E40AF] to-[#138808] rounded-full mb-6"></div>
              </h2>

              {/* Enhanced description */}
              <div className="max-w-4xl mx-auto">
                <p className="text-[#475569] text-xl lg:text-2xl leading-relaxed mb-6 font-medium">
                  Three simple steps to find your perfect internship opportunity
                </p>
                <p className="text-[#64748B] max-w-3xl mx-auto text-lg">
                  Our AI-powered platform makes internship discovery effortless. From profile creation to final application, 
                  we guide you through every step with intelligent recommendations and seamless user experience.
                </p>
              </div>

              {/* Process timeline indicator */}
              <div className="flex items-center justify-center gap-4 mt-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#1E40AF] rounded-full"></div>
                  <span className="text-[#475569] font-medium">Profile Setup</span>
                </div>
                <div className="w-8 h-px bg-[#E2E8F0]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FF9933] rounded-full"></div>
                  <span className="text-[#475569] font-medium">AI Analysis</span>
                </div>
                <div className="w-8 h-px bg-[#E2E8F0]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#138808] rounded-full"></div>
                  <span className="text-[#475569] font-medium">Application</span>
                </div>
              </div>
            </div>

            {/* Enhanced process steps with sophisticated cards */}
            <div className="relative">
              {/* Connection lines for desktop */}
              <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-[#1E40AF]/30 to-[#FF9933]/30"></div>
                  <div className="absolute top-0 right-0 w-1/3 h-px bg-gradient-to-r from-[#FF9933]/30 via-[#138808]/30 to-transparent"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
                {/* Step 1: Enhanced Profile Card */}
                <div className="group relative">
                  {/* Card background with hover effects */}
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#E2E8F0]/80 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/5 via-transparent to-[#6366f1]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Step number badge */}
                    <div className="absolute -top-4 left-8 bg-white rounded-full p-3 shadow-lg border border-[#E2E8F0] group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#6366f1] bg-clip-text text-transparent">Step 1</span>
                    </div>

                    <div className="relative z-10 text-center mt-8">
                      {/* Enhanced icon with multiple layers */}
                      <div className="relative mb-8">
                        <div className="relative w-28 h-28 mx-auto">
                          {/* Outer glow ring */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/20 to-[#6366f1]/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                          {/* Main icon container */}
                          <div
                            className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-2xl"
                            style={{
                              background: "linear-gradient(135deg, #1E40AF 0%, #6366f1 100%)",
                            }}
                          >
                            <GraduationCap className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                            {/* Inner highlight */}
                            <div className="absolute inset-4 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                          </div>
                          {/* Floating accent */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center shadow-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced content */}
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-[#0F172A] group-hover:text-[#1E40AF] transition-colors duration-300">
                          Complete Your Profile
                        </h3>
                        
                        <p className="text-[#475569] text-lg leading-relaxed">
                          Tell us about your education, skills, interests, and location preferences in our intuitive 4-step wizard
                        </p>

                        {/* Feature highlights */}
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-center gap-2 text-[#1E40AF]">
                            <CheckCircle className="w-4 h-4" />
                            <span>Education & Skills Assessment</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[#1E40AF]">
                            <CheckCircle className="w-4 h-4" />
                            <span>Location & Preference Settings</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[#1E40AF]">
                            <CheckCircle className="w-4 h-4" />
                            <span>Interest & Career Goals</span>
                          </div>
                        </div>

                        {/* Time indicator */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E40AF]/10 to-[#6366f1]/10 rounded-full border border-[#1E40AF]/20">
                          <div className="w-2 h-2 bg-[#1E40AF] rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-[#1E40AF]">2-3 Minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Enhanced AI Analysis Card */}
                <div className="group relative">
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#E2E8F0]/80 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 via-transparent to-[#FFB366]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute -top-4 left-8 bg-white rounded-full p-3 shadow-lg border border-[#E2E8F0] group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#FF9933] to-[#FFB366] bg-clip-text text-transparent">Step 2</span>
                    </div>

                    <div className="relative z-10 text-center mt-8">
                      <div className="relative mb-8">
                        <div className="relative w-28 h-28 mx-auto">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/20 to-[#FFB366]/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                          <div
                            className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-2xl"
                            style={{
                              background: "linear-gradient(135deg, #FF9933 0%, #FFB366 100%)",
                            }}
                          >
                            <Brain className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-4 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center shadow-lg">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-[#0F172A] group-hover:text-[#FF9933] transition-colors duration-300">
                          Get AI Recommendations
                        </h3>
                        
                        <p className="text-[#475569] text-lg leading-relaxed">
                          Our smart algorithm analyzes thousands of opportunities to find the 3-5 best matches for your unique profile
                        </p>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-center gap-2 text-[#FF9933]">
                            <Target className="w-4 h-4" />
                            <span>Advanced Machine Learning</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[#FF9933]">
                            <Target className="w-4 h-4" />
                            <span>10,000+ Internship Database</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[#FF9933]">
                            <Target className="w-4 h-4" />
                            <span>Personalized Match Scoring</span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9933]/10 to-[#FFB366]/10 rounded-full border border-[#FF9933]/20">
                          <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-[#FF9933]">Instant Results</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Enhanced Application Card */}
                <div className="group relative">
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#E2E8F0]/80 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/5 via-transparent to-[#22c55e]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute -top-4 left-8 bg-white rounded-full p-3 shadow-lg border border-[#E2E8F0] group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#138808] to-[#22c55e] bg-clip-text text-transparent">Step 3</span>
                    </div>

                    <div className="relative z-10 text-center mt-8">
                      <div className="relative mb-8">
                        <div className="relative w-28 h-28 mx-auto">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#22c55e]/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                          <div
                            className="relative w-full h-full rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-2xl"
                            style={{
                              background: "linear-gradient(135deg, #138808 0%, #22c55e 100%)",
                            }}
                          >
                            <CheckCircle className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-4 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#1E40AF] to-[#6366f1] rounded-full flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-[#0F172A] group-hover:text-[#138808] transition-colors duration-300">
                          Apply with Confidence
                        </h3>
                        
                        <p className="text-[#475569] text-lg leading-relaxed">
                          Apply to internships with detailed reasoning for each match and track your applications seamlessly
                        </p>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-center gap-2 text-[#138808]">
                            <CheckCircle className="w-4 h-4" />
                            <span>One-Click Applications</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[#138808]">
                            <CheckCircle className="w-4 h-4" />
                            <span>Match Explanation & Reasoning</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[#138808]">
                            <CheckCircle className="w-4 h-4" />
                            <span>Real-Time Status Tracking</span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#138808]/10 to-[#22c55e]/10 rounded-full border border-[#138808]/20">
                          <div className="w-2 h-2 bg-[#138808] rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-[#138808]">Easy Tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success rate banner */}
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-8 px-8 py-6 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-sm rounded-2xl border border-[#E2E8F0] shadow-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#6366f1] bg-clip-text text-transparent">95%</div>
                    <div className="text-sm text-[#475569] font-medium">Success Rate</div>
                  </div>
                  <div className="w-px h-12 bg-[#E2E8F0]"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#FF9933] to-[#FFB366] bg-clip-text text-transparent">3min</div>
                    <div className="text-sm text-[#475569] font-medium">Average Time</div>
                  </div>
                  <div className="w-px h-12 bg-[#E2E8F0]"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#138808] to-[#22c55e] bg-clip-text text-transparent">50K+</div>
                    <div className="text-sm text-[#475569] font-medium">Happy Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Section */}
        <div id="eligibility-section" className="mb-16">
          <Card className="relative p-8 lg:p-12 bg-white border border-[#E2E8F0]/80 shadow-xl rounded-3xl overflow-hidden group">
            {/* Background decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-[#FF9933]/5 to-[#FFB366]/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-[#1E40AF]/5 to-[#6366f1]/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#FF9933]/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[#138808]/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>

            {/* Enhanced header section */}
            <div className="relative z-10 text-center mb-12">
              {/* Eligibility badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FF9933]/10 via-[#1E40AF]/10 to-[#138808]/10 backdrop-blur-sm rounded-full border border-[#E2E8F0] shadow-lg mb-8 group-hover:shadow-xl transition-all duration-500">
                <div className="w-3 h-3 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold uppercase tracking-wide text-[#475569]">
                  Eligibility Check
                </span>
                <CheckCircle className="w-4 h-4 text-[#138808]" />
              </div>

              {/* Enhanced main heading */}
              <h2 className="mb-6 leading-tight">
                <span className="block text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-[#0F172A] via-[#1E40AF] to-[#0F172A] bg-clip-text text-transparent mb-3">
                  Are You Eligible?
                </span>
                <div className="mx-auto w-24 h-1 bg-gradient-to-r from-[#FF9933] via-[#1E40AF] to-[#138808] rounded-full mb-4"></div>
              </h2>

              {/* Enhanced description */}
              <div className="max-w-2xl mx-auto">
                <p className="text-[#475569] text-lg lg:text-xl leading-relaxed mb-4 font-medium">
                  Verify your eligibility for PM Internship Scheme
                </p>
                <p className="text-[#64748B] max-w-xl mx-auto">
                  Check these simple criteria to start your journey with India's premier internship program
                </p>
              </div>
            </div>

            {/* Enhanced eligibility criteria grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
              {/* Age Criteria Card */}
              <Card className="group/card relative p-6 lg:p-8 text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-[#E2E8F0]/80 bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl overflow-hidden">
                {/* Card background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/5 via-transparent to-[#6366f1]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#1E40AF]/10 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700"></div>
                
                <CardContent className="relative z-10 pt-0 space-y-4">
                  {/* Enhanced icon container */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover/card:shadow-xl group-hover/card:scale-110 transition-all duration-500">
                      <Users className="w-9 h-9 text-[#1E40AF] group-hover/card:scale-110 transition-transform duration-300" />
                      {/* Floating indicator */}
                      
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[#0F172A] font-bold text-lg group-hover/card:text-[#1E40AF] transition-colors duration-300">
                      Age Requirement
                    </h3>
                    <div>
                      <p className="text-[#1E40AF] font-bold text-xl mb-1">
                        21-24 Years
                      </p>
                      <p className="text-[#64748B] text-sm">
                        Young professionals ready to learn
                      </p>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1E40AF]/10 to-[#6366f1]/10 rounded-full border border-[#1E40AF]/20">
                    <div className="w-1.5 h-1.5 bg-[#1E40AF] rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-[#1E40AF]">Age Check</span>
                  </div>
                </CardContent>
              </Card>

              {/* Job Status Card */}
              <Card className="group/card relative p-6 lg:p-8 text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-[#E2E8F0]/80 bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/5 via-transparent to-[#22c55e]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#138808]/10 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700"></div>
                
                <CardContent className="relative z-10 pt-0 space-y-4">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover/card:shadow-xl group-hover/card:scale-110 transition-all duration-500">
                      <BriefcaseBusiness className="w-9 h-9 text-[#138808] group-hover/card:scale-110 transition-transform duration-300" />
                      
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[#0F172A] font-bold text-lg group-hover/card:text-[#138808] transition-colors duration-300">
                      Employment Status
                    </h3>
                    <div>
                      <p className="text-[#138808] font-bold text-lg mb-1">
                        Currently Unemployed
                      </p>
                      <p className="text-[#64748B] text-sm">
                        Not in full-time employment
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#138808]/10 to-[#22c55e]/10 rounded-full border border-[#138808]/20">
                    <div className="w-1.5 h-1.5 bg-[#138808] rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-[#138808]">Job Status</span>
                  </div>
                </CardContent>
              </Card>

              {/* Education Card */}
              <Card className="group/card relative p-6 lg:p-8 text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-[#E2E8F0]/80 bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#a855f7]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#6366f1]/10 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700"></div>
                
                <CardContent className="relative z-10 pt-0 space-y-4">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover/card:shadow-xl group-hover/card:scale-110 transition-all duration-500">
                      <GraduationCap className="w-9 h-9 text-[#6366f1] group-hover/card:scale-110 transition-transform duration-300" />
                      
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[#0F172A] font-bold text-lg group-hover/card:text-[#6366f1] transition-colors duration-300">
                      Education Status
                    </h3>
                    <div>
                      <p className="text-[#6366f1] font-bold text-lg mb-1">
                        Not Full-Time Student
                      </p>
                      <p className="text-[#64748B] text-sm">
                        Available for internship
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-full border border-[#6366f1]/20">
                    <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-[#6366f1]">Education</span>
                  </div>
                </CardContent>
              </Card>

              {/* Family Income Card */}
              <Card className="group/card relative p-6 lg:p-8 text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-[#E2E8F0]/80 bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 via-transparent to-[#FFB366]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#FF9933]/10 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700"></div>
                
                <CardContent className="relative z-10 pt-0 space-y-4">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover/card:shadow-xl group-hover/card:scale-110 transition-all duration-500">
                      <IndianRupee className="w-9 h-9 text-[#FF9933] group-hover/card:scale-110 transition-transform duration-300" />
                      
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[#0F172A] font-bold text-lg group-hover/card:text-[#FF9933] transition-colors duration-300">
                      Family Income
                    </h3>
                    <div>
                      <p className="text-[#FF9933] font-bold text-lg mb-1 leading-tight">
                        ≤ ₹8 Lakhs PA
                      </p>
                      <p className="text-[#64748B] text-sm">
                        No government job in family
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FF9933]/10 to-[#FFB366]/10 rounded-full border border-[#FF9933]/20">
                    <div className="w-1.5 h-1.5 bg-[#FF9933] rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-[#FF9933]">Income</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced benefits section */}
            <div className="relative z-10 bg-gradient-to-br from-white via-[#F8FAFC] to-white rounded-2xl p-8 lg:p-10 shadow-lg border border-[#E2E8F0]/80 group-hover:shadow-xl transition-all duration-500">
              {/* Background decoration */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/10 rounded-full blur-2xl"></div>
              
              <div className="relative">
                {/* Enhanced benefits header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#22c55e]/10 to-[#16a34a]/10 rounded-full border border-[#22c55e]/20 mb-4">
                    <Sparkles className="w-4 h-4 text-[#22c55e]" />
                    <span className="text-sm font-semibold text-[#22c55e] uppercase tracking-wide">
                      Program Benefits
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-2">
                    What You'll Receive
                  </h3>
                  <p className="text-[#64748B] max-w-2xl mx-auto">
                    Comprehensive support package designed to ensure your success throughout the internship program
                  </p>
                </div>

                {/* Enhanced benefits grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Benefit 1 */}
                  <div className="group flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E8F0]/50 hover:shadow-lg hover:border-[#22c55e]/20 transition-all duration-500">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#1E40AF] rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#22c55e] transition-colors duration-300">
                        12 Months Real-World Experience
                      </h4>
                      <p className="text-[#64748B] leading-relaxed">
                        Gain invaluable hands-on experience working with India's leading companies and organizations
                      </p>
                    </div>
                  </div>

                  {/* Benefit 2 */}
                  <div className="group flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E8F0]/50 hover:shadow-lg hover:border-[#1E40AF]/20 transition-all duration-500">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1E40AF] to-[#6366f1] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IndianRupee className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22c55e] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#1E40AF] transition-colors duration-300">
                        Monthly Stipend ₹5,000
                      </h4>
                      <p className="text-[#64748B] leading-relaxed">
                        ₹4,500 from Government of India + ₹500 industry contribution to support your journey
                      </p>
                    </div>
                  </div>

                  {/* Benefit 3 */}
                  <div className="group flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E8F0]/50 hover:shadow-lg hover:border-[#FF9933]/20 transition-all duration-500">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FF9933] to-[#FFB366] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#FF9933] transition-colors duration-300">
                        One-Time Grant ₹6,000
                      </h4>
                      <p className="text-[#64748B] leading-relaxed">
                        Initial support for incidental expenses to help you start your internship smoothly
                      </p>
                    </div>
                  </div>

                  {/* Benefit 4 */}
                  <div className="group flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E8F0]/50 hover:shadow-lg hover:border-[#6366f1]/20 transition-all duration-500">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF9933] rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#6366f1] transition-colors duration-300">
                        AI-Powered Career Guidance
                      </h4>
                      <p className="text-[#64748B] leading-relaxed">
                        Smart recommendations and continuous support based on your performance and interests
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional stats banner */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-8 px-8 py-4 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-sm rounded-2xl border border-[#E2E8F0] shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#22c55e] to-[#16a34a] bg-clip-text text-transparent">10L+</div>
                      <div className="text-sm text-[#64748B] font-medium">Opportunities</div>
                    </div>
                    <div className="w-px h-8 bg-[#E2E8F0]"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#6366f1] bg-clip-text text-transparent">500+</div>
                      <div className="text-sm text-[#64748B] font-medium">Companies</div>
                    </div>
                    <div className="w-px h-8 bg-[#E2E8F0]"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#FF9933] to-[#FFB366] bg-clip-text text-transparent">95%</div>
                      <div className="text-sm text-[#64748B] font-medium">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div
            className="rounded-2xl p-12 text-white shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, #1E40AF 0%, #6366f1 100%)",
            }}
          >
            <h2 className="text-white mb-4 text-3xl font-bold">
              Ready to Experience the Future of Internship
              Matching?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
              Join InternMatch and let AI find your perfect
              internship opportunity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartJourney}
                size="lg"
                className="px-10 py-4 text-lg font-medium text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #FF9933 0%, #138808 100%)",
                }}
              >
                Start Your Internship Journey
                <Brain className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                className="px-10 py-4 text-lg font-medium bg-white text-[#1E40AF] border-2 border-white hover:bg-[#F0F4F8] hover:border-[#E2E8F0] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleSupportClick}
              >
                <Phone className="w-5 h-5 mr-2" />
                Get Help & Support
              </Button>
            </div>
            <p className="text-white/70 mt-6 text-sm">
              AI-powered matching • Takes only 3 minutes •
              Completely free • Available in multiple languages
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#F0F4F8] py-8 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src={nationalEmblemColorful}
              alt="National Emblem of India"
              className="w-8 h-8"
            />
            <p className="text-[#475569] font-medium">
              InternMatch • Developed under Smart India Hackathon 2025 • Digital India
            </p>
          </div>
          <p className="text-[#475569] text-sm">
            © 2025 AI-Based Internship Recommendation Engine
            for PM Internship Scheme. All rights reserved.
          </p>
        </div>
      </footer>

      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        type={modalState.type}
        data={modalState.data}
      />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      
      {/* Google Translate */}
      <div className="fixed top-20 right-4 z-40">
        <GoogleTranslate />
      </div>
      
      {/* Site Map */}
      <SiteMap onNavigate={(page) => {
        console.log('Navigate to:', page);
        
        // Navigate to different pages based on the page ID
        switch (page) {
          case 'home':
            setCurrentView('welcome');
            toast.success('Navigated to Home');
            break;
          case 'profile':
            if (user) {
              setCurrentView('profile-settings');
              toast.success('Navigated to Profile Settings');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to access your profile');
            }
            break;
          case 'recommendations':
            if (user) {
              setCurrentView('results');
              toast.success('Navigated to Recommendations');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to view recommendations');
            }
            break;
          case 'applications':
            if (user) {
              setCurrentView('submitted-applications');
              toast.success('Navigated to My Applications');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to view your applications');
            }
            break;
          case 'profile-form':
            if (user) {
              setCurrentView('form');
              toast.success('Navigated to Profile Form');
            } else {
              setAuthModalOpen(true);
              toast.info('Please sign in to create your profile');
            }
            break;
          case 'internship-details':
            // Stay on current view if already viewing internship details
            if (recommendations.length > 0) {
              setCurrentView('results');
              toast.success('Navigated to Internship Details');
            } else {
              setCurrentView('welcome');
              toast.info('No internships available. Please create your profile first.');
            }
            break;
          case 'guidelines':
            setCurrentView('guidelines');
            toast.success('Navigated to Guidelines');
            break;
          case 'ai-assistant':
            setIsChatbotOpen(true);
            toast.success('AI Assistant opened');
            break;
          default:
            console.warn('Unknown navigation page:', page);
            toast.error('Navigation page not found');
            break;
        }
      }} />
      
      {/* Chatbot */}
      <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ApplicationsProvider>
        <AppContent />
      </ApplicationsProvider>
    </AuthProvider>
  );
}