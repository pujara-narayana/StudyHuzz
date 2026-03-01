-- =============================================
-- StudyHuzz Seed Data — 25 Dev Profiles
-- Run AFTER schema.sql
-- Photos from randomuser.me (free placeholders)
-- =============================================

DO $$
DECLARE
  p1  UUID := '11111111-0000-0000-0000-000000000001';
  p2  UUID := '11111111-0000-0000-0000-000000000002';
  p3  UUID := '11111111-0000-0000-0000-000000000003';
  p4  UUID := '11111111-0000-0000-0000-000000000004';
  p5  UUID := '11111111-0000-0000-0000-000000000005';
  p6  UUID := '11111111-0000-0000-0000-000000000006';
  p7  UUID := '11111111-0000-0000-0000-000000000007';
  p8  UUID := '11111111-0000-0000-0000-000000000008';
  p9  UUID := '11111111-0000-0000-0000-000000000009';
  p10 UUID := '11111111-0000-0000-0000-000000000010';
  p11 UUID := '11111111-0000-0000-0000-000000000011';
  p12 UUID := '11111111-0000-0000-0000-000000000012';
  p13 UUID := '11111111-0000-0000-0000-000000000013';
  p14 UUID := '11111111-0000-0000-0000-000000000014';
  p15 UUID := '11111111-0000-0000-0000-000000000015';
  p16 UUID := '11111111-0000-0000-0000-000000000016';
  p17 UUID := '11111111-0000-0000-0000-000000000017';
  p18 UUID := '11111111-0000-0000-0000-000000000018';
  p19 UUID := '11111111-0000-0000-0000-000000000019';
  p20 UUID := '11111111-0000-0000-0000-000000000020';
  p21 UUID := '11111111-0000-0000-0000-000000000021';
  p22 UUID := '11111111-0000-0000-0000-000000000022';
  p23 UUID := '11111111-0000-0000-0000-000000000023';
  p24 UUID := '11111111-0000-0000-0000-000000000024';
  p25 UUID := '11111111-0000-0000-0000-000000000025';
BEGIN

-- ─── PROFILES ────────────────────────────────────────────────────────────────

INSERT INTO profiles (id, name, major, year, gender, age, intent, prompts, photos, is_onboarded) VALUES

(p1, 'Emma', 'Biology', 'Junior', 'Woman', 21, 'study_and_connect',
 '[{"question":"My go-to study snack is…","answer":"Iced coffee and Trader Joe''s everything crackers"},{"question":"My study playlist includes…","answer":"Lo-fi hip hop, obviously"},{"question":"The class that changed my life…","answer":"Cell Biology — I finally understood why I was pre-med"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/1.jpg','https://randomuser.me/api/portraits/women/2.jpg','https://randomuser.me/api/portraits/women/3.jpg'], TRUE),

(p2, 'Liam', 'Computer Science', 'Senior', 'Man', 22, 'study_only',
 '[{"question":"I work best when…","answer":"There''s a deadline tomorrow and coffee in my hand"},{"question":"My biggest campus pet peeve…","answer":"People who talk loudly on the quiet floors of Love Library"},{"question":"A fun fact about my major…","answer":"I''ve written more YAML than actual code"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/1.jpg','https://randomuser.me/api/portraits/men/2.jpg','https://randomuser.me/api/portraits/men/3.jpg'], TRUE),

(p3, 'Sofia', 'Psychology', 'Sophomore', 'Woman', 19, 'study_and_connect',
 '[{"question":"You''ll find me studying at…","answer":"Nebraska Union with a chai latte"},{"question":"My study alter ego is…","answer":"Rizzoli from Rizzoli & Isles — very serious, very focused"},{"question":"After finals, I celebrate by…","answer":"Sleeping for 14 hours straight"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/4.jpg','https://randomuser.me/api/portraits/women/5.jpg','https://randomuser.me/api/portraits/women/6.jpg'], TRUE),

(p4, 'Marcus', 'Mechanical Engineering', 'Junior', 'Man', 21, 'study_only',
 '[{"question":"My go-to study snack is…","answer":"Granola bars and Red Bull — the engineering diet"},{"question":"I work best when…","answer":"There''s ambient noise around me"},{"question":"The weirdest thing I''ve studied…","answer":"Fluid dynamics of ketchup packets"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/4.jpg','https://randomuser.me/api/portraits/men/5.jpg','https://randomuser.me/api/portraits/men/6.jpg'], TRUE),

(p5, 'Aaliyah', 'Marketing', 'Freshman', 'Woman', 18, 'connect_only',
 '[{"question":"I''ll always be down for…","answer":"Exploring coffee shops I haven''t tried yet"},{"question":"Ask me about…","answer":"My semester abroad plans or Taylor Swift theories"},{"question":"After finals, I celebrate by…","answer":"Online shopping I definitely shouldn''t do"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/7.jpg','https://randomuser.me/api/portraits/women/8.jpg','https://randomuser.me/api/portraits/women/9.jpg'], TRUE),

(p6, 'Noah', 'Data Science', 'Graduate', 'Man', 24, 'study_only',
 '[{"question":"A fun fact about my major…","answer":"Half of data science is just Googling pandas documentation"},{"question":"I work best when…","answer":"I''ve written my to-do list in Notion with color-coded tags"},{"question":"My study playlist includes…","answer":"Movie soundtracks — Interstellar OST hits different"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/7.jpg','https://randomuser.me/api/portraits/men/8.jpg','https://randomuser.me/api/portraits/men/9.jpg'], TRUE),

(p7, 'Priya', 'Pre-Med', 'Junior', 'Woman', 21, 'study_and_connect',
 '[{"question":"My go-to study snack is…","answer":"Mango slices and green tea"},{"question":"The class that changed my life…","answer":"Anatomy — I almost changed my major, then didn''t"},{"question":"You''ll find me studying at…","answer":"Dinsdale — the view keeps me going"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/10.jpg','https://randomuser.me/api/portraits/women/11.jpg','https://randomuser.me/api/portraits/women/12.jpg'], TRUE),

(p8, 'Jake', 'Finance', 'Senior', 'Man', 22, 'connect_only',
 '[{"question":"I''ll always be down for…","answer":"Pickup basketball or trying a new restaurant"},{"question":"Ask me about…","answer":"Investing, but I''ll probably just say index funds"},{"question":"My biggest campus pet peeve…","answer":"People who ghost group project partners"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/10.jpg','https://randomuser.me/api/portraits/men/11.jpg','https://randomuser.me/api/portraits/men/12.jpg'], TRUE),

(p9, 'Zoe', 'Journalism', 'Sophomore', 'Woman', 20, 'study_and_connect',
 '[{"question":"My study alter ego is…","answer":"A caffeinated Carrie Bradshaw typing furiously"},{"question":"The weirdest thing I''ve studied…","answer":"The ethics of meme journalism (yes, that''s a real class)"},{"question":"My study playlist includes…","answer":"Arctic Monkeys, always"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/13.jpg','https://randomuser.me/api/portraits/women/14.jpg','https://randomuser.me/api/portraits/women/15.jpg'], TRUE),

(p10, 'Ethan', 'Computer Engineering', 'Junior', 'Man', 21, 'study_only',
 '[{"question":"I work best when…","answer":"I have noise-canceling headphones and a mechanical keyboard"},{"question":"A fun fact about my major…","answer":"Half my homework is debugging code I wrote at 2am"},{"question":"My go-to study snack is…","answer":"Peanut butter crackers from the vending machine"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/13.jpg','https://randomuser.me/api/portraits/men/14.jpg','https://randomuser.me/api/portraits/men/15.jpg'], TRUE),

(p11, 'Isabella', 'Architecture', 'Sophomore', 'Woman', 20, 'study_and_connect',
 '[{"question":"You''ll find me studying at…","answer":"Architecture studios — I''ve basically moved in"},{"question":"My study playlist includes…","answer":"Frank Ocean on repeat until the design clicks"},{"question":"After finals, I celebrate by…","answer":"Not touching a ruler for one entire week"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/16.jpg','https://randomuser.me/api/portraits/women/17.jpg','https://randomuser.me/api/portraits/women/18.jpg'], TRUE),

(p12, 'Carlos', 'Chemical Engineering', 'Senior', 'Man', 23, 'study_only',
 '[{"question":"The class that changed my life…","answer":"Thermodynamics — made me rethink everything, including sleep"},{"question":"I work best when…","answer":"The lab is quiet and no one needs the fume hood"},{"question":"My biggest campus pet peeve…","answer":"Lab partners who don''t label their samples"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/16.jpg','https://randomuser.me/api/portraits/men/17.jpg','https://randomuser.me/api/portraits/men/18.jpg'], TRUE),

(p13, 'Maya', 'English', 'Junior', 'Woman', 21, 'study_and_connect',
 '[{"question":"My go-to study snack is…","answer":"Earl Grey tea and digestive biscuits"},{"question":"The weirdest thing I''ve studied…","answer":"Victorian novels about fainting as a form of protest"},{"question":"Ask me about…","answer":"My 300-page reading list (if you dare)"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/19.jpg','https://randomuser.me/api/portraits/women/20.jpg','https://randomuser.me/api/portraits/women/21.jpg'], TRUE),

(p14, 'Tyler', 'Business Administration', 'Freshman', 'Man', 18, 'connect_only',
 '[{"question":"I''ll always be down for…","answer":"Frisbee on the green or any outdoor activity"},{"question":"My biggest campus pet peeve…","answer":"When the dining hall runs out of cereal at 8am"},{"question":"After finals, I celebrate by…","answer":"Going home and letting my mom cook for a week"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/19.jpg','https://randomuser.me/api/portraits/men/20.jpg','https://randomuser.me/api/portraits/men/21.jpg'], TRUE),

(p15, 'Nadia', 'Statistics', 'Graduate', 'Woman', 25, 'study_only',
 '[{"question":"A fun fact about my major…","answer":"I can tell you the p-value of almost any life decision"},{"question":"I work best when…","answer":"I''ve batch-cooked meals and done laundry — chaos-free"},{"question":"My study playlist includes…","answer":"Classical music — Beethoven for regression, jazz for Bayesian"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/22.jpg','https://randomuser.me/api/portraits/women/23.jpg','https://randomuser.me/api/portraits/women/24.jpg'], TRUE),

(p16, 'Jordan', 'Environmental Science', 'Junior', 'Non-binary', 22, 'study_and_connect',
 '[{"question":"My go-to study snack is…","answer":"Locally sourced trail mix (yes I''m that person)"},{"question":"The class that changed my life…","answer":"Climate policy — now I can''t stop reading IPCC reports"},{"question":"I''ll always be down for…","answer":"Campus clean-ups or hiking after midterms"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/25.jpg','https://randomuser.me/api/portraits/women/26.jpg','https://randomuser.me/api/portraits/women/27.jpg'], TRUE),

(p17, 'Alex', 'Graphic Design', 'Senior', 'Man', 22, 'connect_only',
 '[{"question":"My study alter ego is…","answer":"Chaotic creative — post-its everywhere, somehow works"},{"question":"You''ll find me studying at…","answer":"Anywhere with good lighting and an outlet"},{"question":"Ask me about…","answer":"My portfolio, font opinions, or why Comic Sans is misunderstood"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/22.jpg','https://randomuser.me/api/portraits/men/23.jpg','https://randomuser.me/api/portraits/men/24.jpg'], TRUE),

(p18, 'Fatima', 'Biochemistry', 'Junior', 'Woman', 21, 'study_only',
 '[{"question":"My go-to study snack is…","answer":"Dates and almonds — brain food"},{"question":"The class that changed my life…","answer":"Biochem I — first time a class made me cry and love it"},{"question":"I work best when…","answer":"I''ve blocked social media and made a color-coded outline"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/28.jpg','https://randomuser.me/api/portraits/women/29.jpg','https://randomuser.me/api/portraits/women/30.jpg'], TRUE),

(p19, 'Ryan', 'Political Science', 'Sophomore', 'Man', 20, 'study_and_connect',
 '[{"question":"Ask me about…","answer":"Nebraska politics or why I think ranked-choice voting would fix everything"},{"question":"My study playlist includes…","answer":"Debate recordings (yes I''m serious)"},{"question":"After finals, I celebrate by…","answer":"A long run and then arguing about something online"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/25.jpg','https://randomuser.me/api/portraits/men/26.jpg','https://randomuser.me/api/portraits/men/27.jpg'], TRUE),

(p20, 'Leila', 'Nursing', 'Junior', 'Woman', 21, 'study_only',
 '[{"question":"My go-to study snack is…","answer":"Energy bars and prayer"},{"question":"I work best when…","answer":"Clinical hours are done and I''ve had 7 hours of sleep (rare)"},{"question":"The weirdest thing I''ve studied…","answer":"The history of bloodletting — it was a whole thing"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/31.jpg','https://randomuser.me/api/portraits/women/32.jpg','https://randomuser.me/api/portraits/women/33.jpg'], TRUE),

(p21, 'Brendan', 'Economics', 'Senior', 'Man', 22, 'study_and_connect',
 '[{"question":"A fun fact about my major…","answer":"We spend half our time proving obvious things with math"},{"question":"My study alter ego is…","answer":"Late-night economist — caffeine-fueled and slightly unhinged"},{"question":"I''ll always be down for…","answer":"Ping pong in the Nebraska Union or econ debate"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/28.jpg','https://randomuser.me/api/portraits/men/29.jpg','https://randomuser.me/api/portraits/men/30.jpg'], TRUE),

(p22, 'Amara', 'Communication Studies', 'Freshman', 'Woman', 18, 'connect_only',
 '[{"question":"I''ll always be down for…","answer":"Open mic nights, trivia, or exploring Lincoln"},{"question":"My biggest campus pet peeve…","answer":"Lecture slides posted 5 minutes before class"},{"question":"After finals, I celebrate by…","answer":"Movie marathon with my roommates"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/34.jpg','https://randomuser.me/api/portraits/women/35.jpg','https://randomuser.me/api/portraits/women/36.jpg'], TRUE),

(p23, 'Derek', 'Civil Engineering', 'Junior', 'Man', 21, 'study_only',
 '[{"question":"The weirdest thing I''ve studied…","answer":"Bridge failure case studies — terrifying and fascinating"},{"question":"I work best when…","answer":"I have my calculator, scratch paper, and no distractions"},{"question":"My go-to study snack is…","answer":"Nature Valley bars — I buy them in bulk"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/31.jpg','https://randomuser.me/api/portraits/men/32.jpg','https://randomuser.me/api/portraits/men/33.jpg'], TRUE),

(p24, 'Vivian', 'Mathematics', 'PhD', 'Woman', 27, 'study_and_connect',
 '[{"question":"A fun fact about my major…","answer":"I spend 90% of my time saying this is trivially obvious while it is not"},{"question":"You''ll find me studying at…","answer":"Avery Hall — it''s basically my second home"},{"question":"Ask me about…","answer":"Abstract algebra or my hot takes on math pedagogy"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/women/37.jpg','https://randomuser.me/api/portraits/women/38.jpg','https://randomuser.me/api/portraits/women/39.jpg'], TRUE),

(p25, 'Omar', 'Electrical Engineering', 'Sophomore', 'Man', 20, 'study_and_connect',
 '[{"question":"My study playlist includes…","answer":"Video game OSTs — Zelda, Halo, whatever keeps me in the zone"},{"question":"The class that changed my life…","answer":"Circuits I — I finally understood how everything works"},{"question":"I work best when…","answer":"I have a timer running and snacks on deck"}]'::jsonb,
 ARRAY['https://randomuser.me/api/portraits/men/34.jpg','https://randomuser.me/api/portraits/men/35.jpg','https://randomuser.me/api/portraits/men/36.jpg'], TRUE);

-- ─── STUDY WINDOWS ───────────────────────────────────────────────────────────
-- Dates are relative to when you run this (CURRENT_DATE + N days)

INSERT INTO study_windows (user_id, date, start_time, end_time, subjects, building_id, campus) VALUES
(p1,  CURRENT_DATE + 1, '14:00', '17:00', ARRAY['Cell Biology', 'Genetics'],              'Love Library',              'city'),
(p1,  CURRENT_DATE + 3, '10:00', '12:00', ARRAY['Organic Chemistry'],                     'Burnett Hall',              'city'),
(p2,  CURRENT_DATE + 1, '13:00', '16:00', ARRAY['Algorithms', 'Data Structures'],         'Avery Hall',                'city'),
(p2,  CURRENT_DATE + 4, '09:00', '11:00', ARRAY['Operating Systems'],                     'Love Library',              'city'),
(p3,  CURRENT_DATE + 1, '15:00', '18:00', ARRAY['Abnormal Psychology', 'Stats'],          'Nebraska Union',            'city'),
(p3,  CURRENT_DATE + 2, '11:00', '13:00', ARRAY['Research Methods'],                      'Love Library',              'city'),
(p4,  CURRENT_DATE + 1, '09:00', '12:00', ARRAY['Thermodynamics', 'Fluid Mechanics'],     'Avery Hall',                'city'),
(p4,  CURRENT_DATE + 5, '13:00', '15:00', ARRAY['Machine Design'],                        'Nebraska Union',            'city'),
(p5,  CURRENT_DATE + 2, '10:00', '13:00', ARRAY['Consumer Behavior', 'Marketing Strategy'],'Nebraska Union',           'city'),
(p6,  CURRENT_DATE + 1, '16:00', '19:00', ARRAY['Machine Learning', 'Python'],            'Avery Hall',                'city'),
(p6,  CURRENT_DATE + 3, '14:00', '17:00', ARRAY['Statistical Modeling'],                  'Love Library',              'city'),
(p7,  CURRENT_DATE + 1, '14:00', '17:30', ARRAY['Organic Chemistry', 'Biochemistry'],     'Love Library',              'city'),
(p7,  CURRENT_DATE + 4, '08:00', '11:00', ARRAY['Anatomy', 'Physiology'],                 'Burnett Hall',              'city'),
(p8,  CURRENT_DATE + 2, '13:00', '15:00', ARRAY['Corporate Finance', 'Investments'],      'College of Business (CBA)', 'city'),
(p9,  CURRENT_DATE + 1, '10:00', '13:00', ARRAY['Feature Writing', 'Media Ethics'],       'Andersen Hall',             'city'),
(p9,  CURRENT_DATE + 3, '15:00', '17:00', ARRAY['Digital Journalism'],                    'Nebraska Union',            'city'),
(p10, CURRENT_DATE + 1, '11:00', '14:00', ARRAY['Digital Logic', 'Microprocessors'],      'Avery Hall',                'city'),
(p10, CURRENT_DATE + 2, '16:00', '19:00', ARRAY['Embedded Systems'],                      'Avery Hall',                'city'),
(p11, CURRENT_DATE + 2, '12:00', '16:00', ARRAY['Design Studio', 'Structural Systems'],   'Temple Building',           'city'),
(p12, CURRENT_DATE + 1, '09:00', '12:00', ARRAY['Chemical Kinetics', 'Process Design'],   'Avery Hall',                'city'),
(p13, CURRENT_DATE + 3, '14:00', '17:00', ARRAY['Victorian Literature', 'Essay Drafts'],  'Love Library',              'city'),
(p14, CURRENT_DATE + 2, '11:00', '13:00', ARRAY['Intro to Business', 'Marketing 101'],    'College of Business (CBA)', 'city'),
(p15, CURRENT_DATE + 1, '14:00', '18:00', ARRAY['Bayesian Statistics', 'R Programming'],  'Avery Hall',                'city'),
(p15, CURRENT_DATE + 4, '10:00', '13:00', ARRAY['Time Series Analysis'],                  'Love Library',              'city'),
(p16, CURRENT_DATE + 1, '13:00', '16:00', ARRAY['Climate Policy', 'Ecology'],             'Hardin Hall',               'east'),
(p16, CURRENT_DATE + 5, '09:00', '11:00', ARRAY['Environmental Law'],                     'C.Y. Thompson Library',     'east'),
(p17, CURRENT_DATE + 2, '14:00', '17:00', ARRAY['Typography', 'Brand Identity'],          'Temple Building',           'city'),
(p18, CURRENT_DATE + 1, '15:00', '18:00', ARRAY['Biochemistry II', 'Molecular Biology'],  'Biochemistry Hall',         'east'),
(p18, CURRENT_DATE + 3, '10:00', '13:00', ARRAY['Lab Report', 'Protein Chemistry'],       'C.Y. Thompson Library',     'east'),
(p19, CURRENT_DATE + 2, '10:00', '12:00', ARRAY['American Government', 'Public Policy'],  'Love Library',              'city'),
(p20, CURRENT_DATE + 1, '08:00', '11:00', ARRAY['Pharmacology', 'Nursing Theory'],        'Love Library',              'city'),
(p20, CURRENT_DATE + 3, '19:00', '21:00', ARRAY['Clinical Skills Review'],                'Nebraska Union',            'city'),
(p21, CURRENT_DATE + 1, '14:00', '16:30', ARRAY['Econometrics', 'Game Theory'],           'College of Business (CBA)', 'city'),
(p21, CURRENT_DATE + 4, '11:00', '14:00', ARRAY['Macro Economics'],                       'Love Library',              'city'),
(p22, CURRENT_DATE + 2, '13:00', '15:00', ARRAY['Interpersonal Communication', 'Speech'], 'Nebraska Union',            'city'),
(p23, CURRENT_DATE + 1, '10:00', '13:00', ARRAY['Structural Analysis', 'Soil Mechanics'], 'Avery Hall',                'city'),
(p23, CURRENT_DATE + 5, '14:00', '17:00', ARRAY['Transportation Engineering'],             'Avery Hall',                'city'),
(p24, CURRENT_DATE + 1, '13:00', '17:00', ARRAY['Abstract Algebra', 'Topology'],          'Avery Hall',                'city'),
(p24, CURRENT_DATE + 3, '10:00', '14:00', ARRAY['Dissertation Work', 'Category Theory'],  'Avery Hall',                'city'),
(p25, CURRENT_DATE + 1, '15:00', '18:00', ARRAY['Circuits II', 'Signal Processing'],      'Avery Hall',                'city'),
(p25, CURRENT_DATE + 2, '11:00', '14:00', ARRAY['Electromagnetics'],                      'Love Library',              'city');

END $$;
