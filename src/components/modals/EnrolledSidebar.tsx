"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, BookOpen, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { api } from "@/services/api";
import { Enrollment } from "@/types";

export function EnrolledSidebar({ isOpen }: { isOpen: boolean }) {
  const { popModal, switchModal } = useModal();
  const { user } = useAuth();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;
    
    // Auth guard just in case 
    if (!user) {
      popModal();
      switchModal("login");
      return;
    }

    const fetchEnrollments = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<{ data: Enrollment[] }>("/enrollments");
        setEnrollments(data.data);
      } catch (err) {
        console.error("Failed to fetch enrollments for sidebar", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [isOpen, user, popModal, switchModal]);

  const totalCourses = enrollments.reduce((sum, enr) => sum + (enr.quantity || 1), 0);
  // Technically total cost could sum individual .totalPrice if the API returned it, or calculate:
  const totalCost = enrollments.reduce((sum, enr) => sum + Number(enr.totalPrice || 0), 0);

  // Use a custom wrapper instead of Modal to get the right-side sliding drawer effect
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
         onClick={popModal} 
         title="Close sidebar"
       />
       
       {/* Drawer Panel */}
       <div className="relative w-full max-w-md bg-gray-50 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
         
         <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200 shrink-0">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <BookOpen className="w-5 h-5 text-indigo-600" /> My Learning
           </h2>
           <button
             onClick={popModal}
             className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
           {isLoading ? (
             <div className="space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}
             </div>
           ) : enrollments.length > 0 ? (
             <div className="space-y-5">
               {enrollments.map((enr) => (
                 <Link 
                   href={`/courses/${enr.course.id}`} 
                   key={enr.id}
                   onClick={popModal}
                   className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all relative"
                 >
                   <div className="flex h-24 bg-gray-100 relative">
                      <img src={enr.course.image || "https://placehold.co/400x300"} alt="Course" className="w-1/3 object-cover" />
                      <div className="w-2/3 p-3 flex flex-col justify-center">
                         <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{enr.course.title}</h4>
                         <p className="text-xs text-gray-500 mt-1 capitalize">{enr.schedule.sessionType.name.replace("_", " ")} Format</p>
                         <div className="mt-2 text-xs font-semibold text-gray-900">${Number(enr.totalPrice || 0).toFixed(2)}</div>
                      </div>
                      
                      {enr.progress === 100 && (
                        <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          Done
                        </div>
                      )}
                   </div>
                   <div className="h-1 w-full bg-gray-100">
                      <div 
                        className={`h-full ${enr.progress === 100 ? "bg-emerald-500" : "bg-indigo-600"}`} 
                        style={{ width: `${enr.progress}%` }} 
                      />
                   </div>
                   <div className="bg-gray-50 px-3 py-2 text-[11px] text-gray-500 flex justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                      <span>{enr.schedule.weeklySchedule.label}</span>
                      <span className="flex items-center text-indigo-600 font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Resume <ChevronRight className="w-3 h-3 ml-0.5" /></span>
                   </div>
                 </Link>
               ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center px-4">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                 <GraduationIcon className="w-10 h-10 text-indigo-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Your journey starts here!</h3>
               <p className="text-gray-500 mb-8 max-w-[250px]">Browse our catalog and enroll in your first course.</p>
               <Button onClick={() => {
                 popModal();
                 // Using native Next Link navigation instead
                 window.location.href = "/courses";
               }}>Browse Courses</Button>
             </div>
           )}
         </div>

         {/* Summary Footer */}
         {enrollments.length > 0 && !isLoading && (
           <div className="p-6 bg-white border-t border-gray-200 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-10">
             <div className="flex justify-between items-center mb-1 text-sm">
               <span className="text-gray-500 font-medium">Total Enrollments:</span>
               <span className="font-bold text-gray-900">{totalCourses}</span>
             </div>
             <div className="flex justify-between items-end">
               <span className="text-gray-500 font-medium text-sm">Total Investment:</span>
               <span className="text-2xl font-extrabold text-indigo-600">${totalCost.toFixed(2)}</span>
             </div>
           </div>
         )}
       </div>
    </div>
  );
}

// Fallback visual icon
function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
