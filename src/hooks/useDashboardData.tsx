import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/services/api/api";
import { MediaItem } from "@/components/dashboard/MediaCard";

// Define the RedditChannel type
type RedditChannel = {
    id?: number; // Keep this for backward compatibility
    name: string;
    displayName: string;
    title: string;
    description?: string;
    url?: string;
    subscriberCount: number;
    isNsfw?: boolean;
    iconUrl?: string;
    bannerUrl?: string;
    createdUtc?: string;
    type?: string;
    imageUrl?: string;
};

export function useDashboardData() {
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

    const [searchQuery, setSearchQuery] = useState("");
    const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);

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
                    console.log(`Channels for keyword ${keyword}:`, response.data);
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

    // Format keyword for display (capitalize first letter)
    const formatKeywordForDisplay = (keyword: string) => {
        if (!keyword) return '';
        return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    };

    // Intersection Observer ref setup for infinite loading
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

    return {
        trendingChannels,
        loadingTrendingChannels,
        trendingChannelsError,
        keywords,
        keywordChannels,
        keywordsError,
        loadedKeywords,
        isLoadingBatch,
        searchQuery,
        setSearchQuery,
        mediaResults,
        formatKeywordForDisplay,
        loadTriggerRef
    };
}
