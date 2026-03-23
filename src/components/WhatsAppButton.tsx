import { MessageCircle } from "lucide-react";
import { useData } from "@/context/DataContext";

const WhatsAppButton = () => {
  const { contactSettings } = useData();

  return (
    <a
      href={`https://wa.me/${contactSettings.whatsappNumber}?text=Hi! I'm interested in your products.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 right-4 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[hsl(142,70%,45%)] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all whatsapp-pulse click-scale"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
    </a>
  );
};

export default WhatsAppButton;
