"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import { EnrollmentCard } from "@/components/ui/EnrollmentCard";
import { api } from "@/services/api";
import { Course, Enrollment } from "@/types";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { pushModal, switchModal } = useModal();
  
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  
  const [inProgress, setInProgress] = useState<Enrollment[]>([]);
  const [inProgressLoading, setInProgressLoading] = useState(true);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider Content Data
  const slides = [
    {
       title: "Start learning something new today",
       text: "Explore a wide range of courses in web design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.",
       btnText: "Browse Courses",
       href: "/courses",
       gradient: "from-[#9D4EDD] via-[#FF0054] to-[#FF5400]",
       blob1: "bg-fuchsia-400 -top-[400px] -left-[200px]",
       blob2: "bg-orange-400 -bottom-[300px] -right-[100px]",
    },
    {
       title: "Pick up where you left off",
       text: "Your learning journey is already in progress. Continue your enrolled courses, track your progress, and stay on track toward completing your goals.",
       btnText: "Continue Learning",
       onClick: () => user ? pushModal("sidebar") : switchModal("login"),
       gradient: "from-[#Ff0054] via-[#FF5400] to-[#FFB703]",
       blob1: "bg-yellow-400 -top-[300px] -left-[100px]",
       blob2: "bg-red-500 -bottom-[400px] -right-[200px]",
    },
    {
       title: "Learn together, grow faster",
       text: "Join our vibrant community of professional developers. Practice skills alongside industry veterans, review code together, and accelerate your career.",
       btnText: "Learn More",
       href: "/courses?categories[]=1", // Just a generic route
       gradient: "from-[#00b4d8] via-[#80ed99] to-[#FF0054]",
       blob1: "bg-green-400 -top-[400px] -left-[100px]",
       blob2: "bg-teal-400 -bottom-[200px] -right-[200px]",
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Fetch Featured Courses
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get<{ data: Course[] }>("/courses/featured");
        setFeaturedCourses(data.data);
      } catch (error) {
        console.error("Failed to fetch featured courses", error);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch In-Progress Courses if authenticated
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setInProgressLoading(false);
      return;
    }

    const fetchInProgress = async () => {
      try {
        const { data } = await api.get<{ data: Enrollment[] }>("/courses/in-progress");
        setInProgress(data.data);
      } catch (error) {
        console.error("Failed to fetch in-progress courses", error);
      } finally {
        setInProgressLoading(false);
      }
    };
    
    fetchInProgress();
  }, [user, authLoading]);

  // Renders the Featured Courses section
  const renderFeaturedSection = () => (
    <section className="mb-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Start Learning Today</h2>
          <p className="text-sm text-gray-500">Choose from our most popular courses and begin your journey.</p>
        </div>
      </div>
      
      {featuredLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[340px] bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : featuredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
          No featured courses available at the moment.
        </div>
      )}
    </section>
  );

  // Renders the Continue Learning section
  const renderContinueSection = () => (
    <section className="mb-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Continue Learning</h2>
          <p className="text-sm text-gray-500">Pick up where you left off.</p>
        </div>
        {user && inProgress.length > 0 && (
           <button 
             onClick={() => pushModal("sidebar")}
             className="text-indigo-600 text-sm font-semibold hover:text-indigo-700"
           >
             See All
           </button>
        )}
      </div>

      {authLoading || inProgressLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-[300px] bg-gray-200 rounded-xl animate-pulse"></div>
           ))}
         </div>
      ) : !user ? (
        // Locked / Unauthorized blurred state matching Figma exactly
        <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="p-8 pb-32 opacity-20 select-none pointer-events-none filter blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[300px] bg-gray-200 rounded-xl"></div>
               ))}
            </div>
          </div>
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/40">
             <div className="bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.06)] rounded-2xl p-8 max-w-sm w-full text-center border border-gray-100">
               <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                 <UserIcon className="w-5 h-5 text-indigo-600" />
               </div>
               <p className="text-[15px] font-semibold text-gray-900 mb-6 px-4">
                 Sign in to track your learning progress
               </p>
               <Button onClick={() => switchModal("login")} className="px-8 bg-indigo-600 hover:bg-indigo-700 font-medium tracking-wide shadow-md shadow-indigo-200">
                 Log In
               </Button>
             </div>
          </div>
        </div>
      ) : inProgress.length > 0 ? (
        // Authenticated state with active enrollments
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inProgress.slice(0, 3).map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      ) : null}
    </section>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-[1440px]">
      
      {/* Hero Banner Slider Component */}
      <div className="relative rounded-[24px] overflow-hidden mb-12 shadow-sm aspect-[4/1] min-h-[220px] md:min-h-[300px] transition-all duration-700 ease-in-out">
         {/* Background gradients mapping to Figma representation */}
         <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient} opacity-90 transition-all duration-1000 ease-in-out`} />
         <div className="absolute inset-0 bg-[url('https://placehold.co/1200x400/transparent/white?text=Abstract+Texture')] opacity-20 mix-blend-overlay" />
         
         <div className={`absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-40 transition-all duration-1000 ${slides[currentSlide].blob1}`} />
         <div className={`absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 transition-all duration-1000 ${slides[currentSlide].blob2}`} />

         <div className="relative h-full flex flex-col justify-center px-8 md:px-16 w-full max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentSlide}>
           <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
             {slides[currentSlide].title}
           </h1>
           <p className="text-white/90 text-sm md:text-base font-medium mb-8 max-w-2xl drop-shadow">
             {slides[currentSlide].text}
           </p>
           <div>
             {slides[currentSlide].href ? (
               <Button asChild size="md" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-8 py-6 rounded-lg text-base shadow-lg shadow-indigo-900/20">
                 <Link href={slides[currentSlide].href}>{slides[currentSlide].btnText}</Link>
               </Button>
             ) : (
               <Button onClick={slides[currentSlide].onClick} size="md" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-8 py-6 rounded-lg text-base shadow-lg shadow-indigo-900/20">
                 {slides[currentSlide].btnText}
               </Button>
             )}
           </div>
         </div>

         {/* Banner Navigation overlay matching Figma */}
         <div className="absolute bottom-6 md:bottom-8 right-8 md:right-16 flex items-center gap-8 z-20">
           <div className="flex gap-2">
             {slides.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={() => setCurrentSlide(idx)}
                 className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
                 aria-label={`Go to slide ${idx + 1}`}
               />
             ))}
           </div>
           <div className="flex gap-3">
             <button 
               onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
               className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
             >
               <ChevronLeft className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
               className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors"
             >
               <ChevronRight className="w-4 h-4" />
             </button>
           </div>
         </div>
      </div>

      {/* Main Content Ordering Based on Auth State and Figma Variations */}
      {user ? (
        <>
          {renderContinueSection()}
          {renderFeaturedSection()}
        </>
      ) : (
        <>
          {renderFeaturedSection()}
          {renderContinueSection()}
        </>
      )}

    </div>
  );
}
