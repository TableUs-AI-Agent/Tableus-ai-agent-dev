"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle, Loader2, Sparkles, Star, Upload } from "lucide-react";
import { useUser } from "../context/user-context";
import { api, apiFormData } from "../lib/api";

type FoodAnalysis = { dish: string; cuisine: string; description: string; flavor_tags?: string[] };

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Review could not be submitted. Please try again.";
}

export default function ReviewPage() {
  const { currentUser } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleFileSelect = async (file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const result = await apiFormData<FoodAnalysis>("/api/food/analyze", form);
      setAnalysis(result);
      if (!restaurantName && result.cuisine) {
        setRestaurantName("");
      }
    } catch {
      setAnalysis({ dish: "Could not analyze", cuisine: "Unknown", description: "Try another photo" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!currentUser || !reviewText.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await api<{ review: unknown; updated_taste_profile: string }>("/api/reviews/submit", {
        method: "POST",
        body: JSON.stringify({
          user_id: currentUser.id,
          restaurant_name: restaurantName || analysis?.dish || "Unknown",
          review_text: reviewText,
          rating,
          dish: analysis?.dish,
          cuisine: analysis?.cuisine,
        }),
      });
      setUpdatedProfile(result.updated_taste_profile);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setAnalysis(null);
    setRestaurantName("");
    setReviewText("");
    setRating(4);
    setSubmitted(false);
    setUpdatedProfile("");
    setSubmitError("");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Review</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Add a dish photo if you want, then leave a quick note about the meal.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 space-y-6"
            >
              <div className="glass rounded-2xl p-6 text-center">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-400" />
                <h2 className="mb-1 text-xl font-semibold">Review Submitted!</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Your preference summary has been refreshed.</p>
              </div>

              {updatedProfile && (
                <div className="glass rounded-2xl p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--accent-light)]" />
                    <h3 className="text-sm font-semibold">Updated Preference Summary</h3>
                  </div>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--accent-light)]">
                    {updatedProfile}
                  </div>
                </div>
              )}

              <button
                onClick={reset}
                className="w-full rounded-xl bg-[var(--accent)] py-3 font-medium text-white transition-colors hover:bg-[var(--accent)]/80"
              >
                Write Another Review
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="glass cursor-pointer overflow-hidden rounded-2xl transition-colors hover:border-[var(--accent)]/40"
              >
                {imagePreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Food" className="h-64 w-full object-cover" />
                    {analyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                          <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-[var(--accent-light)]" />
                          <p className="text-sm text-white">Analyzing image...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10">
                      <Camera className="h-7 w-7 text-[var(--accent)]/60" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Upload a dish photo</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Click or drag & drop</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <Upload className="h-3 w-3" />
                      <span>JPG, PNG, WebP</span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => event.target.files?.[0] && handleFileSelect(event.target.files[0])}
                />
              </div>

              <AnimatePresence>
                {analysis && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[var(--accent-light)]" />
                      <h3 className="text-sm font-semibold">AI Dish Snapshot</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Dish</p>
                        <p className="font-medium">{analysis.dish}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Cuisine</p>
                        <p className="font-medium">{analysis.cuisine}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">{analysis.description}</p>
                    {analysis.flavor_tags && analysis.flavor_tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {analysis.flavor_tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs text-[var(--accent-light)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="glass space-y-4 rounded-2xl p-5">
                <div>
                  <label className="mb-1 block text-xs text-[var(--muted-foreground)]">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(event) => setRestaurantName(event.target.value)}
                    placeholder={analysis ? `e.g. where you had ${analysis.dish}` : "Where did you eat?"}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[var(--muted-foreground)]">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder="Write like you're texting a friend..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[var(--muted-foreground)]">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} className="p-0.5" type="button">
                        <Star className={`h-7 w-7 transition-colors ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--muted)]"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !reviewText.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 font-medium text-white transition-colors hover:bg-[var(--accent)]/80 disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? "Refreshing summary..." : "Submit & Refresh Summary"}
                </button>

                {submitError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-300/70 bg-red-50/90 px-4 py-3 text-sm text-red-700"
                  >
                    {submitError}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
