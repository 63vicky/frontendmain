"use client"

import type React from "react"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, GraduationCap, Building2, EyeOff, Eye, Loader2 } from "lucide-react"
import { authService } from "@/lib/services/auth"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}

function LoginContent() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "student"

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: defaultRole,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  useEffect(() => {
    setFormData(prev => ({ ...prev, role: defaultRole }))
    router.push(`/login?role=${defaultRole}`)
  }, [defaultRole])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
    router.push(`/login?role=${value}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { token, user } = await authService.login(formData.email, formData.password, formData.role)

      // Verify that the selected role matches the user's actual role
      if (user.role !== formData.role) {
        throw new Error(`Please login as ${user.role}`)
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      })

      // Redirect based on role
      if (user.role === "principal") {
        router.push("/dashboard/principal")
      } else if (user.role === "teacher") {
        router.push("/dashboard/teacher")
      } else {
        router.push("/dashboard/student")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "An error occurred during login"
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "principal":
        return <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      case "teacher":
        return <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      case "student":
      default:
        return <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header-gradient py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="bg-white dark:bg-indigo-200 text-indigo-800 rounded-lg p-1 mr-2">TA</span>
            Tech Anubhavi
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-page">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-indigo-800 dark:text-indigo-400">Login to Tech Anubhavi</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your credentials to access the exam management system
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Login As</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="flex flex-col space-y-2 mt-2"
                >
                  {["student", "teacher", "principal"].map((role) => (
                    <div
                      key={role}
                      className={`flex items-center space-x-2 rounded-md border cursor-pointer ${formData.role === role
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400"
                          : "border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <Label
                        htmlFor={role}
                        className={`capitalize font-medium cursor-pointer flex items-center gap-2 flex-1  p-3 w-full ${formData.role === role
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        <RadioGroupItem value={role} id={role} className="text-indigo-600 dark:text-indigo-400 cursor-pointer" />
                        {getRoleIcon(role)}
                        {role}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full btn-gradient"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <footer className="header-gradient py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Tech Anubhavi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
