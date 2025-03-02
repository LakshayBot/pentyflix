import { useAuth } from "@/stores/auth/auth-context";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const { user, logout, isAuthenticated } = useAuth();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    
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

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 dark:bg-gray-800">
                <h1 className="text-2xl font-bold mb-4">Welcome to PentyFlix Dashboard</h1>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">User Information</h2>
                    <div className="space-y-1">
                        <p><span className="font-medium">Username:</span> {user?.userName}</p>
                        <p><span className="font-medium">Email:</span> {user?.email}</p>
                        {user?.firstName && <p><span className="font-medium">First Name:</span> {user?.firstName}</p>}
                        {user?.lastName && <p><span className="font-medium">Last Name:</span> {user?.lastName}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Content</h2>
                    <p>Your personalized content will appear here soon.</p>

                    <Button
                        onClick={logout}
                        variant="destructive"
                        className="w-full"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}