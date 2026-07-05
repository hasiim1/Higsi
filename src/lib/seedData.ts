// Seed Data imported from Notion Workspace

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturer: string;
  location: string;
  email: string;
  credits: number;
  cover_url: string;
  schedule: string[];
  fee_status: string;
  archived: boolean;
  progress: number;
}

export interface Module {
  id: string;
  course_id: string;
  name: string;
  order_index: number;
  description: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  name: string;
  order_index: number;
  content: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Task {
  id: string;
  course_id: string | null;
  name: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  due_date: string | null;
}

export interface Assignment {
  id: string;
  course_id: string | null;
  name: string;
  type: string;
  status: 'Not started' | 'In progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  deadline: string | null;
  score: number | null;
  grade: string | null;
}

export interface Note {
  id: string;
  course_id: string | null;
  name: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  course_id: string | null;
  duration: number; // in seconds
  type: 'Deep Work' | 'Break';
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const SEED_COURSES: Course[] = [
  {
    id: 'e5b8e93d-9d41-453b-bd93-17b6a12b322a',
    name: 'Ethics',
    code: 'CS104',
    lecturer: 'Dr. John Doe',
    location: 'Online',
    email: 'johndoe@university.edu',
    credits: 3,
    cover_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60',
    schedule: ['Sun 9:00-10:10'],
    fee_status: '🟢 Bixiyay',
    archived: false,
    progress: 75
  },
  {
    id: 'bf94f2f5-627f-4237-be40-632d934bb79d',
    name: 'physics 2',
    code: 'BCS126',
    lecturer: 'Dr. Axmed B',
    location: 'ExamBuild hall1 and physics lab',
    email: 'axmedb@university.edu',
    credits: 100,
    cover_url: 'https://images.pexels.com/photos/6444/pencil-typography-black-design.jpg',
    schedule: ['Sun 9:00-10:10', 'Tue 2:00-4:00'],
    fee_status: '🟢 Bixiyay',
    archived: false,
    progress: 72
  },
  {
    id: '37156590-7582-4450-bb41-b9e695805f15',
    name: 'Structured programming',
    code: 'CS205',
    lecturer: 'Dr. Ibrahim',
    location: 'Cis lab 6',
    email: 'test@gmail.com',
    credits: 100,
    cover_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60',
    schedule: ['Tue 2:00-4:00'],
    fee_status: '🟢 Bixiyay',
    archived: false,
    progress: 18
  },
  {
    id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de',
    name: 'Calculus2',
    code: 'BCS125',
    lecturer: 'Dr. iBRAHIM',
    location: 'Main Hall B',
    email: 'ibrahim@university.edu',
    credits: 4,
    cover_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60',
    schedule: ['Sun 9:00-10:10'],
    fee_status: '🟢 Bixiyay',
    archived: false,
    progress: 45
  },
  {
    id: 'f11671c4-0294-4b67-b266-7ab222c1ff2b',
    name: 'Business',
    code: 'CS304',
    lecturer: 'Dr. Jane Smith',
    location: 'Online',
    email: 'janesmith@university.edu',
    credits: 3,
    cover_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60',
    schedule: ['Sun 9:00-10:10'],
    fee_status: '🟢 Bixiyay',
    archived: false,
    progress: 30
  },
  {
    id: 'd52b15c1-43e3-41fc-8e8e-8fd25822e1cc',
    name: 'Electronics',
    code: 'BCS124',
    lecturer: 'Dr. Xafso',
    location: 'Cis lab5',
    email: 'xafso@university.edu',
    credits: 4,
    cover_url: 'https://images.unsplash.com/photo-1517420712361-2e6d99c00da1?w=800&auto=format&fit=crop&q=60',
    schedule: ['Tue 2:00-4:00'],
    fee_status: '🟢 Bixiyay',
    archived: false,
    progress: 50
  }
];

export const SEED_MODULES: Module[] = [
  {
    id: 'm1',
    course_id: 'bf94f2f5-627f-4237-be40-632d934bb79d', // physics 2
    name: 'Introduction to Mechanics',
    order_index: 1,
    description: 'Kinematics, dynamics, and Newton\'s laws of motion.'
  },
  {
    id: 'm2',
    course_id: 'bf94f2f5-627f-4237-be40-632d934bb79d', // physics 2
    name: 'Electrostatics',
    order_index: 2,
    description: 'Electric charge, field, and potential.'
  },
  {
    id: 'm3',
    course_id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de', // Calculus2
    name: 'Techniques of Integration',
    order_index: 1,
    description: 'Integration by parts, trigonometric integrals, and partial fractions.'
  }
];

export const SEED_LESSONS: Lesson[] = [
  {
    id: 'l1',
    module_id: 'm1',
    name: 'Vectors and 1D Kinematics',
    order_index: 1,
    content: 'Review of vector math and linear movement equations.',
    status: 'completed'
  },
  {
    id: 'l2',
    module_id: 'm1',
    name: 'Projectile Motion',
    order_index: 2,
    content: 'Analyzing movement in two dimensions under gravity.',
    status: 'completed'
  },
  {
    id: 'l3',
    module_id: 'm2',
    name: 'Coulomb\'s Law',
    order_index: 1,
    content: 'Forces between electric charges at rest.',
    status: 'in_progress'
  },
  {
    id: 'l4',
    module_id: 'm3',
    name: 'Integration by Parts',
    order_index: 1,
    content: 'The product rule for integration: uv - integral v du.',
    status: 'completed'
  }
];

export const SEED_NOTES: Note[] = [
  {
    id: 'n1',
    course_id: 'e5b8e93d-9d41-453b-bd93-17b6a12b322a', // Ethics
    name: 'Introduction to Ethical Theories',
    content: '# Introduction to Ethical Theories\n\nNotes on Kantian Deontology, Utilitarianism, and Virtue Ethics.\n\n- **Deontology**: Rules are absolute, duty-based.\n- **Utilitarianism**: Consequence-based, greatest good for the greatest number.',
    tags: ['ethics', 'philosophy'],
    created_at: new Date('2026-02-11T15:53:00Z').toISOString(),
    updated_at: new Date('2026-02-22T08:22:00Z').toISOString()
  },
  {
    id: 'n2',
    course_id: 'bf94f2f5-627f-4237-be40-632d934bb79d', // physics 2
    name: 'Adobe Photoshop Interface (Design note)',
    content: '# Photoshop Interface Basics\n\nStudy notes on tools panel, layers sidebar, and document canvas set up for Physics Lab presentations.',
    tags: ['design', 'tools'],
    created_at: new Date('2026-02-11T15:53:00Z').toISOString(),
    updated_at: new Date('2026-02-22T08:27:00Z').toISOString()
  },
  {
    id: 'n3',
    course_id: '37156590-7582-4450-bb41-b9e695805f15', // Structured programming
    name: 'History of C & WW1 Info',
    content: '# History of C Programming\n\n- Developed at Bell Labs by Dennis Ritchie.\n- Linked to UNIX operating system evolution.',
    tags: ['history', 'c'],
    created_at: new Date('2026-02-11T15:53:00Z').toISOString(),
    updated_at: new Date('2026-02-11T15:53:00Z').toISOString()
  },
  {
    id: 'n4',
    course_id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de', // Calculus2
    name: 'Integration Techniques Cheat Sheet',
    content: '# Integration Cheat Sheet\n\nKey integration equations and formulas.\n\n- `\\int u dv = uv - \\int v du`\n- `\\int \\sin(x) dx = -\\cos(x) + C`',
    tags: ['calculus', 'math'],
    created_at: new Date('2026-02-11T15:53:00Z').toISOString(),
    updated_at: new Date('2026-02-11T15:53:00Z').toISOString()
  }
];

export const SEED_TASKS: Task[] = [
  {
    id: 't1',
    course_id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de', // Calculus2
    name: 'Complete integration homework problems',
    status: 'To Do',
    priority: 'High',
    due_date: new Date('2026-07-02T18:00:00Z').toISOString()
  },
  {
    id: 't2',
    course_id: 'bf94f2f5-627f-4237-be40-632d934bb79d', // physics 2
    name: 'Write up physics lab report 3',
    status: 'In Progress',
    priority: 'Medium',
    due_date: new Date('2026-06-30T23:59:00Z').toISOString()
  },
  {
    id: 't3',
    course_id: '37156590-7582-4450-bb41-b9e695805f15', // Structured programming
    name: 'Implement binary search in C',
    status: 'Completed',
    priority: 'Low',
    due_date: new Date('2026-06-25T12:00:00Z').toISOString()
  },
  {
    id: 't4',
    course_id: 'e5b8e93d-9d41-453b-bd93-17b6a12b322a', // Ethics
    name: 'Read Ethics Case Study 1',
    status: 'To Do',
    priority: 'Medium',
    due_date: new Date('2026-07-04T09:00:00Z').toISOString()
  }
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    course_id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de', // Calculus2
    name: 'Web Dev Lab',
    type: 'Project',
    status: 'In progress',
    priority: 'High',
    deadline: new Date('2026-07-15T23:59:00Z').toISOString(),
    score: 60,
    grade: 'C'
  },
  {
    id: 'a2',
    course_id: '37156590-7582-4450-bb41-b9e695805f15', // Structured programming
    name: 'WW1 Exam Project',
    type: 'Midterm',
    status: 'In progress',
    priority: 'High',
    deadline: new Date('2026-07-05T09:00:00Z').toISOString(),
    score: 90,
    grade: 'A'
  },
  {
    id: 'a3',
    course_id: 'bf94f2f5-627f-4237-be40-632d934bb79d', // physics 2
    name: 'Web Design Project',
    type: 'Assignment',
    status: 'In progress',
    priority: 'Medium',
    deadline: new Date('2026-07-20T23:59:00Z').toISOString(),
    score: 80,
    grade: 'B'
  },
  {
    id: 'a4',
    course_id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de', // Calculus2
    name: 'Test Assignment 1',
    type: 'Assignment',
    status: 'Not started',
    priority: 'Medium',
    deadline: new Date('2026-07-01T23:59:00Z').toISOString(),
    score: 40,
    grade: 'D'
  }
];

export const SEED_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'f-s1',
    course_id: 'ab3c0f42-27b2-42a6-a7c3-f662cdf195de',
    duration: 1500, // 25 min
    type: 'Deep Work',
    created_at: new Date('2026-06-26T14:45:00Z').toISOString()
  },
  {
    id: 'f-s2',
    course_id: 'bf94f2f5-627f-4237-be40-632d934bb79d',
    duration: 3000, // 50 min
    type: 'Deep Work',
    created_at: new Date('2026-06-27T15:45:00Z').toISOString()
  },
  {
    id: 'f-s3',
    course_id: null,
    duration: 300, // 5 min
    type: 'Break',
    created_at: new Date('2026-06-27T16:35:00Z').toISOString()
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-t1',
    title: 'Upcoming Deadline',
    content: 'Your Calculus2 Test Assignment is due in 3 days.',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'n-t2',
    title: 'Streak Achieved!',
    content: 'Congratulations! You have maintained a 7-day study streak!',
    is_read: false,
    created_at: new Date().toISOString()
  }
];
