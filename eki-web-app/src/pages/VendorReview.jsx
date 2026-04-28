import { useState, useEffect, useCallback } from "react";
import Navbar3 from '../components/adminDashboard/Navbar4';
import VendorSidebar from '../components/VendorSidebar';
import Footer from "../components/Vendormanagement/VendorFooter";
import { VendorProvider } from '../context/vendorContext';
import { getVendorReviews, replyToReview } from '../services/authService';

// ─── Stars (gold) ─────────────────────────────────────────────────────────────
const Stars = ({ rating = 0, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5" fill={i < Math.round(rating) ? "#EFB034" : "#E5E7EB"} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#FEF6E4", text: "#B8860B" },
  { bg: "#FEF9E7", text: "#D4AC0D" },
  { bg: "#FDF2F8", text: "#8E44AD" },
  { bg: "#EBF5FB", text: "#1A6B9A" },
  { bg: "#EAFAF1", text: "#1E8449" },
  { bg: "#E8F3F3", text: "#235E5D" },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const Avatar = ({ name = "" }) => {
  const style = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {getInitials(name)}
    </div>
  );
};

// ─── Rating Bar (gold fill) ───────────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
      <span className="text-xs text-gray-500 w-12 text-right shrink-0">{star} Stars</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "#EFB034" }}
        />
      </div>
      <span className="text-[10px] text-gray-400 w-6 shrink-0">{count}</span>
    </div>
  );
};

// ─── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review, onSaveReply, onFlagReview }) => {
  const [showReply, setShowReply] = useState(false);
  const [editMode, setEditMode]   = useState(false);
  const [replyText, setReplyText] = useState(review.vendorReply || "");
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");

  // Keep local replyText in sync if the parent updates the review
  useEffect(() => {
    setReplyText(review.vendorReply || "");
  }, [review.vendorReply]);

  const handleSave = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSaveReply(review.id, replyText.trim());
      setShowReply(false);
      setEditMode(false);
    } catch (err) {
      setSaveError("Failed to save reply. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setReplyText(review.vendorReply || "");
    setShowReply(false);
    setEditMode(false);
    setSaveError("");
  };

  return (
    <div
      className="bg-white rounded-lg px-5 py-4"
      style={{ border: "1px solid #E5E7EB", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <Avatar name={review.reviewerName} />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">{review.reviewerName}</span>
              {review.verified && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full border"
                  style={{ backgroundColor: "#FEF6E4", color: "#B8860B", borderColor: "#EFB03433" }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block">{review.createdAt}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {review.productName && (
            <span className="text-[10px] font-medium" style={{ color: "#B8860B" }}>
              Item: {review.productName}
            </span>
          )}
          <Stars rating={review.rating} />
          {/* Numeric rating badge */}
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: "#FEF6E4", color: "#B8860B" }}
          >
            {review.rating.toFixed(1)} / 5
          </span>
        </div>
      </div>

      {/* Comment */}
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>

      {/* Vendor reply read mode */}
      {review.vendorReply && !editMode && (
        <div
          className="mt-3 px-4 py-3 rounded-r-lg"
          style={{ backgroundColor: "#FEF6E4", borderLeft: "4px solid #EFB034" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "#B8860B" }}>Your Response</p>
          <p className="text-xs text-gray-600 italic">"{review.vendorReply}"</p>
        </div>
      )}

      {/* Reply textarea */}
      {(showReply || editMode) && (
        <div className="mt-3">
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none"
            style={{ fontFamily: "Poppins, sans-serif" }}
            onFocus={(e) => (e.target.style.borderColor = "#EFB034")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
          {saveError && (
            <p className="text-[11px] text-red-500 mt-1">{saveError}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={saving || !replyText.trim()}
              className="text-xs text-white px-4 py-1.5 rounded-lg disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#EFB034" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="text-xs border border-gray-200 text-gray-500 px-4 py-1.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-4">
          {!review.vendorReply ? (
            <button
              onClick={() => setShowReply(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Reply
            </button>
          )}
          <button
            onClick={() => onFlagReview(review.id)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V5a2 2 0 012-2h9l5 5v13" />
            </svg>
            Flag
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-300 hover:text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button className="text-gray-300 hover:text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton loader card ─────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-lg px-5 py-4 animate-pulse" style={{ border: "1px solid #E5E7EB" }}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-2 bg-gray-100 rounded w-1/5" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
    <div className="mt-3 space-y-1.5">
      <div className="h-2.5 bg-gray-100 rounded w-full" />
      <div className="h-2.5 bg-gray-100 rounded w-5/6" />
      <div className="h-2.5 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

// ─── Inner Page Content ───────────────────────────────────────────────────────
const VendorReviewsContent = () => {
  const [reviews,       setReviews]       = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [initialLoad,   setInitialLoad]   = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [fetchError,    setFetchError]    = useState("");
  const [search,        setSearch]        = useState("");
  const [ratingFilter,  setRatingFilter]  = useState("All");
  const [sort,          setSort]          = useState("newest");

  // Map sort dropdown value → API ordering param
  const sortToOrdering = {
    newest:  "-created_at",
    oldest:  "created_at",
    highest: "-rating",
    lowest:  "rating",
  };

  // ── Fetch first page whenever filters change ──────────────────────────────
  const fetchReviews = useCallback(async () => {
    setInitialLoad(true);
    setFetchError("");
    try {
      const { reviews: list, total: count } = await getVendorReviews({
        page:     1,
        search,
        rating:   ratingFilter === "All" ? "" : ratingFilter,
        ordering: sortToOrdering[sort] ?? "-created_at",
      });
      setReviews(list);
      setTotal(count);
      setPage(1);
    } catch (err) {
      setFetchError("Could not load reviews. Please refresh the page.");
    } finally {
      setInitialLoad(false);
    }
  }, [search, ratingFilter, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const hasMore = reviews.length < total;

  // ── Save reply — calls API then updates local state ───────────────────────
  const handleSaveReply = async (reviewId, replyText) => {
    await replyToReview(reviewId, replyText);   // throws on error — ReviewCard catches it
    setReviews((prev) =>
      prev.map((r) => r.id === reviewId ? { ...r, vendorReply: replyText } : r)
    );
  };

  const handleFlagReview = (reviewId) => {
    // Placeholder — wire up to your flag endpoint if one exists
    console.log("Flag review:", reviewId);
  };

  // ── Load more (next page) ─────────────────────────────────────────────────
  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { reviews: more } = await getVendorReviews({
        page:     nextPage,
        search,
        rating:   ratingFilter === "All" ? "" : ratingFilter,
        ordering: sortToOrdering[sort] ?? "-created_at",
      });
      setReviews((prev) => [...prev, ...more]);
      setPage(nextPage);
    } catch (_) {
      // silently ignore load-more errors
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Outer shell matches OrderManagement exactly ───────────────────────────
  return (
    <div
      className="flex min-h-screen bg-[#ecece7] text-slate-800 p-3 gap-3"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <VendorSidebar activePage="reviews" />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Navbar — same position as OrderManagement */}
        <Navbar3 />

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">

          {/* Page Header */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Reviews &amp; Ratings</h1>
            <p className="text-slate-400 text-[11px] mt-0.5">Monitor and respond to customer feedback on your products.</p>
          </div>

          {/* Fetch error banner */}
          {fetchError && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {fetchError}
              <button
                onClick={fetchReviews}
                className="ml-auto text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Average rating card — gold theme */}
            <div
              className="rounded-xl p-6 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: "#FEF6E4", border: "1px solid #F5D68A" }}
            >
              <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#B8860B" }}>
                Average Rating
              </p>
              <p className="text-6xl font-bold leading-none" style={{ color: "#EFB034" }}>
                {avgRating}
              </p>
              <div className="mt-2">
                <Stars rating={parseFloat(avgRating)} />
              </div>
              <p className="text-xs mt-2" style={{ color: "#B8860B99" }}>
                Based on {total} total review{total !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating distribution */}
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Rating Distribution</p>
                <p className="text-xs text-gray-400">Visual breakdown of scores</p>
              </div>
              <div className="flex flex-col gap-3">
                {ratingDist.map((row) => (
                  <RatingBar key={row.star} star={row.star} count={row.count} total={total} />
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search reviews by content or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:border-transparent transition font-medium text-slate-700 placeholder-slate-400"
                style={{ fontFamily: "Poppins, sans-serif", "--tw-ring-color": "#EFB034" }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #EFB03440")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none"
                style={{ fontFamily: "Poppins, sans-serif" }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #EFB03440")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              >
                <option value="All">Rating: All</option>
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>{v} Star{v !== 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none"
              style={{ fontFamily: "Poppins, sans-serif" }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #EFB03440")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            >
              <option value="newest">↑ Newest First</option>
              <option value="oldest">↓ Oldest First</option>
              <option value="highest">★ Highest Rating</option>
              <option value="lowest">☆ Lowest Rating</option>
            </select>
          </div>

          {/* Reviews list */}
          {initialLoad ? (
            // Skeleton loaders while first fetch is in progress
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "#FEF6E4" }}>
                <svg className="w-6 h-6" fill="none" stroke="#EFB034" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-900">No reviews yet</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {search || ratingFilter !== "All"
                  ? "No reviews match your current filters."
                  : "Reviews will appear here once customers start rating your products."}
              </p>
              {(search || ratingFilter !== "All") && (
                <button
                  onClick={() => { setSearch(""); setRatingFilter("All"); }}
                  className="mt-3 text-xs font-semibold px-4 py-1.5 rounded-lg"
                  style={{ backgroundColor: "#FEF6E4", color: "#B8860B" }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onSaveReply={handleSaveReply}
                  onFlagReview={handleFlagReview}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {!initialLoad && reviews.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Showing {reviews.length} of {total} review{total !== 1 ? "s" : ""}
              </p>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-10 py-2.5 text-[11px] font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load More Reviews"}
                </button>
              )}
            </div>
          )}

        </main>

        {/* Footer — same position as OrderManagement */}
        <Footer />

      </div>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function VendorReviews() {
  return (
    <VendorProvider>
      <VendorReviewsContent />
    </VendorProvider>
  );
}