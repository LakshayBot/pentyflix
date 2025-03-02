import { useAuth } from "@/stores/auth/auth-context";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

// Mock media data (replace with actual API call later)
const mockMedia = [
    { id: 1, title: "The Amazing Show", type: "TV Series", imageUrl: "https://placehold.co/300x450" },
    { id: 2, title: "Epic Adventure", type: "Movie", imageUrl: "https://placehold.co/300x450" },
    { id: 3, title: "Funny Comedy", type: "Movie", imageUrl: "https://placehold.co/300x450" },
    { id: 4, title: "Mystery Drama", type: "TV Series", imageUrl: "https://placehold.co/300x450" },
    { id: 5, title: "Fantasy World", type: "TV Series", imageUrl: "https://placehold.co/300x450" },
    { id: 6, title: "Action Heroes", type: "Movie", imageUrl: "https://placehold.co/300x450" },
];

interface MediaItem {
    id: number;
    title: string;
    type: string;
    imageUrl: string;
}

const MediaCard = ({ media }: { media: MediaItem }) => {
    return (
        <div className="rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105">
            <img src={media.imageUrl} alt={media.title} className="w-full h-48 object-cover" />
            <div className="p-4 bg-white dark:bg-gray-700">
                <h3 className="font-semibold text-lg mb-1 truncate">{media.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{media.type}</p>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { user, logout, isAuthenticated } = useAuth();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
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
        
        // Filter media based on search query
        const filteredResults = mockMedia.filter(media => 
            media.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setMediaResults(filteredResults);
        
        // In a real application, you would make an API call here
        // Example:
        // const fetchMedia = async () => {
        //     try {
        //         const response = await api.get(`/media/search?q=${searchQuery}`);
        //         setMediaResults(response.data);
        //     } catch (error) {
        //         console.error('Error searching media:', error);
        //     }
        // };
        // fetchMedia();
        
    }, [searchQuery]);

    // Click outside to close user menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
                            You must be logged in to access the dashboard. Redirecting to login page...
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
        return 'U';
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header Navigation */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold">PentyFlix</h1>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                            {/* Search Input - Small version for the header */}
                            <div className="relative hidden md:block w-64">
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            
                            {/* User Menu */}
                            <div className="relative user-menu-container">
                                <button 
                                    className="flex items-center space-x-2 focus:outline-none"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                                        {getInitials()}
                                    </div>
                                    <span className="hidden md:inline-block">{user?.userName}</span>
                                    <svg 
                                        className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {/* Dropdown Menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                            <p className="font-medium text-sm">{user?.userName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                            {user?.firstName && user?.lastName && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <button 
                                                className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                onClick={() => {/* Add profile navigation here */}}
                                            >
                                                <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </button>
                                            <button 
                                                className="flex items-center rounded-md px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                onClick={() => {/* Add settings navigation here */}}
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
                </div>
            </header>

            <div className="container mx-auto py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col gap-6">
                        {/* Large Search Bar for Mobile */}
                        <div className="md:hidden mb-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search for movies, TV shows..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 py-6 text-lg"
                                />
                                <svg 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Dashboard Welcome Banner */}
                        {searchQuery.trim() === "" && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold">Welcome back, {user?.firstName || user?.userName}</h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">Discover new movies and TV shows or continue watching where you left off.</p>
                            </div>
                        )}

                        {/* Media Results */}
                        {mediaResults.length > 0 ? (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {mediaResults.map(media => (
                                        <MediaCard key={media.id} media={media} />
                                    ))}
                                </div>
                            </div>
                        ) : searchQuery.trim() !== "" ? (
                            <div className="text-center py-8">
                                <p className="text-lg text-gray-500">No results found for "{searchQuery}"</p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 mt-4">Trending Now</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {mockMedia.slice(0, 4).map(media => (
                                        <MediaCard key={media.id} media={media} />
                                    ))}
                                </div>
                                
                                <h2 className="text-xl font-semibold mb-4 mt-8">Popular TV Shows</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {mockMedia.filter(item => item.type === "TV Series").map(media => (
                                        <MediaCard key={media.id} media={media} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}