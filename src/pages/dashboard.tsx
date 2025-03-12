import { useAuth } from "@/stores/auth/auth-context";
import { Navigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/services/api/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Film, TrendingUp, Users, Layers, Settings, LogOut } from "lucide-react";

interface MediaItem {
  id: number;
  title: string;
  type: string;
  imageUrl: string;
}

// Interface for Reddit channels
interface RedditChannel {
  name: string;
  displayName: string;
  title: string;
  description: string;
  url: string;
  subscriberCount: number;
  isNsfw: boolean;
  iconUrl: string;
  bannerUrl: string;
  createdUtc: string;
}

// Component for Reddit channel cards
const RedditChannelCard = ({ channel }: { channel: RedditChannel }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105">
      <div className="h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
        {channel.iconUrl ? (
          <img
            src={channel.iconUrl}
            alt={channel.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
            r/{channel.displayName}
          </div>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-gray-700">
        <h3 className="font-semibold text-lg mb-1 truncate">
          r/{channel.displayName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
          {channel.subscriberCount.toLocaleString()} subscribers
        </p>
        {channel.isNsfw && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            NSFW
          </span>
        )}
      </div>
    </div>
  );
};

const MediaCard = ({ media }: { media: MediaItem }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105">
      <img
        src={media.imageUrl}
        alt={media.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 bg-white dark:bg-gray-700">
        <h3 className="font-semibold text-lg mb-1 truncate">{media.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{media.type}</p>
      </div>
    </div>
  );
};

// Carousel component to handle scrolling
const Carousel = ({
  title,
  viewAllLink,
  children,
  loading = false,
  error = null,
}: {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}) => {
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
};

export default function Dashboard() {
  // State for trending Reddit channels
  const [trendingChannels, setTrendingChannels] = useState<RedditChannel[]>([]);
  const [loadingTrendingChannels, setLoadingTrendingChannels] = useState(false);
  const [trendingChannelsError, setTrendingChannelsError] = useState<
    string | null
  >(null);

  // Add a new state for keywords
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordChannels, setKeywordChannels] = useState<Record<string, {
    data: RedditChannel[],
    loading: boolean,
    error: string | null
  }>>({});
  const [keywordsError, setKeywordsError] = useState<string | null>(null);

  // New state to track which keywords have been loaded
  const [loadedKeywords, setLoadedKeywords] = useState<Set<string>>(new Set());
  const [batchSize] = useState(2); // Number of keywords to load in each batch
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch trending Reddit channels
  useEffect(() => {
    const fetchTrendingChannels = async () => {
      try {
        setLoadingTrendingChannels(true);
        setTrendingChannelsError(null);

        const response = await api.get("/reddit/Category/popular");
        if (Array.isArray(response.data)) {
          setTrendingChannels(response.data);
        } else {
          console.error("API response format unexpected:", response.data);
          setTrendingChannels([]);
        }
      } catch (error) {
        console.error("Error fetching trending Reddit channels:", error);
        setTrendingChannelsError("Failed to load trending Reddit channels");
        setTrendingChannels([]);
      } finally {
        setLoadingTrendingChannels(false);
      }
    };

    fetchTrendingChannels();
  }, []);

  // Fetch keywords from the API
  // Fetch keywords from the API
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        setIsLoadingBatch(true);
        setKeywordsError(null);

        const response = await api.get("/NsfwKeywords");
        console.log("Keywords response:", response.data);

        if (Array.isArray(response.data)) {
          setKeywords(response.data);
          // Initialize state for each keyword with loading indicators
          const initialChannels: Record<string, {
            data: RedditChannel[],
            loading: boolean,
            error: string | null
          }> = {};
          response.data.forEach((keyword) => {
            initialChannels[keyword] = {
              data: [],
              loading: true,
              error: null
            };
          });
          setKeywordChannels(initialChannels);
        } else {
          console.error("API keywords response format unexpected:", response.data);
          setKeywords([]);
        }
      } catch (error) {
        console.error("Error fetching keywords:", error);
        setKeywordsError("Failed to load content keywords");
        setKeywords([]);
      } finally {
        setIsLoadingBatch(false);
      }
    };

    fetchKeywords();
  }, []);
  // Fetch channels for each keyword using individual requests
  useEffect(() => {
    // Skip if no keywords or already loading
    if (keywords.length === 0 || isLoadingBatch) return;

    const loadNextBatch = async () => {
      // Find keywords that haven't been loaded yet
      const unloadedKeywords = keywords.filter(keyword => !loadedKeywords.has(keyword));

      if (unloadedKeywords.length === 0) {
        // All keywords have been loaded
        return;
      }

      // Take the next batch of keywords to load
      const nextBatch = unloadedKeywords.slice(0, batchSize);

      setIsLoadingBatch(true);

      // Process keywords sequentially to prevent too many simultaneous requests
      for (const keyword of nextBatch) {
        try {
          console.log(`Loading channels for keyword: ${keyword}`);

          // Update state to show loading for this specific keyword
          setKeywordChannels(prev => ({
            ...prev,
            [keyword]: {
              ...prev[keyword],
              loading: true,
              error: null
            }
          }));

          // Fetch data for this keyword
          const response = await api.get(`/reddit/Category/search?query=${keyword}&limit=25`);

          // Update state with results
          if (Array.isArray(response.data)) {
            setKeywordChannels(prev => ({
              ...prev,
              [keyword]: {
                data: response.data,
                loading: false,
                error: null
              }
            }));
          } else {
            console.error(`API response format unexpected for keyword ${keyword}:`, response.data);
            setKeywordChannels(prev => ({
              ...prev,
              [keyword]: {
                data: [],
                loading: false,
                error: "Invalid response format"
              }
            }));
          }

          // Mark this keyword as loaded
          setLoadedKeywords(prev => new Set(prev).add(keyword));

        } catch (error) {
          console.error(`Error fetching channels for keyword ${keyword}:`, error);
          setKeywordChannels(prev => ({
            ...prev,
            [keyword]: {
              data: [],
              loading: false,
              error: `Failed to load ${keyword} channels`
            }
          }));
        }

        // Add a small delay between requests to prevent overloading the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsLoadingBatch(false);
    };

    loadNextBatch();
  }, [keywords, loadedKeywords, isLoadingBatch, batchSize]);

  // Intersection Observer to detect when user has scrolled to near the bottom
  // to trigger loading the next batch of keywords
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadTriggerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      // When the trigger element becomes visible
      if (entries[0].isIntersecting && !isLoadingBatch) {
        // Load the next batch of keywords
        const unloadedKeywords = keywords.filter(keyword => !loadedKeywords.has(keyword));
        if (unloadedKeywords.length > 0) {
          setIsLoadingBatch(true);
        }
      }
    }, { threshold: 0.5 });

    observerRef.current.observe(node);
  }, [keywords, loadedKeywords, isLoadingBatch]);

  // Format keyword for display (capitalize first letter)
  const formatKeywordForDisplay = (keyword: string) => {
    if (!keyword) return '';
    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
  };

  useEffect(() => {
    // If not authenticated, show the alert briefly before redirecting
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      // Set a timeout to redirect after showing the message
      const timer = setTimeout(() => {
        setShowLoginAlert(false);
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setMediaResults([]);
      return;
    }

    const fetchMediaResults = async () => {
      try {
        const response = await api.get(`/media/search?query=${searchQuery}`);
        if (Array.isArray(response.data)) {
          setMediaResults(response.data);
        } else {
          console.error("API response format unexpected:", response.data);
          setMediaResults([]);
        }
      } catch (error) {
        console.error("Error fetching media results:", error);
        setMediaResults([]);
      }
    };

    fetchMediaResults();
  }, [searchQuery]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If user is not authenticated, show alert and then redirect
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        {showLoginAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be logged in to access the dashboard. Redirecting to
              login page...
            </AlertDescription>
          </Alert>
        )}
        <Navigate to="/login" />
      </div>
    );
  }

  // Generate user avatar initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.userName) {
      return user.userName.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar className="shrink-0">
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <span className="font-bold text-lg">PentyFlix</span>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={true}>
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Film className="h-5 w-5" />
                  <span>Browse Content</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-5 w-5" />
                  <span>Channels</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Layers className="h-5 w-5" />
                  <span>Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main content area - Fixed with proper full width */}
        <div className="flex flex-col flex-grow min-w-0 w-full">
          {/* Header - Full width with proper spacing */}
          <header className="sticky top-0 z-30 w-full bg-background border-b border-border shadow-sm">
            <div className="h-16 px-4 sm:px-6 flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <h1 className="text-xl font-bold md:hidden">PentyFlix</h1>
              </div>

              {/* Search and User Menu */}
              <div className="flex items-center space-x-4">
                {/* Search Input */}
                <div className="relative hidden md:block w-64 lg:w-80">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                  <svg
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* User Menu - Keep as is */}
                <div className="relative user-menu-container">
                  <button
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {getInitials()}
                    </div>
                    <span className="hidden md:inline-block">
                      {user?.userName}
                    </span>
                    <svg
                      className={`h-4 w-4 transition-transform ${showUserMenu ? "rotate-180" : ""
                        }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-40 border border-gray-200 dark:border-gray-700">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-sm">{user?.userName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                        {user?.firstName && user?.lastName && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {user.firstName} {user.lastName}
                          </p>
                        )}
                      </div>
                      <div className="p-2">
                        <button
                          className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => {
                            /* Add profile navigation here */
                          }}
                        >
                          <svg
                            className="h-4 w-4 mr-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Profile
                        </button>
                        <button
                          className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => {
                            /* Add settings navigation here */
                          }}
                        >
                          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </button>
                        <button
                          className="flex items-center rounded-md px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={logout}
                        >
                          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Content area - Properly scaled full width */}
          <main className="flex-1 w-full overflow-y-auto bg-background">
            <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 w-full">
              <div className="w-full space-y-6">
                {/* Mobile Search */}
                <div className="md:hidden mb-4 w-full">
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder="Search for movies, TV shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 py-6 text-lg w-full"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Dashboard Welcome Banner */}
                {searchQuery.trim() === "" && (
                  <div className="bg-card rounded-lg shadow p-6 w-full">
                    <h2 className="text-xl font-semibold">
                      Welcome back, {user?.firstName || user?.userName}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Discover new movies and popular Reddit channels.
                    </p>
                  </div>
                )}

                {/* Media Results */}
                {mediaResults.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {mediaResults.map((media) => (
                        <MediaCard key={media.id} media={media} />
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() !== "" ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-muted-foreground">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Trending Reddit Channels */}
                    <Carousel
                      title="Trending Now"
                      viewAllLink="/trending"
                      loading={loadingTrendingChannels}
                      error={trendingChannelsError}
                    >
                      {Array.isArray(trendingChannels) &&
                        trendingChannels.length > 0 &&
                        trendingChannels.slice(0, 10).map((channel) => (
                          <div key={channel.name} className="w-72 flex-shrink-0">
                            <RedditChannelCard channel={channel} />
                          </div>
                        ))}
                    </Carousel>

                    {/* Show keywords error if there is one */}
                    {keywordsError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600">{keywordsError}</p>
                      </div>
                    )}

                    {/* Dynamic Keyword Channels */}
                    {Array.from(loadedKeywords).map((keyword) => (
                      <Carousel
                        key={keyword}
                        title={`Popular ${formatKeywordForDisplay(keyword)} Channels`}
                        viewAllLink={`/channels/${keyword}`}
                        loading={keywordChannels[keyword]?.loading}
                        error={keywordChannels[keyword]?.error}
                      >
                        {Array.isArray(keywordChannels[keyword]?.data) && keywordChannels[keyword]?.data.length > 0 ? (
                          keywordChannels[keyword].data.map((channel) => (
                            <div key={channel.name} className="w-72 flex-shrink-0">
                              <RedditChannelCard channel={channel} />
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center w-full py-8">
                            <p className="text-muted-foreground">No channels found for {formatKeywordForDisplay(keyword)}</p>
                          </div>
                        )}
                      </Carousel>
                    ))}

                    {/* Loading Indicator for Next Batch */}
                    {loadedKeywords.size < keywords.length && (
                      <div ref={loadTriggerRef} className="flex items-center justify-center py-8">
                        <div className="relative w-10 h-10">
                          <div className="absolute top-0 left-0 w-full h-full border-3 border-primary rounded-full opacity-25"></div>
                          <div className="absolute top-0 left-0 w-full h-full border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="ml-4 text-muted-foreground">Loading more content...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
