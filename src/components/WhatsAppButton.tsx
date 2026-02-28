import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/products";

const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I'm interested in your products.`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-transform animate-bounce-gentle"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
  </a>
);

export default WhatsAppButton;
