import { Link, useLocation } from "react-router-dom";
import { Home, Smartphone, Laptop, Tag, User, Headphones } from "lucide-react";

const MobileNav = () => {
    const location = useLocation();

    const NAV_ITEMS = [
        { name: "Home", icon: Home, path: "/" },
        { name: "Laptops", icon: Laptop, path: "/laptops" },
        { name: "Phones", icon: Smartphone, path: "/phones" },
        { name: "Accessory", icon: Headphones, path: "/accessories" },
        { name: "Brands", icon: Tag, path: "/brands" },
    ];

    return (
        <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-primary/10 px-3 sm:px-6 py-3 pb-safe shadow-[0_-10px_40px_-15px_rgba(76,29,149,0.15)]">
            <div className="flex items-center justify-between">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center p-2 group transition-all"
                        >
                            <div className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${isActive ? "bg-primary text-white shadow-lg shadow-primary/30 -translate-y-2" : "text-muted-foreground hover:bg-secondary/80"}`}>
                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? "text-primary translate-y-0 opacity-100" : "text-transparent translate-y-2 opacity-0"} absolute -bottom-1`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
