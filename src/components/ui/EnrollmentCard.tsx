import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Enrollment } from "@/types";
import { Button } from "./Button";

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const { course, progress } = enrollment;
  const imgUrl = course.image || "https://placehold.co/200x200/e2e8f0/475569?text=Course";

  return (
    <div className="flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md p-4 gap-4 items-start">
      {/* Left: Square Thumbnail */}
      <Link href={`/courses/${course.id}`} className="shrink-0">
        <div className="w-[90px] h-[90px] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={imgUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      {/* Right: Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        {/* Lecturer & Rating Row */}
        <div className="flex items-center justify-between mb-1 text-xs">
          <span className="text-gray-500 truncate">
            Lecturer <span className="text-gray-800 font-semibold">{course.instructor?.name || "Unknown"}</span>
          </span>
          <div className="flex items-center gap-1 text-gray-700 font-medium shrink-0 ml-2">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {course.avgRating !== null && course.avgRating !== undefined
              ? Number(course.avgRating).toFixed(1)
              : "New"}
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 leading-snug mb-3">
          {course.title}
        </h3>

        {/* Progress Row + View Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-gray-500 font-medium">{progress}% Complete</span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 mt-1">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="px-4 rounded-md text-xs font-semibold h-8 shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
            <Link href={`/courses/${course.id}`}>Continue</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
