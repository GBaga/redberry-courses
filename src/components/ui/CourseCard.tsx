import React from "react";
import Link from "next/link";
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
        <h3 className="mb-2 line-clamp-2 text-[15px] font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="mb-5 line-clamp-2 flex-1 text-[13px] text-gray-500 leading-relaxed">
          {course.description}
        </p>

        {/* Bottom: Price + Button */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xl font-extrabold text-gray-900">${course.basePrice}</span>
          <Button asChild variant="primary" size="sm" className="px-5 rounded-md font-semibold h-9 text-[13px]">
            <Link href={`/courses/${course.id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
