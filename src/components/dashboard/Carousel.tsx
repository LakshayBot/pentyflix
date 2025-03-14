import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
    title: string;
    viewAllLink?: string;
    children: React.ReactNode;
    loading?: boolean;
    error?: string | null;
}

export function Carousel({
    title,
    viewAllLink,
    children,
    loading = false,
    error = null,
}: CarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScrollPosition = () => {
        if (!scrollRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Show left arrow only if we've scrolled right
        setShowLeftArrow(scrollLeft > 0);
        // Show right arrow only if there's more content to scroll to
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener("scroll", checkScrollPosition);
            // Initial check
            checkScrollPosition();
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener("scroll", checkScrollPosition);
            }
        };
    }, [children]);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const scrollAmount = container.clientWidth * 0.75; // 75% of visible width

        const targetScroll =
            direction === "left"
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: targetScroll,
            behavior: "smooth",
        });
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                {viewAllLink && (
                    <button className="text-sm text-primary hover:underline">
                        View All
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="relative w-12 h-12">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full opacity-25"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : (
                <div className="relative group">
                    {/* Left Arrow Button */}
                    {showLeftArrow && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg opacity-90 hover:opacity-100"
                            onClick={() => scroll("left")}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Carousel Content */}
                    <div
                        ref={scrollRef}
                        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
                    >
                        <div className="flex space-x-4 transition-all">{children}</div>
                    </div>

                    {/* Right Arrow Button */}
                    {showRightArrow && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg opacity-90 hover:opacity-100"
                            onClick={() => scroll("right")}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
