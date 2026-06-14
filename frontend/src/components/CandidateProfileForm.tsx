import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, GraduationCap, MapPin, Briefcase, Search, Sparkles } from 'lucide-react';
import { EDUCATION_LEVELS, LOCATIONS, SECTORS, SKILLS, MODES, LANGUAGES, EXPERIENCE_LEVELS } from '../constants/lists';

interface CandidateProfile {
  EducationLevel: string;
  Location: string;
  SectorInterest: string;
  Skills: string;
  Mode: string;
  Language: string;
  ExperienceLevel: string;
}

interface CandidateProfileFormProps {
  onSubmit: (profile: CandidateProfile) => void;
}

// Use constants from lists.ts
const educationLevels = EDUCATION_LEVELS;
const locations = LOCATIONS;
const sectors = SECTORS;
const skills = SKILLS;
const modes = MODES;
const languages = LANGUAGES;
const experienceLevels = EXPERIENCE_LEVELS;

export function CandidateProfileForm({ onSubmit }: CandidateProfileFormProps) {
  const [education, setEducation] = useState('');
  const [location, setLocation] = useState('');
  const [sectorInterest, setSectorInterest] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [mode, setMode] = useState('');
  const [language, setLanguage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Filter skills based on search term
  const filteredSkills = skills.filter(skill =>
    skill.label.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  const handleSkillChange = (skillId: string, checked: boolean) => {
    if (checked) {
      setSelectedSkills(prev => [...prev, skillId]);
    } else {
      setSelectedSkills(prev => prev.filter(id => id !== skillId));
    }
  };

  const handleSubmit = () => {
    if (education && location && sectorInterest && mode && language && experienceLevel) {
      const profilePayload = {
        EducationLevel: education,
        Location: location,
        SectorInterest: sectorInterest,
        Skills: selectedSkills.join(', '),
        Mode: mode,
        Language: language,
        ExperienceLevel: experienceLevel
      };
      
      // 🔍 Step 2 — Frontend payload check
      console.log('🔍 Frontend Payload Check:');
      console.log('Profile JSON being sent:', profilePayload);
      console.log('Profile structure validation:');
      console.log('  ✓ EducationLevel:', profilePayload.EducationLevel);
      console.log('  ✓ Location:', profilePayload.Location);
      console.log('  ✓ SectorInterest:', profilePayload.SectorInterest);
      console.log('  ✓ Skills (array):', selectedSkills);
      console.log('  ✓ Skills (string):', profilePayload.Skills);
      console.log('  ✓ Mode:', profilePayload.Mode);
      console.log('  ✓ Language:', profilePayload.Language);
      console.log('  ✓ ExperienceLevel:', profilePayload.ExperienceLevel);
      
      // Validate no undefined or empty fields
      const hasEmptyFields = Object.values(profilePayload).some(value => !value || value.trim() === '');
      if (hasEmptyFields) {
        console.warn('⚠️ Warning: Some fields are empty or undefined');
      } else {
        console.log('✅ All fields are properly filled');
      }
      
      onSubmit(profilePayload);
    }
  };

  const isFormValid = education && location && sectorInterest && mode && language && experienceLevel;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl">Your Profile</span>
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          Tell us about yourself to get personalized internship recommendations
        </p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Education Level */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <GraduationCap className="w-4 h-4" />
            Education Level
          </Label>
          <Select value={education} onValueChange={setEducation}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Location */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4" />
            Preferred Location
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your preferred state" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {locations.map(loc => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector Interest */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4" />
            Sector Interest
          </Label>
          <Select value={sectorInterest} onValueChange={setSectorInterest}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your sector of interest" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map(sector => (
                <SelectItem key={sector.id} value={sector.id}>
                  <span className="flex items-center gap-2">
                    <span>{sector.icon}</span>
                    <span>{sector.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mode */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4" />
            Preferred Mode
          </Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your preferred mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map(modeOption => (
                <SelectItem key={modeOption.value} value={modeOption.value}>
                  {modeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4" />
            Preferred Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your preferred language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4" />
            Experience Level
          </Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <Label className="text-base">Your Skills (Optional)</Label>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search skills..."
              value={skillSearchTerm}
              onChange={(e) => setSkillSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Skills Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-gray-100 p-1">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="Technical" className="text-sm">Tech</TabsTrigger>
              <TabsTrigger value="Soft Skills" className="text-sm">Soft</TabsTrigger>
              <TabsTrigger value="Communication" className="text-sm">Comm</TabsTrigger>
              <TabsTrigger value="Design" className="text-sm">Design</TabsTrigger>
              <TabsTrigger value="Research" className="text-sm">Research</TabsTrigger>
              <TabsTrigger value="Operations" className="text-sm">Ops</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {(skillSearchTerm ? filteredSkills : skills).map(skill => (
                  <div key={skill.id} className="flex items-center space-x-2 p-2">
                    <Checkbox
                      id={skill.id}
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={(checked) => handleSkillChange(skill.id, checked as boolean)}
                    />
                    <Label htmlFor={skill.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <span>{skill.icon}</span>
                      <span>{skill.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {categorySkills.map(skill => (
                    <div key={skill.id} className="flex items-center space-x-2 p-2">
                      <Checkbox
                        id={skill.id}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={(checked) => handleSkillChange(skill.id, checked as boolean)}
                      />
                      <Label htmlFor={skill.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <span>{skill.icon}</span>
                        <span>{skill.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            size="lg"
            className="w-full h-14 text-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            Get My Recommendations
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}