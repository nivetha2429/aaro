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
                            className="flex flex-col items-center justify-center gap-0.5 p-1 group transition-all"
                        >
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isActive ? "bg-primary text-white shadow-md shadow-primary/30" : "text-muted-foreground"}`}>
                                <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                            </div>
                            <span className={`text-[9px] font-bold transition-all duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
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
