import { useState, useEffect } from "react";
import { Loader2, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api/api";

interface RedditMediaItem {
    title: string;
    author: string;
    permalink: string;
    url: string;
    thumbnail: string;
    score: number;
    created_utc: string;
    isVideo: boolean;
    mediaType: string;
}

interface SubredditMediaBrowserProps {
    subreddit: string;
    onClose: () => void;
}

type TimeFrame = "hour" | "day" | "week" | "month" | "year" | "all";

export function SubredditMediaBrowser({ subreddit, onClose }: SubredditMediaBrowserProps) {
    const [media, setMedia] = useState<RedditMediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(25);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
    const [currentView, setCurrentView] = useState<"grid" | "list">("grid");

    const fetchSubredditMedia = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use the api utility instead of fetch
            const response = await api.get(`/Reddit/media/${subreddit}?limit=${limit}&timeFrame=${timeFrame}`);

            if (Array.isArray(response.data)) {
                setMedia(response.data);
                toast.success("Media loaded", {
                    description: `Loaded ${response.data.length} items from r/${subreddit}`,
                });
            } else {
                console.error("API response format unexpected:", response.data);
                setMedia([]);
                toast.error("Invalid response format", {
                    description: "The server returned an unexpected response format"
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch media";
            setError(errorMessage);
            toast.error("Error loading media", {
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };


    // Fetch when subreddit, limit or timeFrame changes
    useEffect(() => {
        fetchSubredditMedia();
    }, [subreddit, limit, timeFrame]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(parseInt(dateString) * 1000).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return "Invalid date";
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        r/{subreddit}
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Tabs
                        defaultValue="grid"
                        value={currentView}
                        onValueChange={(value) => setCurrentView(value as "grid" | "list")}
                        className="h-8"
                    >
                        <TabsList className="h-8">
                            <TabsTrigger value="grid" className="h-8 px-3">Grid</TabsTrigger>
                            <TabsTrigger value="list" className="h-8 px-3">List</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <Select
                            value={timeFrame}
                            onValueChange={(value) => setTimeFrame(value as TimeFrame)}
                        >
                            <SelectTrigger className="w-[120px] h-8">
                                <SelectValue placeholder="Time period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hour">Last Hour</SelectItem>
                                <SelectItem value="day">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={String(limit)}
                            onValueChange={(value) => setLimit(Number(value))}
                        >
                            <SelectTrigger className="w-[90px] h-8">
                                <SelectValue placeholder="Limit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 posts</SelectItem>
                                <SelectItem value="25">25 posts</SelectItem>
                                <SelectItem value="50">50 posts</SelectItem>
                                <SelectItem value="100">100 posts</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchSubredditMedia}
                            disabled={loading}
                            className="h-8"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-1" />}
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
                    <p className="text-destructive">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        onClick={fetchSubredditMedia}
                    >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Try Again
                    </Button>
                </div>
            )}

            {loading ? (
                currentView === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-lg overflow-hidden bg-card border border-border">
                                <Skeleton className="h-48 w-full mb-2" />
                                <div className="p-4">
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-4 border-b pb-4">
                                <Skeleton className="h-24 w-24 flex-shrink-0 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-5xl mb-4">🤷‍♂️</div>
                    <p className="text-lg text-muted-foreground mb-2">No media found for r/{subreddit}</p>
                    <p className="text-sm text-muted-foreground mb-4">Try changing the time frame or checking another subreddit</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={fetchSubredditMedia}
                        >
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                        <Button
                            onClick={onClose}
                        >
                            Browse Other Channels
                        </Button>
                    </div>
                </div>
            ) : (
                <Tabs value={currentView} className="w-full">
                    <TabsContent value="grid" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {media.map((item, index) => (
                                <div key={index} className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="relative aspect-[4/3] bg-muted">
                                        {item.mediaType === "image" ? (
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Image+Not+Available";
                                                }}
                                                loading="lazy"
                                            />
                                        ) : item.isVideo ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black">
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary flex items-center justify-center flex-col">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                        <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
                                                    </svg>
                                                    <span className="mt-2">Play Video</span>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    View Content
                                                </a>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                                            {item.score} ⬆️
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="font-medium line-clamp-2 mb-2">{item.title}</h3>

                                        <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
                                            <div className="flex justify-between">
                                                <span className="truncate">u/{item.author}</span>
                                                <span>{formatDate(item.created_utc)}</span>
                                            </div>

                                            <a
                                                href={`https://reddit.com${item.permalink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline mt-2"
                                            >
                                                View on Reddit
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="list" className="mt-0">
                        <div className="space-y-4">
                            {media.map((item, index) => (
                                <div key={index} className="flex gap-4 border-b pb-4 hover:bg-accent/5 p-2 rounded-md">
                                    <div className="relative h-24 w-24 bg-muted flex-shrink-0 rounded-md overflow-hidden">
                                        {item.mediaType === "image" ? (
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=NA";
                                                }}
                                                loading="lazy"
                                            />
                                        ) : item.isVideo ? (
                                            <div className="flex items-center justify-center h-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                    <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-xs text-muted-foreground">Link</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-medium mb-1">{item.title}</h3>
                                        <div className="flex flex-wrap items-center text-xs text-muted-foreground mb-2">
                                            <span>{item.score} points</span>
                                            <span className="mx-2">•</span>
                                            <span>u/{item.author}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(item.created_utc)}</span>
                                        </div>
                                        <div>
                                            <a
                                                href={`https://reddit.com${item.permalink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline mr-4"
                                            >
                                                Reddit Thread
                                            </a>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Source Content
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}