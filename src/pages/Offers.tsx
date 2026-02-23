import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { offers } from "@/data/products";

const Offers = () => (
  <div className="container mx-auto px-4 py-6">
    <h1 className="text-3xl font-bold text-foreground mb-6">Special Offers</h1>
    <div className="grid md:grid-cols-2 gap-4">
      {offers.map((offer) => (
        <div key={offer.id} className={`rounded-lg p-6 shadow-card ${offer.active ? "gradient-purple-soft border-2 border-primary/20" : "bg-card opacity-60"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{offer.title}</h3>
              <p className="text-sm text-foreground/70">{offer.description}</p>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-primary mb-3">{offer.discount}% OFF</p>
          {offer.active && (
            <Link to="/shop" className="inline-block gradient-purple text-primary-foreground px-5 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              Shop Now
            </Link>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default Offers;
