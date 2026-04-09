"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/services/api";
import { Course, Category, Topic, Instructor, PaginatedResponse } from "@/types";
import { CourseCard } from "@/components/ui/CourseCard";
import { FilterSidebar } from "./FilterSidebar";

export default function CoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state syncing wrapper
  const setQueryParams = (params: Record<string, any>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        current.delete(key);
      } else {
        if (Array.isArray(val)) {
          const keyName = key.endsWith('[]') ? key : `${key}[]`;
          current.delete(keyName);
          val.forEach(v => current.append(keyName, String(v)));
        } else {
          current.set(key, String(val));
        }
      }
    });
    router.replace(`${pathname}?${current.toString()}`);
  };

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageMeta, setPageMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Filters
  const activeSort = searchParams.get("sort") || "newest";
  const activePage = parseInt(searchParams.get("page") || "1");
  const activeSearch = searchParams.get("search") || "";
  const activeCategories = searchParams.getAll("categories[]").map(Number);
  const activeTopics = searchParams.getAll("topics[]").map(Number);
  const activeInstructors = searchParams.getAll("instructors[]").map(Number);

  // Data Fetching
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams(Array.from(searchParams.entries())).toString();
        const { data } = await api.get<PaginatedResponse<Course>>(`/courses?${query}`);
        setCourses(data.data);
        setPageMeta(data.meta);
        setTotalCourses(data.meta.total);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchCourses();
    }, 150);
    return () => clearTimeout(debounce);
  }, [searchParams]);

  const clearAllFilters = () => {
    router.replace(pathname);
  };

  const activeFiltersCount = activeCategories.length + activeTopics.length + activeInstructors.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-[1440px]">

      {/* Two-column layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0">
          <FilterSidebar
            activeSearch={activeSearch}
            activeCategories={activeCategories}
            activeTopics={activeTopics}
            activeInstructors={activeInstructors}
            setQueryParams={setQueryParams}
            clearAllFilters={clearAllFilters}
            activeFiltersCount={activeFiltersCount + (activeSearch ? 1 : 0)}
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Title + Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              All Courses <span className="text-gray-400 text-lg font-normal ml-2">({totalCourses})</span>
            </h1>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-500">Sort by:</label>
              <select
                id="sort"
                value={activeSort}
                onChange={(e) => setQueryParams({ sort: e.target.value, page: 1 })}
                className="h-10 border border-gray-300 rounded-lg text-sm pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price Low to High</option>
                <option value="price_desc">Price High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Courses Grid — 3 columns */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={clearAllFilters} className="text-indigo-600 font-semibold hover:underline">
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pageMeta && pageMeta.lastPage > 1 && (
            <div className="mt-12 flex justify-center border-t border-gray-200 pt-8">
              <div className="flex items-center gap-1">
                <button
                  disabled={activePage === 1}
                  onClick={() => setQueryParams({ page: activePage - 1 })}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: pageMeta.lastPage }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setQueryParams({ page: pNum })}
                      className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        activePage === pNum
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={activePage === pageMeta.lastPage}
                  onClick={() => setQueryParams({ page: activePage + 1 })}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
