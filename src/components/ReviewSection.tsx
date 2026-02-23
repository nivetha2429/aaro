import { Star } from "lucide-react";
import { useData } from "@/context/DataContext";

const ReviewSection = ({ productId }: { productId?: string }) => {
  const { reviews } = useData();
  const filtered = productId ? reviews.filter((r) => r.productId === productId) : reviews;

  return (
    <div className="space-y-4">
      {filtered.map((review) => (
        <div key={review.id} className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {review.name[0]}
              </div>
              <span className="font-medium text-foreground text-sm">{review.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        </div>
      ))}
      {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No reviews yet.</p>}
    </div>
  );
};

export default ReviewSection;
