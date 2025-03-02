import { ForgotPasswordForm } from "@/layouts/ForgotPasswordForm";
import { useAuth } from "@/stores/auth/auth-context";
import { Navigate } from "react-router-dom";
import signinImage from "../images/siginI_image.jpg";

export default function ForgotPasswordPage() {
    const { isAuthenticated } = useAuth();

    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            P
                        </div>
                        <span>PentyFlix</span>
                    </a>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <ForgotPasswordForm />
                </div>
            </div>
            <div className="hidden lg:block">
                <img
                    src={signinImage}
                    alt="Authentication"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}