import { useState, useEffect } from "react";
import { Star, Trash2, Plus, X, Search, MessageSquare, Package } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Review } from "@/data/products";

const ReviewsTab = () => {
  const { products, addReview, deleteReview, fetchReviews } = useData();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reviewsByProduct, setReviewsByProduct] = useState<Record<string, Review[]>>({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterProduct, setFilterProduct] = useState("");

  // Form state
  const [form, setForm] = useState({ productId: "", rating: 5, comment: "" });

  // Load reviews for all products that have reviewCount > 0
  useEffect(() => {
    const loadAllReviews = async () => {
      setLoadingReviews(true);
      const reviewMap: Record<string, Review[]> = {};
      const productsWithReviews = products.filter(p => (p.reviewCount || 0) > 0);
      await Promise.all(
        productsWithReviews.map(async (p) => {
          const id = p._id || p.id;
          const reviews = await fetchReviews(id);
          if (reviews.length > 0) reviewMap[id] = reviews;
        })
      );
      setReviewsByProduct(reviewMap);
      setLoadingReviews(false);
    };
    if (products.length > 0) loadAllReviews();
  }, [products]);

  // All reviews flat list
  const allReviews = Object.entries(reviewsByProduct).flatMap(([productId, reviews]) =>
    reviews.map(r => ({ ...r, _productId: productId }))
  );

  // Filter reviews
  const filteredReviews = allReviews.filter(r => {
    const product = products.find(p => (p._id || p.id) === r._productId);
    const productName = product?.name || "";
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase()) || productName.toLowerCase().includes(search.toLowerCase());
    const matchesProduct = !filterProduct || r._productId === filterProduct;
    return matchesSearch && matchesProduct;
  });

  const handleSubmit = async () => {
    if (!form.productId) { toast.error("Select a product"); return; }
    if (!form.comment.trim()) { toast.error("Enter a review comment"); return; }
    setSubmitting(true);
    try {
      await addReview({ productId: form.productId, rating: form.rating, comment: form.comment });
      const updated = await fetchReviews(form.productId);
      setReviewsByProduct(prev => ({ ...prev, [form.productId]: updated }));
      toast.success("Review added successfully!");
      setForm({ productId: "", rating: 5, comment: "" });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string, productId: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(reviewId);
      const updated = await fetchReviews(productId);
      setReviewsByProduct(prev => {
        const next = { ...prev };
        if (updated.length > 0) next[productId] = updated;
        else delete next[productId];
        return next;
      });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const productsWithReviewsList = products.filter(p => {
    const id = p._id || p.id;
    return reviewsByProduct[id]?.length > 0;
  });

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Reviews & Ratings</h3>
            <p className="text-[10px] sm:text-xs text-[#7a869a]">Manage product reviews — only admin can add reviews</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gradient-dark rounded-2xl h-8 sm:h-9 px-3 sm:px-5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-white shadow-lg w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />Add Review
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by reviewer, comment, or product..."
              className="pl-10 h-9 rounded-xl border-[#eaedf3] text-xs"
            />
          </div>
          <select
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            className="h-9 rounded-xl border border-[#eaedf3] px-3 text-xs bg-white text-[#1a1f36] font-medium"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total Reviews", value: allReviews.length, color: "text-primary" },
            { label: "Products Reviewed", value: Object.keys(reviewsByProduct).length, color: "text-blue-500" },
            { label: "Avg Rating", value: allReviews.length ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1) : "0", color: "text-amber-500" },
            { label: "5-Star Reviews", value: allReviews.filter(r => r.rating === 5).length, color: "text-green-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-[#eaedf3]">
              <p className="text-[10px] text-[#7a869a] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className={`text-lg sm:text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <Card className="border-none shadow-sm rounded-lg sm:rounded-3xl p-3 sm:p-6 bg-transparent">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[#1a1f36] flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-primary" /> All Reviews
            </h4>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{filteredReviews.length} Reviews</Badge>
          </div>

          {loadingReviews ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#7a869a]">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-[#eaedf3]">
              <MessageSquare className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
              <p className="text-sm font-bold text-[#1a1f36] mb-1">No reviews yet</p>
              <p className="text-xs text-[#7a869a]">Click "Add Review" to add a review for a product.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredReviews.map(review => {
                const product = products.find(p => (p._id || p.id) === review._productId);
                return (
                  <div key={review.id || review._id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#eaedf3] hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-primary">{review.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36]">{review.name}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-[#eaedf3]"}`} />
                              ))}
                            </div>
                            {review.createdAt && (
                              <span className="text-[10px] text-[#7a869a]">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#4f566b] mt-1 line-clamp-2">{review.comment}</p>
                          {product && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <Package className="w-3 h-3 text-[#a3acb9]" />
                              <span className="text-[10px] font-bold text-[#7a869a]">{product.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDelete(review.id || review._id!, review._productId)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#a3acb9] hover:text-destructive hover:bg-destructive/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Add Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#eaedf3]">
              <h3 className="text-sm font-bold text-[#1a1f36]">Add Review</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#a3acb9] hover:text-[#1a1f36]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Product Select */}
              <div>
                <label className="text-[11px] font-bold text-[#7a869a] uppercase tracking-wider mb-1.5 block">Product</label>
                <select
                  value={form.productId}
                  onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-[#eaedf3] px-3 text-sm bg-white text-[#1a1f36] font-medium"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.brand})</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-[11px] font-bold text-[#7a869a] uppercase tracking-wider mb-1.5 block">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, rating: s }))}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star className={`w-7 h-7 ${s <= form.rating ? "fill-amber-400 text-amber-400" : "text-[#eaedf3] hover:text-amber-200"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-[#1a1f36]">{form.rating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-[11px] font-bold text-[#7a869a] uppercase tracking-wider mb-1.5 block">Review Comment</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Write your review..."
                  rows={4}
                  className="w-full rounded-xl border border-[#eaedf3] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#eaedf3] flex gap-2">
              <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 rounded-xl h-10 font-bold text-xs">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 gradient-dark rounded-xl h-10 font-bold text-xs text-white shadow-lg">
                {submitting ? "Adding..." : "Add Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewsTab;
