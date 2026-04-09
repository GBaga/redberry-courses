import React from "react";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { Enrollment } from "@/types";
import { Button } from "./Button";

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const { course, progress } = enrollment;
  const imgUrl = course.image || "https://placehold.co/600x400/e2e8f0/475569?text=Course+Image";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md h-full">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={imgUrl}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 right-3 rounded bg-white/90 backdrop-blur px-1.5 py-0.5 text-xs font-semibold text-gray-900 shadow-sm flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {course.avgRating !== null ? course.avgRating.toFixed(1) : "New"}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-4 line-clamp-2 text-base font-bold text-gray-900 leading-snug">
          {course.title}
        </h3>
        
        <div className="mt-auto space-y-4">
          <div className="w-full">
            <div className="mb-1.5 flex justify-between text-xs text-gray-500 font-medium">
               <span>Progress</span>
               <span className="text-indigo-600 font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-50">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
             <span className="text-xs font-medium text-gray-500 w-1/2">
                12 Modules
             </span>
             <Button asChild variant={progress === 100 ? "primary" : "outline"} size="sm" className="px-5 rounded-md text-xs font-semibold w-full sm:w-auto h-9">
               <Link href={`/courses/${course.id}`} className="flex items-center gap-1.5">
                 {progress === 100 ? "Review" : <><Play className="w-3.5 h-3.5 fill-current" /> Play</>}
               </Link>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
