"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { api } from "@/services/api";
import { Category, Topic, Instructor } from "@/types";

interface FilterBarProps {
  activeSearch: string;
  activeCategories: number[];
  activeTopics: number[];
  activeInstructors: number[];
  activeSort: string;
  setQueryParams: (updates: Record<string, string | number | number[]>) => void;
  clearAllFilters: () => void;
  activeFiltersCount: number;
}

export function FilterBar({
  activeSearch,
  activeCategories,
  activeTopics,
  activeInstructors,
  activeSort,
  setQueryParams,
  clearAllFilters,
  activeFiltersCount
}: FilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Dropdown UI states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      api.get("/categories"),
      api.get("/instructors")
    ]).then(([catRes, instRes]) => {
      setCategories(catRes.data.data);
      setInstructors(instRes.data.data);
    }).catch(err => console.error("Filter init failed", err));
  }, []);

  // Fetch topics reactively based on active categories
  useEffect(() => {
    let url = "/topics";
    if (activeCategories.length > 0) {
      const q = activeCategories.map(id => `categories[]=${id}`).join("&");
      url += `?${q}`;
    }
    api.get(url).then(res => setTopics(res.data.data)).catch(() => {});
  }, [activeCategories]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const handleCheckbox = (key: string, id: number, currentList: number[]) => {
    let newList = [...currentList];
    if (newList.includes(id)) {
       newList = newList.filter((curr) => curr !== id);
    } else {
       newList.push(id);
    }
    
    // Automatically reset topic if category is stripped
    if (key === "categories[]" && newList.length === 0) {
      setQueryParams({ "categories[]": [], "topics[]": [], page: 1 });
      return;
    }
    setQueryParams({ [key]: newList, page: 1 });
  };

  const handleSortChange = (sortVal: string) => {
    setQueryParams({ sort: sortVal, page: 1 });
    setOpenDropdown(null);
  };

  // Determine active names for chips
  const getActiveChips = () => {
     const chips: { type: string, id: number, name: string, key: string }[] = [];
     
     activeCategories.forEach(id => {
       const item = categories.find(c => c.id === id);
       if (item) chips.push({ type: 'Category', id, name: item.name, key: 'categories[]' });
     });
     
     activeTopics.forEach(id => {
       const item = topics.find(t => t.id === id);
       if (item) chips.push({ type: 'Topic', id, name: item.name, key: 'topics[]' });
     });

     activeInstructors.forEach(id => {
       const item = instructors.find(i => i.id === id);
       if (item) chips.push({ type: 'Instructor', id, name: item.name, key: 'instructors[]' });
     });

     return chips;
  };

  const activeChips = getActiveChips();

  return (
    <div className="w-full flex flex-col gap-4 mb-8">
       {/* Top Row: Dropdowns */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
             {/* Category Dropdown */}
             <div className="relative">
                <button onClick={() => toggleDropdown("category")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-100 transition-all">
                  Category <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                </button>
                {openDropdown === "category" && (
                   <div className="absolute top-12 left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                     <div className="max-h-60 overflow-y-auto px-4 py-2">
                        {categories.map(c => (
                          <label key={c.id} className="flex items-center py-2 cursor-pointer group">
                             <input type="checkbox" checked={activeCategories.includes(c.id)} onChange={() => handleCheckbox("categories[]", c.id, activeCategories)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3" />
                             <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                          </label>
                        ))}
                     </div>
                   </div>
                )}
             </div>

             {/* Topic Dropdown */}
             <div className="relative">
                <button onClick={() => toggleDropdown("topic")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-100 transition-all">
                  Topic <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                </button>
                {openDropdown === "topic" && (
                   <div className="absolute top-12 left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                     <div className="max-h-60 overflow-y-auto px-4 py-2">
                        {topics.length === 0 && <div className="text-sm text-gray-500 italic py-2">Select a category first</div>}
                        {topics.map(t => (
                          <label key={t.id} className="flex items-center py-2 cursor-pointer group">
                             <input type="checkbox" checked={activeTopics.includes(t.id)} onChange={() => handleCheckbox("topics[]", t.id, activeTopics)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3" />
                             <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">{t.name}</span>
                          </label>
                        ))}
                     </div>
                   </div>
                )}
             </div>

             {/* Instructor Dropdown */}
             <div className="relative">
                <button onClick={() => toggleDropdown("instructor")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-100 transition-all">
                  Instructor <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                </button>
                {openDropdown === "instructor" && (
                   <div className="absolute top-12 left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                     <div className="max-h-60 overflow-y-auto px-4 py-2">
                        {instructors.map(i => (
                          <label key={i.id} className="flex items-center py-2 cursor-pointer group">
                             <input type="checkbox" checked={activeInstructors.includes(i.id)} onChange={() => handleCheckbox("instructors[]", i.id, activeInstructors)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3" />
                             <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                               {i.avatar && <img src={i.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />}
                               {i.name}
                             </span>
                          </label>
                        ))}
                     </div>
                   </div>
                )}
             </div>

             {/* Price Dropdown (Mock to match Figma design as strictly required) */}
             <div className="relative">
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
                  Price <ChevronDown className="w-4 h-4 ml-1 text-gray-300" />
                </button>
             </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative ml-auto">
              <button 
                onClick={() => toggleDropdown("sort")} 
                className="flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold text-gray-900 border border-transparent hover:bg-gray-100 rounded-lg transition-all"
              >
                Sort by: <span className="text-indigo-600 font-bold capitalize">{activeSort === 'newest' ? 'Newest' : activeSort.replace('_', ' ')}</span> <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === "sort" && (
                 <div className="absolute top-12 right-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => handleSortChange("newest")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 transition-colors">Newest First</button>
                    <button onClick={() => handleSortChange("price_asc")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 transition-colors">Price Low to High</button>
                    <button onClick={() => handleSortChange("price_desc")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 transition-colors">Price High to Low</button>
                    <button onClick={() => handleSortChange("popular")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 transition-colors">Most Popular</button>
                 </div>
              )}
          </div>
       </div>

       {/* Bottom Row: Active Filter Chips */}
       {activeChips.length > 0 && (
         <div className="flex items-center flex-wrap gap-2 pt-2">
            {activeChips.map((chip, idx) => (
               <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-[13px] font-medium">
                  {chip.name}
                  <button 
                    onClick={() => {
                        let currentList = chip.key === 'categories[]' ? activeCategories : chip.key === 'topics[]' ? activeTopics : activeInstructors;
                        handleCheckbox(chip.key, chip.id, currentList);
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
               </div>
            ))}
            
            <button 
              onClick={clearAllFilters}
              className="ml-2 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Clear filters
            </button>
         </div>
       )}

       {/* Global Click outside handler to close dropdowns without external hooks for rapid integration */}
       {openDropdown && (
         <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} aria-hidden="true" />
       )}
    </div>
  );
}
