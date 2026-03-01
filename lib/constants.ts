export const COLORS = {
  primary: '#6C47FF',
  secondary: '#FF6B6B',
  background: '#0F0F13',
  cardBg: '#1A1A24',
  surface: '#242433',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  border: '#2E2E42',
  success: '#4ECDC4',
  intentStudyOnly: '#4A90D9',
  intentStudyConnect: '#7B68EE',
  intentConnectOnly: '#FF6B9D',
};

export const CITY_CAMPUS_BUILDINGS = [
  'Love Library',
  'Adele Coryell Hall',
  'Andersen Hall',
  'Avery Hall',
  'Bessey Hall',
  'Burnett Hall',
  'Canfield Administration Building',
  'Cather Dining Complex',
  'Chase Hall',
  'College of Business (CBA)',
  'Dinsdale Family Learning Commons',
  'Henzlik Hall',
  'Jackie Gaughan Multicultural Center',
  'Kauffman Academic Residential Center',
  'Lied Center for Performing Arts',
  'Memorial Stadium (study areas)',
  'Nebraska Union',
  'Richards Hall',
  'Schorr Center',
  'Sheldon Museum of Art (reading room)',
  'Temple Building',
  'Vine Street Shops (café study areas)',
  'Westbrook Music Building',
];

export const EAST_CAMPUS_BUILDINGS = [
  'C.Y. Thompson Library',
  'Animal Science Building',
  'Biochemistry Hall',
  'Food Industry Complex',
  'Hardin Hall',
  'Keim Hall',
  'Mussehl Hall',
  'Prem S. Paul Research Center',
  'Veterinary Science Building',
];

export const MAJORS = [
  'Actuarial Science', 'Advertising', 'Agribusiness', 'Agricultural Economics',
  'Animal Science', 'Architecture', 'Art', 'Biochemistry', 'Biology',
  'Business Administration', 'Chemical Engineering', 'Chemistry',
  'Civil Engineering', 'Communication Studies', 'Computer Engineering',
  'Computer Science', 'Criminal Justice', 'Data Science', 'Economics',
  'Education', 'Electrical Engineering', 'English', 'Environmental Science',
  'Finance', 'Graphic Design', 'History', 'Industrial Engineering',
  'Journalism', 'Marketing', 'Mathematics', 'Mechanical Engineering',
  'Music', 'Nursing', 'Philosophy', 'Physics', 'Political Science',
  'Pre-Med', 'Psychology', 'Public Health', 'Sociology', 'Statistics',
  'Supply Chain Management', 'Theatre', 'Other',
];

export const GENDERS = [
  'Man', 'Woman', 'Non-binary', 'Genderqueer', 'Genderfluid',
  'Agender', 'Transgender Man', 'Transgender Woman',
  'Two-Spirit', 'Prefer not to say', 'Other',
];

export const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'];

export const INTENTS = [
  {
    value: 'study_only' as const,
    label: 'Study Partner Only',
    icon: 'book-outline',
    description: 'Looking for someone to hit the books with, nothing more.',
    color: COLORS.intentStudyOnly,
  },
  {
    value: 'study_and_connect' as const,
    label: 'Study + Get to Know Each Other',
    icon: 'people-outline',
    description: 'Open to both studying and seeing where things go.',
    color: COLORS.intentStudyConnect,
  },
  {
    value: 'connect_only' as const,
    label: 'Meet New People',
    icon: 'heart-outline',
    description: 'More interested in making connections than studying.',
    color: COLORS.intentConnectOnly,
  },
];

export const PROMPT_QUESTIONS = [
  'My go-to study snack is…',
  'You\'ll find me studying at…',
  'I work best when…',
  'My study playlist includes…',
  'The class that changed my life…',
  'Ask me about…',
  'A fun fact about my major…',
  'After finals, I celebrate by…',
  'My biggest campus pet peeve…',
  'My study alter ego is…',
  'I\'ll always be down for…',
  'The weirdest thing I\'ve studied…',
];

export const INTENT_COMPATIBILITY: Record<string, string[]> = {
  study_only: ['study_only', 'study_and_connect'],
  study_and_connect: ['study_only', 'study_and_connect', 'connect_only'],
  connect_only: ['study_and_connect', 'connect_only'],
};
