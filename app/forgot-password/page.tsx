"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import LoginLayout from "@/components/login-layout"
import { KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // In a real application, you would send a password reset email
    toast({
      title: "Reset Email Sent",
      description: "Check your inbox for password reset instructions",
    })

    setSubmitted(true)
  }

  return (
    <LoginLayout title="Reset Your Password" description="Enter your email to receive password reset instructions">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
          <KeyRound className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-slate-300 dark:border-slate-600"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-700 dark:to-indigo-800 dark:hover:from-indigo-600 dark:hover:to-indigo-700"
          >
            Send Reset Instructions
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-green-700 dark:text-green-400">
              Password reset instructions have been sent to your email address.
            </p>
          </div>
          <Button onClick={() => router.push("/login")} variant="outline" className="mt-4">
            Return to Login
          </Button>
        </div>
      )}

      <div className="text-center text-sm mt-6">
        <p className="text-slate-500 dark:text-slate-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </LoginLayout>
  )
}
