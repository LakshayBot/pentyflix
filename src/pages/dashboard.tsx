import { useAuth } from "@/stores/auth/auth-context";
import { Navigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RedditChannelCard } from "@/components/dashboard/RedditChannelCard";
import { MediaCard } from "@/components/dashboard/MediaCard";
import { Carousel } from "@/components/dashboard/Carousel";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SubredditMediaBrowser } from "@/components/dashboard/SubredditMediaBrowser";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null);

  const {
    trendingChannels,
    loadingTrendingChannels,
    trendingChannelsError,
    keywords,
    keywordChannels,
    keywordsError,
    loadedKeywords,
    searchQuery,
    setSearchQuery,
    mediaResults,
    formatKeywordForDisplay,
    loadTriggerRef
  } = useDashboardData();

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

  // Handler for clicking on a channel
  const handleChannelClick = (channelName: string) => {
    setSelectedSubreddit(channelName);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <DashboardSidebar logout={logout} />

        {/* Main content area */}
        <div className="flex flex-col flex-grow min-w-0 w-full">
          {/* Header */}
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

                {/* User Menu Component */}
                <UserMenu user={user} logout={logout} />
              </div>
            </div>
          </header>

          {/* Content area */}
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

                {selectedSubreddit ? (
                  // When a subreddit is selected, show the media browser
                  <SubredditMediaBrowser
                    subreddit={selectedSubreddit}
                    onClose={() => setSelectedSubreddit(null)}
                  />
                ) : (
                  // Regular dashboard content
                  <>
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
                          {mediaResults.map((media) => {
                            // Ensure we're passing a valid MediaItem object with all required properties
                            console.log('Media item:', media);
                            return (
                              <MediaCard
                                key={media.id || media.name || Date.now()}
                                media={media}
                              />
                            );
                          })}
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
                              <div key={channel.name || Date.now()} className="w-72 flex-shrink-0">
                                <RedditChannelCard
                                  channel={channel}
                                  onClick={() => handleChannelClick(channel.displayName)}
                                />
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
                                <div key={channel.name || Date.now()} className="w-72 flex-shrink-0">
                                  <RedditChannelCard
                                    channel={channel}
                                    onClick={() => handleChannelClick(channel.displayName)}
                                  />
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
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}