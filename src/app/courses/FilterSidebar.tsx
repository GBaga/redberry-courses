"use client";

import { useEffect, useState, useRef } from "react";
import { Filter, X, Search } from "lucide-react";
import { api } from "@/services/api";
import { Category, Topic, Instructor } from "@/types";

interface FilterSidebarProps {
  activeSearch: string;
  activeCategories: number[];
  activeTopics: number[];
  activeInstructors: number[];
  setQueryParams: (params: Record<string, any>) => void;
  clearAllFilters: () => void;
  activeFiltersCount: number;
}

export function FilterSidebar({
  activeSearch,
  activeCategories,
  activeTopics,
  activeInstructors,
  setQueryParams,
  clearAllFilters,
  activeFiltersCount,
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [localSearch, setLocalSearch] = useState(activeSearch);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync external search changes into local state
  useEffect(() => {
    setLocalSearch(activeSearch);
  }, [activeSearch]);

  // Internal Loading State
  const [loadingOpts, setLoadingOpts] = useState({ cat: true, top: true, inst: true });

  // 1. Fetch Categories and Instructors unconditionally
  useEffect(() => {
    const fetchBase = async () => {
      try {
        const [catRes, instRes] = await Promise.all([
          api.get<{ data: Category[] }>("/categories"),
          api.get<{ data: Instructor[] }>("/instructors")
        ]);
        setCategories(catRes.data.data);
        setInstructors(instRes.data.data);
      } catch (err) {
        console.error("Filter init error", err);
      } finally {
        setLoadingOpts(prev => ({ ...prev, cat: false, inst: false }));
      }
    };
    fetchBase();
  }, []);

  // 2. Fetch Topics (Cascaded logic)
  useEffect(() => {
    const fetchTopics = async () => {
      setLoadingOpts(prev => ({ ...prev, top: true }));
      try {
        // Construct query parameter if categories are selected
        const queryParams = new URLSearchParams();
        activeCategories.forEach((id) => queryParams.append("categories[]", String(id)));
        
        const qStr = queryParams.toString();
        const url = qStr ? `/topics?${qStr}` : "/topics";
        
        const { data } = await api.get<{ data: Topic[] }>(url);
        setTopics(data.data);
        
        // Auto-clean: if any activeTopics are no longer in the fetched subset, remove them
        const validIds = new Set(data.data.map(t => t.id));
        const invalidActive = activeTopics.filter(id => !validIds.has(id));
        
        if (invalidActive.length > 0) {
          const freshTopics = activeTopics.filter(id => validIds.has(id));
          setQueryParams({ "topics[]": freshTopics, page: 1 });
        }
        
      } catch (err) {
        console.error("Top fetch error", err);
      } finally {
        setLoadingOpts(prev => ({ ...prev, top: false }));
      }
    };
    
    // We fetch topics dynamically whenever activeCategories changes
    fetchTopics();
  }, [activeCategories]);

  // Handlers
  const handleCheckbox = (key: string, id: number, activeList: number[]) => {
    const isSelected = activeList.includes(id);
    let newList;
    if (isSelected) {
      newList = activeList.filter(item => item !== id);
    } else {
      newList = [...activeList, id];
    }
    
    // We always reset page to 1 on filter changes
    setQueryParams({ [key]: newList, page: 1 });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setQueryParams({ search: val, page: 1 });
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </h2>
        {activeFiltersCount > 0 && (
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </div>

      <div className="p-5 space-y-8">
        {/* Search */}
        <section>
           <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> Search</h3>
           <div className="relative">
             <input
               type="text"
               value={localSearch}
               onChange={handleSearchChange}
               placeholder="Find courses..."
               className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50/50"
             />
             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
           </div>
        </section>

        {/* Categories */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
          {loadingOpts.cat ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-5 bg-gray-100 animate-pulse rounded w-2/3" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                      checked={activeCategories.includes(cat.id)}
                      onChange={() => handleCheckbox("categories[]", cat.id, activeCategories)}
                    />
                  </div>
                  <span className={`text-sm select-none transition-colors ${activeCategories.includes(cat.id) ? 'text-indigo-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Topics */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Topics</h3>
          {loadingOpts.top ? (
            <div className="space-y-2">
               {[1, 2, 3].map(i => <div key={i} className="h-5 bg-gray-100 animate-pulse rounded w-3/4" />)}
            </div>
          ) : topics.length > 0 ? (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
              {topics.map((topic) => (
                <label key={topic.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    checked={activeTopics.includes(topic.id)}
                    onChange={() => handleCheckbox("topics[]", topic.id, activeTopics)}
                  />
                  <span className={`text-sm select-none transition-colors ${activeTopics.includes(topic.id) ? 'text-indigo-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {topic.name}
                  </span>
                </label>
              ))}
            </div>
          ) : (
             <p className="text-xs text-gray-400 italic">No topics available for selected categories.</p>
          )}
        </section>

        {/* Instructors */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Instructors</h3>
          {loadingOpts.inst ? (
            <div className="space-y-2">
               {[1, 2].map(i => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded my-1 w-full" />)}
            </div>
          ) : (
             <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                {instructors.map((inst) => (
                   <label key={inst.id} className="flex items-center gap-3 cursor-pointer group">
                     <input
                       type="checkbox"
                       className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-1 self-start cursor-pointer"
                       checked={activeInstructors.includes(inst.id)}
                       onChange={() => handleCheckbox("instructors[]", inst.id, activeInstructors)}
                     />
                     <div className="flex items-center gap-2">
                        {inst.avatar ? (
                          <img src={inst.avatar} alt={inst.name} className="h-6 w-6 rounded-full object-cover shrink-0 bg-gray-100" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {inst.name.charAt(0)}
                          </div>
                        )}
                        <span className={`text-sm select-none transition-colors ${activeInstructors.includes(inst.id) ? 'text-indigo-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{inst.name}</span>
                     </div>
                   </label>
                ))}
             </div>
          )}
        </section>
      </div>

      {/* Clear Filters Footer */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={clearAllFilters}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
             <X className="h-4 w-4" /> Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
