import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Zap,
  Bell,
  Save,
  Edit3,
  Plus,
  X,
  Camera,
  Upload
} from 'lucide-react';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface ProfileSettingsProps {
  onBack: () => void;
  onSave: (profileData: any) => void;
  currentProfile?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    education: string;
    skills: string[];
    interests: string[];
    bio: string;
  };
}

export function ProfileSettings({ onBack, onSave, currentProfile }: ProfileSettingsProps) {
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [profile, setProfile] = useState(currentProfile || {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91-9876543210',
    location: 'New Delhi',
    education: 'Bachelor\'s in Computer Science',
    skills: ['Communication', 'Basic Computer Skills', 'Hindi', 'English'],
    interests: ['technology', 'education'],
    bio: 'Motivated student from rural background seeking opportunities to contribute to government initiatives and gain practical experience.'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    applications: true,
    recommendations: true,
    deadlines: true
  });

  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSave = () => {
    onSave({ 
      profile: { ...profile, profilePicture }, 
      notifications 
    });
    setIsEditing(false);
  };

  const availableInterests = [
    'agriculture', 'technology', 'healthcare', 'education', 
    'finance', 'manufacturing', 'tourism', 'media'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          {/* Mobile: Buttons in one row */}
          <div className="flex items-center justify-between mb-4 lg:mb-0">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
          
          {/* Mobile: Title and tagline in separate row */}
          <div className="lg:hidden">
            <h1>Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1>Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Mobile: Profile Summary and Completeness Cards */}
        <div className="lg:hidden mb-6 space-y-6">
          {/* Profile Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="relative mx-auto mb-3">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1">
                      <ProfilePictureUpload
                        currentImageUrl={profilePicture}
                        onImageUpload={(url) => setProfilePicture(url)}
                        userId="current-user"
                      />
                    </div>
                  )}
                </div>
                <h3 className="font-medium">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.education}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completeness Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Complete</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-chart-3 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Skills Added</span>
                  <span className="text-chart-3">{profile.skills.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interests Selected</span>
                  <span className="text-chart-2">{profile.interests.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Changes for Mobile */}
          {isEditing && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleSave} className="w-full" size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Your changes will be saved and used to improve recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Bachelor's in Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Skills & Competencies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Sector Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableInterests.map((interest) => (
                    <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile(prev => ({
                              ...prev,
                              interests: [...prev.interests, interest]
                            }));
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              interests: prev.interests.filter(i => i !== interest)
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{interest}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="application-updates">Application Updates</Label>
                      <p className="text-sm text-muted-foreground">Status updates for your applications</p>
                    </div>
                    <Switch
                      id="application-updates"
                      checked={notifications.applications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, applications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="recommendations">New Recommendations</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new matches</p>
                    </div>
                    <Switch
                      id="recommendations"
                      checked={notifications.recommendations}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, recommendations: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="deadlines">Application Deadlines</Label>
                      <p className="text-sm text-muted-foreground">Reminders before deadlines</p>
                    </div>
                    <Switch
                      id="deadlines"
                      checked={notifications.deadlines}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, deadlines: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.education}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completeness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Complete</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-chart-3 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Skills Added</span>
                    <span className="text-chart-3">{profile.skills.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interests Selected</span>
                    <span className="text-chart-2">{profile.interests.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Changes */}
            {isEditing && (
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={handleSave} className="w-full" size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Your changes will be saved and used to improve recommendations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;