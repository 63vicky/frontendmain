"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function PasswordInput({ label, error, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={className}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-500" />
          ) : (
            <Eye className="h-4 w-4 text-slate-500" />
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
} 