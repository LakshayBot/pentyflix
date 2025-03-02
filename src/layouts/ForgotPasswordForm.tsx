import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";

const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const validateEmail = () => {
        try {
            emailSchema.parse({ email });
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError(error.errors[0]?.message || "Invalid email");
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Ideally, this would connect to your API endpoint for password reset
            // For now, we'll simulate a successful request
            // await api.post('/Auth/forgot-password', { email });

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to request password reset. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success ? (
                <div className="space-y-4">
                    <Alert variant="default" className="border-green-500 bg-green-50">
                        <AlertDescription className="text-green-700">
                            Password reset link sent! Check your email for instructions.
                        </AlertDescription>
                    </Alert>
                    <Button
                        onClick={() => navigate('/login')}
                        className="w-full"
                    >
                        Return to login
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Sending reset link..." : "Send reset link"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate('/login')}
                        >
                            Back to login
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}