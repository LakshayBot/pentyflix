import React from "react"
import { useState, useEffect } from "react"
import { EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-transparent border-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    {/* Removed the original pupil circle */}
  </svg>
)

const PasswordInput: React.FC = () => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const eye = document.getElementById('eye-container')
      if (!eye) return

      const rect = eye.getBoundingClientRect()
      const eyeCenterX = rect.left + rect.width / 2
      const eyeCenterY = rect.top + rect.height / 2

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX)
      const radius = 3

      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      setPupilPosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative w-full max-w-sm">
      <Input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="pr-10 border-0 focus-visible:ring-0" // Remove border and focus ring
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <div id="eye-container" className="relative h-4 w-4">
            <EyeIcon />
            <div 
              className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-foreground"
              style={{ 
                transform: `translate(calc(-50% + ${pupilPosition.x}px), calc(-50% + ${pupilPosition.y}px))`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>
        )}
      </button>
    </div>
  )
}

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-backgroundme">
      <PasswordInput />
    </div>
  )
}

export default App