"use client";

import { useEffect, useState, use } from "react";
import { Star, Clock, CheckCircle2, AlertTriangle, AlertCircle, MapPin, Users, ChevronDown } from "lucide-react";
import { api } from "@/services/api";
import { CourseDetail, WeeklySchedule, TimeSlot, SessionType } from "@/types";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const { pushModal } = useModal();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cascading Selection State
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null);

  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<number | null>(null);

  // Loading states for cascaded picks
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);

  // Enrollment State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [conflictError, setConflictError] = useState<any>(null);
  const [globalError, setGlobalError] = useState("");

  // Progress actions
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // Fetch Course details
  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<{ data: CourseDetail }>(`/courses/${id}`);
      setCourse(data.data);
      if (!data.data.enrollment) {
        fetchWeeklySchedules();
      }
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to fetch course details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, authLoading]);

  // CASCADING FETCHERS
  const fetchWeeklySchedules = async () => {
    try {
      const { data } = await api.get<{ data: WeeklySchedule[] }>(`/courses/${id}/weekly-schedules`);
      setSchedules(data.data);
    } catch (err) {
      console.error("Failed fetching schedules", err);
    }
  };

  const fetchTimeSlots = async (wsId: number) => {
    setFetchingSlots(true);
    setTimeSlots([]);
    setSelectedTimeSlotId(null);
    setSessionTypes([]);
    setSelectedSessionTypeId(null);
    try {
      const { data } = await api.get<{ data: TimeSlot[] }>(`/courses/${id}/time-slots?weekly_schedule_id=${wsId}`);
      setTimeSlots(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSlots(false);
    }
  };

  const fetchSessionTypes = async (wsId: number, tsId: number) => {
    setFetchingTypes(true);
    setSessionTypes([]);
    setSelectedSessionTypeId(null);
    try {
      const { data } = await api.get<{ data: SessionType[] }>(`/courses/${id}/session-types?weekly_schedule_id=${wsId}&time_slot_id=${tsId}`);
      setSessionTypes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTypes(false);
    }
  };

  // HANDLERS
  const handleScheduleSelect = (wsId: number) => {
    setSelectedScheduleId(wsId);
    fetchTimeSlots(wsId);
  };

  const handleTimeSlotSelect = (tsId: number) => {
    setSelectedTimeSlotId(tsId);
    if (selectedScheduleId) {
      fetchSessionTypes(selectedScheduleId, tsId);
    }
  };

  const handleSessionTypeSelect = (stId: number) => {
    setSelectedSessionTypeId(stId);
  };

  const handleEnrollClick = async (force: boolean = false) => {
    if (!user) {
      pushModal("login");
      return;
    }
    if (!user.profileComplete) {
      pushModal("profile");
      return;
    }

    const selectedSession = sessionTypes.find(s => s.id === selectedSessionTypeId);
    if (!selectedSession) return;

    setIsEnrolling(true);
    setGlobalError("");
    setConflictError(null);

    try {
      await api.post("/enrollments", {
        courseId: Number(id),
        courseScheduleId: selectedSession.courseScheduleId,
        force
      });
      fetchCourse();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflictError(err.response.data);
      } else if (err.response?.status === 422) {
        setGlobalError("Validation Failed / Missing Data.");
      } else {
        setGlobalError("Enrollment failed. Please try again.");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCompleteCourse = async () => {
    if (!course?.enrollment) return;
    setIsCompleting(true);
    try {
      await api.patch(`/enrollments/${course.enrollment.id}/complete`);
      fetchCourse();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDropCourse = async () => {
    if (!course?.enrollment) return;
    if (!window.confirm("Are you sure you want to drop this course? Your progress will be lost.")) {
      return;
    }
    setIsDropping(true);
    try {
      await api.delete(`/enrollments/${course.enrollment.id}`);
      fetchCourse();
    } catch (err) {
      console.error("Failed to drop course:", err);
    } finally {
      setIsDropping(false);
    }
  };

  const handleSubmitReview = async () => {
    if (selectedRating === 0) return;
    setSubmittingReview(true);
    try {
      await api.post(`/courses/${id}/reviews`, { rating: selectedRating });
      fetchCourse();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl animate-pulse" />
          <div className="lg:col-span-3 space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
      </div>
    );
  }

  const selectedSession = sessionTypes.find(s => s.id === selectedSessionTypeId);
  const finalPrice = selectedSession ? course.basePrice + selectedSession.priceModifier : course.basePrice;

  // Compute calculated rating client side
  const computedRating = course.reviews.length > 0
    ? course.reviews.reduce((acc, curr) => acc + curr.rating, 0) / course.reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-[1440px]">

      {/* Course Header — Side by side: Image left, Info right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">

        {/* Left: Course Image */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-sm">
            <img
              src={course.image || "https://placehold.co/800x600"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Course Info */}
        <div className="lg:col-span-3 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {course.category.name}
            </span>
            {course.topic && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                {course.topic.name}
              </span>
            )}
            {course.isFeatured && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            {course.title}
          </h1>

          <p className="text-gray-600 leading-relaxed mb-6 text-[15px] line-clamp-4">
            {course.description}
          </p>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              {course.instructor.avatar ? (
                <img src={course.instructor.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {course.instructor.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-700">{course.instructor.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{course.durationWeeks} Weeks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-700">
                {computedRating > 0 ? computedRating.toFixed(1) : "New"}
              </span>
              <span className="text-gray-400">({course.reviews.length})</span>
            </div>
          </div>

          <div className="text-3xl font-extrabold text-gray-900">
            ${course.basePrice}
            <span className="text-base font-normal text-gray-400 ml-2">base price</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left: Description + Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About this course</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </section>
        </div>

        {/* Right: Enrollment / Progress Pane */}
        <div className="lg:col-span-1 border border-gray-200 bg-white rounded-xl shadow-sm p-6 sticky top-24">

          {course.enrollment ? (
            // === ENROLLED STATE ===
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {course.enrollment.progress === 100 ? (
                  <><CheckCircle2 className="text-emerald-500" /> Course Completed</>
                ) : (
                  "Your Progress"
                )}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Completion</span>
                  <span className={course.enrollment.progress === 100 ? "text-emerald-600" : "text-indigo-600"}>
                    {course.enrollment.progress}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${course.enrollment.progress === 100 ? "bg-emerald-500" : "bg-indigo-600"}`}
                    style={{ width: `${course.enrollment.progress}%` }}
                  />
                </div>
              </div>

              {course.enrollment.progress < 100 ? (
                <div className="space-y-3">
                  <Button onClick={handleCompleteCourse} isLoading={isCompleting} fullWidth>
                    Complete Course
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDropCourse}
                    isLoading={isDropping}
                    disabled={isCompleting}
                    fullWidth
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  >
                    Drop Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  {course.isRated ? (
                    <p className="text-center text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      ✏️ You've already rated this course
                    </p>
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-sm font-medium text-gray-700">Rate your experience</p>
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                (hoveredRating || selectedRating) >= star
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        fullWidth
                        disabled={selectedRating === 0 || submittingReview}
                        isLoading={submittingReview}
                        onClick={handleSubmitReview}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 mt-6">
                <p className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Your Schedule</p>
                <p className="flex justify-between"><span className="text-gray-500">Days:</span> <span className="font-medium">{course.enrollment.schedule.weeklySchedule.label}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-medium text-right max-w-[150px]">{course.enrollment.schedule.timeSlot.label}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Format:</span> <span className="font-medium capitalize">{course.enrollment.schedule.sessionType.name.replace("_", " ")}</span></p>
                {course.enrollment.schedule.location && (
                  <p className="flex justify-between"><span className="text-gray-500">Location:</span> <span className="font-medium">{course.enrollment.schedule.location}</span></p>
                )}
              </div>
            </div>
          ) : (
            // === UNENROLLED STATE ===
            <div className="space-y-6">

              <div className="border-b border-gray-100 pb-5">
                <p className="text-gray-500 font-medium text-sm mb-1">Course Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">${finalPrice}</span>
                  {selectedSession?.priceModifier ? (
                    <span className="text-sm text-gray-400">(+${selectedSession.priceModifier} {selectedSession.name.replace('_', ' ')})</span>
                  ) : null}
                </div>
              </div>

              {/* CASCADING SELECTORS — Dropdown style */}
              <div className="space-y-5">

                {/* Step 1: Weekly Schedule */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">1. Select Days</label>
                  <select
                    value={selectedScheduleId ?? ""}
                    onChange={(e) => handleScheduleSelect(Number(e.target.value))}
                    className="w-full h-11 border border-gray-300 rounded-lg text-sm pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Choose weekly schedule...</option>
                    {schedules.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.label}</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Time Slots */}
                {selectedScheduleId && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-semibold text-gray-900">2. Select Time</label>
                    {fetchingSlots ? (
                      <div className="h-11 bg-gray-100 animate-pulse rounded-lg" />
                    ) : timeSlots.length > 0 ? (
                      <select
                        value={selectedTimeSlotId ?? ""}
                        onChange={(e) => handleTimeSlotSelect(Number(e.target.value))}
                        className="w-full h-11 border border-gray-300 rounded-lg text-sm pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="" disabled>Choose time slot...</option>
                        {timeSlots.map(ts => (
                          <option key={ts.id} value={ts.id}>{ts.label} ({ts.startTime} - {ts.endTime})</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No time slots available.</p>
                    )}
                  </div>
                )}

                {/* Step 3: Session Type */}
                {selectedTimeSlotId && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-semibold text-gray-900">3. Select Format</label>
                    {fetchingTypes ? (
                      <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                    ) : sessionTypes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {sessionTypes.map(st => {
                          const isSelected = selectedSessionTypeId === st.id;
                          const isFull = st.availableSeats === 0;

                          return (
                            <button
                              key={st.id}
                              disabled={isFull}
                              onClick={() => handleSessionTypeSelect(st.id)}
                              className={`p-3 text-left text-sm rounded-lg border transition-all ${
                                isFull ? "opacity-50 border-gray-200 bg-gray-50 cursor-not-allowed" :
                                isSelected ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" : "border-gray-200 hover:border-indigo-300 bg-white"
                              }`}
                            >
                              <div className="flex justify-between font-medium text-gray-900 mb-1 capitalize">
                                <span>{st.name.replace("_", " ")}</span>
                                <span>{st.priceModifier ? `+$${st.priceModifier}` : 'Included'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{st.location || 'Remote'}
                                </span>
                                <span className={`font-semibold flex items-center gap-1 ${isFull ? 'text-red-500' : st.availableSeats < 5 ? 'text-orange-500' : 'text-emerald-600'}`}>
                                  <Users className="w-3 h-3" />
                                  {isFull ? 'Fully Booked' : `${st.availableSeats} seats`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No formats available.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Errors */}
              {globalError && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{globalError}</p>
              )}

              {/* Conflict Error UI */}
              {conflictError && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-800 text-sm mb-1">{conflictError.message}</p>
                      <ul className="text-xs text-orange-700 list-disc pl-4 space-y-1 mb-3">
                        {conflictError.conflicts.map((c: any, i: number) => (
                          <li key={i}>Conflicts with <strong>{c.conflictingCourseName}</strong> ({c.schedule})</li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setConflictError(null)} className="h-8 text-xs bg-white text-gray-700">Cancel</Button>
                        <Button size="sm" onClick={() => handleEnrollClick(true)} isLoading={isEnrolling} className="h-8 text-xs bg-orange-600 hover:bg-orange-700">Continue Anyway</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!conflictError && (
                <Button
                  fullWidth
                  size="lg"
                  className="mt-4 font-bold shadow-md h-14 text-base"
                  disabled={!selectedSessionTypeId}
                  isLoading={isEnrolling}
                  onClick={() => handleEnrollClick(false)}
                >
                  Enroll Now
                </Button>
              )}
              {!selectedSessionTypeId && !conflictError && (
                <p className="text-center text-xs text-gray-400 mt-2 flex justify-center items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Complete schedule selection to enroll.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
