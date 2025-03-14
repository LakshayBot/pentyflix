// Update interface to match the API response structure
export interface MediaItem {
    id?: number; // Keep this for backward compatibility
    name: string;
    displayName: string;
    title: string;
    description?: string;
    url?: string;
    subscriberCount: number;
    isNsfw?: boolean;
    iconUrl?: string; // This will be used for subreddit avatar/icon
    bannerUrl?: string; // This can be used as the main image
    createdUtc?: string;
    // Keep legacy fields for backward compatibility
    type?: string;
    imageUrl?: string;
}

export function MediaCard({ media }: { media: MediaItem }) {
    // Function to format subscriber count with K/M suffix
    const formatSubscribers = (count?: number): string => {
        if (!count) return "0 subscribers";
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
        return `${count} subscribers`;
    };

    // Fallback image for when subreddit avatar is not available
    const fallbackImage = "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png";

    // Determine the best image URL to use (prioritize banner, fallback to icon, then to fallback image)
    const imageToShow = media.bannerUrl || media.imageUrl || fallbackImage;
    const iconToShow = media.iconUrl || fallbackImage;

    return (
        <div className="rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105">
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                {/* Main card image - using banner URL or fallback */}
                <img
                    src={imageToShow}
                    alt={media.displayName || media.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />

                {/* Subreddit icon overlay */}
                {media.iconUrl && (
                    <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                        <img
                            src={iconToShow}
                            alt={`${media.displayName || media.name} icon`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = fallbackImage;
                            }}
                        />
                    </div>
                )}

                {/* NSFW badge if applicable */}
                {media.isNsfw && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        NSFW
                    </div>
                )}
            </div>

            <div className="p-4 bg-card text-card-foreground">
                <h3 className="font-semibold text-lg mb-1 truncate">
                    {media.displayName || media.name || media.title}
                </h3>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        {media.type || "Subreddit"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatSubscribers(media.subscriberCount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
