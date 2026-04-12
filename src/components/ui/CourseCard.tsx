import React from "react";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { Course } from "@/types";
import { Button } from "./Button";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const imgUrl = course.image || "https://placehold.co/600x400/e2e8f0/475569?text=Course+Image";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-gray-200 h-full group">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={imgUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">

        {/* Category & Duration Row */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px]">
            {course.category?.name || "General"}
          </span>
          <span className="flex items-center gap-1 font-medium text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            {course.durationWeeks} Weeks
          </span>
        </div>

        {/* Lecturer & Rating Row */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-gray-500">
            Lecturer <span className="text-gray-800 font-semibold">{course.instructor?.name || "Unknown"}</span>
          </span>
          <div className="flex items-center gap-1 text-gray-700 font-medium">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {course.avgRating !== null && course.avgRating !== undefined
              ? Number(course.avgRating).toFixed(1)
              : "New"}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-[15px] font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mb-5 line-clamp-3 flex-1 text-[13px] text-gray-500 leading-relaxed">
          {course.description}
        </p>

        {/* Bottom: Price + Button */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-[11px] text-gray-400 block leading-tight">Starting from</span>
            <span className="text-xl font-extrabold text-gray-900">${course.basePrice}</span>
          </div>
          <Button asChild variant="primary" size="sm" className="px-5 rounded-lg font-semibold h-9 text-[13px]">
            <Link href={`/courses/${course.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
