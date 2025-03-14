import { MediaItem } from './MediaCard';

interface RedditChannelCardProps {
    channel: MediaItem;
    onClick: () => void;
}

export function RedditChannelCard({ channel, onClick }: RedditChannelCardProps) {
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
    const imageToShow = channel.bannerUrl || channel.imageUrl || fallbackImage;
    const iconToShow = channel.iconUrl || fallbackImage;

    return (
        <div
            className="rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105 cursor-pointer"
            onClick={onClick}
        >
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                {/* Main card image - using banner URL or fallback */}
                <img
                    src={imageToShow}
                    alt={channel.displayName || channel.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />

                {/* Subreddit icon overlay */}
                {channel.iconUrl && (
                    <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                        <img
                            src={iconToShow}
                            alt={`${channel.displayName || channel.name} icon`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = fallbackImage;
                            }}
                        />
                    </div>
                )}

                {/* NSFW badge if applicable */}
                {channel.isNsfw && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        NSFW
                    </div>
                )}
            </div>

            <div className="p-4 bg-card text-card-foreground">
                <h3 className="font-semibold text-lg mb-1 truncate">
                    {channel.displayName || channel.name || channel.title}
                </h3>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        {channel.type || "Subreddit"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatSubscribers(channel.subscriberCount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
