export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  age: number | null;
  profileComplete: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface Topic {
  id: number;
  name: string;
  categoryId: number;
}

export interface Instructor {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  basePrice: number;
  durationWeeks: number;
  isFeatured: boolean;
  avgRating: number | null;
  reviewCount: number;
  category: Category;
  topic: Topic;
  instructor: Instructor;
}

export interface Review {
  userId: number;
  rating: number;
}

export interface CourseDetail extends Course {
  reviews: Review[];
  isRated: boolean;
  enrollment: Enrollment | null;
}

export interface WeeklySchedule {
  id: number;
  label: string;
  days: string[];
}

export interface TimeSlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface SessionType {
  id: number;
  courseScheduleId: number;
  name: "online" | "in_person" | "hybrid";
  priceModifier: number;
  availableSeats: number;
  location: string | null;
}

export interface Enrollment {
  id: number;
  quantity: number;
  totalPrice: number;
  progress: number;
  completedAt: string | null;
  course: Course;
  schedule: {
    weeklySchedule: WeeklySchedule;
    timeSlot: TimeSlot;
    sessionType: SessionType;
    location: string | null;
  };
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
