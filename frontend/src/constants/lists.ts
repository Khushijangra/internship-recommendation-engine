/**
 * Constants and lists for dropdown values used throughout the application
 * These values should match the backend dataset and ML logic expectations
 */

export const EDUCATION_LEVELS = [
  { value: '12th Pass', label: '12th Pass' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'UG', label: 'Undergraduate' },
  { value: 'PG', label: 'Postgraduate' }
];

export const LOCATIONS = [
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Bhopal', label: 'Bhopal' },
  { value: 'Shillong', label: 'Shillong' },
  { value: 'Imphal', label: 'Imphal' },
  { value: 'Ranchi', label: 'Ranchi' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Jaipur', label: 'Jaipur' },
  { value: 'Lucknow', label: 'Lucknow' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Kochi', label: 'Kochi' },
  { value: 'Bhubaneswar', label: 'Bhubaneswar' },
  { value: 'Indore', label: 'Indore' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Vadodara', label: 'Vadodara' },
  { value: 'Remote', label: 'Remote' }
];

export const SECTORS = [
  { id: 'Technology', label: 'Technology', icon: '💻' },
  { id: 'Finance', label: 'Finance', icon: '💰' },
  { id: 'Education', label: 'Education', icon: '📚' },
  { id: 'Energy', label: 'Energy', icon: '⚡' },
  { id: 'Environment', label: 'Environment', icon: '🌱' },
  { id: 'Tourism', label: 'Tourism', icon: '✈️' },
  { id: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'Agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'Manufacturing', label: 'Manufacturing', icon: '🏭' },
  { id: 'Government', label: 'Government', icon: '🏛️' },
  { id: 'Research', label: 'Research', icon: '🔬' },
  { id: 'Media', label: 'Media', icon: '📺' },
  { id: 'Logistics', label: 'Logistics', icon: '🚚' },
  { id: 'Real Estate', label: 'Real Estate', icon: '🏗️' },
  { id: 'Consulting', label: 'Consulting', icon: '💼' }
];

export const MODES = [
  { value: 'Online', label: 'Online' },
  { value: 'Offline', label: 'Offline' },
  { value: 'Hybrid', label: 'Hybrid' }
];

export const LANGUAGES = [
  { value: 'Hindi', label: 'Hindi' },
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Malayalam', label: 'Malayalam' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Assamese', label: 'Assamese' },
  { value: 'Odia', label: 'Odia' },
  { value: 'Urdu', label: 'Urdu' }
];

export const EXPERIENCE_LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' }
];

export const SKILLS = [
  // Technical Skills
  { id: 'process-simulation', label: 'Process Simulation', category: 'Technical', icon: '⚙️' },
  { id: 'safety-protocols', label: 'Safety Protocols', category: 'Technical', icon: '🛡️' },
  { id: 'report-writing', label: 'Report Writing', category: 'Communication', icon: '📝' },
  { id: 'basic-html', label: 'Basic HTML', category: 'Technical', icon: '💻' },
  { id: 'communication', label: 'Communication', category: 'Soft Skills', icon: '💬' },
  { id: 'ms-office', label: 'MS Office', category: 'Technical', icon: '📊' },
  { id: 'android', label: 'Android Development', category: 'Technical', icon: '📱' },
  { id: 'farm-surveys', label: 'Farm Surveys', category: 'Technical', icon: '🌾' },
  { id: 'react', label: 'React', category: 'Technical', icon: '⚛️' },
  { id: 'public-speaking', label: 'Public Speaking', category: 'Communication', icon: '🎤' },
  { id: 'data-analysis', label: 'Data Analysis', category: 'Analytical', icon: '📈' },
  { id: 'energy-modelling', label: 'Energy Modelling', category: 'Technical', icon: '⚡' },
  { id: 'wireframing', label: 'Wireframing', category: 'Design', icon: '🎨' },
  { id: 'adobe-premiere', label: 'Adobe Premiere', category: 'Design', icon: '🎬' },
  { id: 'excel', label: 'Excel', category: 'Technical', icon: '📊' },
  { id: 'google-analytics', label: 'Google Analytics', category: 'Analytical', icon: '📊' },
  { id: 'content-writing', label: 'Content Writing', category: 'Communication', icon: '✍️' },
  { id: 'field-survey', label: 'Field Survey', category: 'Research', icon: '🔍' },
  { id: 'power-systems', label: 'Power Systems', category: 'Technical', icon: '⚡' },
  { id: 'data-collection', label: 'Data Collection', category: 'Research', icon: '📋' },
  { id: 'ethics-basics', label: 'Ethics Basics', category: 'Soft Skills', icon: '⚖️' },
  { id: 'matlab', label: 'MATLAB', category: 'Technical', icon: '🔢' },
  { id: 'measurement-tools', label: 'Measurement Tools', category: 'Technical', icon: '📏' },
  { id: 'teamwork', label: 'Teamwork', category: 'Soft Skills', icon: '🤝' },
  { id: 'sql', label: 'SQL', category: 'Technical', icon: '🗄️' },
  { id: 'linux', label: 'Linux', category: 'Technical', icon: '🐧' },
  { id: 'python', label: 'Python', category: 'Technical', icon: '🐍' },
  { id: 'script-writing', label: 'Script Writing', category: 'Communication', icon: '🎭' },
  { id: 'problem-solving', label: 'Problem Solving', category: 'Soft Skills', icon: '🧩' },
  { id: 'troubleshooting', label: 'Troubleshooting', category: 'Technical', icon: '🔧' },
  { id: 'order-management', label: 'Order Management', category: 'Operations', icon: '📦' },
  { id: 'linux-basics', label: 'Linux Basics', category: 'Technical', icon: '🐧' },
  { id: 'figma-basics', label: 'Figma Basics', category: 'Design', icon: '🎨' },
  { id: 'six-sigma-basics', label: 'Six Sigma Basics', category: 'Operations', icon: '📊' },
  { id: 'peb-basics', label: 'PEB Basics', category: 'Technical', icon: '🏭' },
  { id: 'inspection-protocols', label: 'Inspection Protocols', category: 'Technical', icon: '🔍' },
  { id: 'microcontrollers', label: 'Microcontrollers', category: 'Technical', icon: '🔌' },
  { id: 'c-programming', label: 'C Programming', category: 'Technical', icon: '💻' },
  { id: 'c-plus-plus', label: 'C++', category: 'Technical', icon: '💻' },
  { id: 'front-desk-operations', label: 'Front Desk Operations', category: 'Operations', icon: '🏨' },
  { id: 'customer-service', label: 'Customer Service', category: 'Soft Skills', icon: '😊' },
  { id: 'user-research', label: 'User Research', category: 'Research', icon: '👥' },
  { id: 'basic-design', label: 'Basic Design', category: 'Design', icon: '🎨' },
  { id: 'photoshop', label: 'Photoshop', category: 'Design', icon: '🖼️' },
  { id: 'project-management', label: 'Project Management', category: 'Management', icon: '📋' },
  { id: 'frameworks', label: 'Web Frameworks', category: 'Technical', icon: '🌐' },
  { id: 'databases', label: 'Databases', category: 'Technical', icon: '🗄️' },
  { id: 'event-planning', label: 'Event Planning', category: 'Management', icon: '🎉' },
  { id: 'social-media-management', label: 'Social Media Management', category: 'Marketing', icon: '📱' },
  { id: 'seo', label: 'SEO', category: 'Marketing', icon: '🔍' },
  { id: 'risk-analysis', label: 'Risk Analysis', category: 'Analytical', icon: '⚠️' },
  { id: 'finance', label: 'Finance', category: 'Analytical', icon: '💰' },
  { id: 'tally', label: 'Tally', category: 'Technical', icon: '📊' },
  { id: 'accounting', label: 'Accounting', category: 'Analytical', icon: '📊' },
  { id: 'inventory-management', label: 'Inventory Management', category: 'Operations', icon: '📦' },
  { id: 'quality-control', label: 'Quality Control', category: 'Operations', icon: '✅' },
  { id: 'lean-principles', label: 'Lean Principles', category: 'Operations', icon: '⚡' },
  { id: 'lab-assistance', label: 'Lab Assistance', category: 'Technical', icon: '🧪' },
  { id: 'community-survey', label: 'Community Survey', category: 'Research', icon: '👥' },
  { id: 'local-language', label: 'Local Language', category: 'Communication', icon: '🗣️' },
  { id: 'monitoring', label: 'Monitoring', category: 'Operations', icon: '👁️' },
  { id: 'surveys', label: 'Surveys', category: 'Research', icon: '📋' },
  { id: 'crop-monitoring', label: 'Crop Monitoring', category: 'Technical', icon: '🌱' },
  { id: 'education-research', label: 'Education Research', category: 'Research', icon: '📚' },
  { id: 'product-testing', label: 'Product Testing', category: 'Technical', icon: '🧪' },
  { id: 'user-research-advanced', label: 'Advanced User Research', category: 'Research', icon: '👥' },
  { id: 'machine-learning', label: 'Machine Learning', category: 'Technical', icon: '🤖' },
  { id: 'javascript', label: 'JavaScript', category: 'Technical', icon: '⚡' },
  { id: 'nodejs', label: 'Node.js', category: 'Technical', icon: '🟢' },
  { id: 'mongodb', label: 'MongoDB', category: 'Technical', icon: '🍃' },
  { id: 'mysql', label: 'MySQL', category: 'Technical', icon: '🐬' },
  { id: 'aws', label: 'AWS', category: 'Technical', icon: '☁️' },
  { id: 'docker', label: 'Docker', category: 'Technical', icon: '🐳' },
  { id: 'git', label: 'Git', category: 'Technical', icon: '📝' }
];
