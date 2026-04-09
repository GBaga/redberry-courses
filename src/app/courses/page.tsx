"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, ChevronDown, Check } from "lucide-react";
import { api } from "@/services/api";
import { Course, Category, Topic, Instructor, PaginatedResponse } from "@/types";
import { CourseCard } from "@/components/ui/CourseCard";
import { FilterSidebar } from "./FilterSidebar";

import { Suspense } from "react";

function CoursesPageContent() {
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
  const [isSortOpen, setIsSortOpen] = useState(false);

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

            <div className="flex items-center gap-3 relative z-10">
              <span className="text-sm font-medium text-gray-500">Sort by:</span>
              
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  disabled={isLoading}
                  className={`flex items-center justify-between w-48 h-10 px-4 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 bg-white ${isSortOpen ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <span className="font-medium text-gray-700">
                    {{
                      newest: "Newest First",
                      price_asc: "Price Low to High",
                      price_desc: "Price High to Low",
                      popular: "Most Popular"
                    }[activeSort] || "Newest First"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>

                {isSortOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {[
                        { value: "newest", label: "Newest First" },
                        { value: "price_asc", label: "Price Low to High" },
                        { value: "price_desc", label: "Price High to Low" },
                        { value: "popular", label: "Most Popular" },
                      ].map((opt) => {
                        const isSelected = activeSort === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setQueryParams({ sort: opt.value, page: 1 });
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${isSelected ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                          >
                            {opt.label}
                            {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Previous
                </button>

                {Array.from({ length: pageMeta.lastPage }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setQueryParams({ page: pNum })}
                      className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
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

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <CoursesPageContent />
    </Suspense>
  );
}
