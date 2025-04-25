"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthCheck } from "@/components/auth-check"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  BookOpen,
  PlusCircle,
  ArrowLeft,
  Bell,
  FileUp,
  BookOpenCheck,
  School,
  ClipboardList,
  UserCircle,
  LogOut,
  History,
} from "lucide-react"
import { authService } from "@/lib/services/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "principal" | "teacher" | "student" | "admin"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleGoBack = () => {
    router.back()
  }

  return (
    <AuthCheck requiredRole={role}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardContent 
            children={children} 
            role={role} 
            isMobileMenuOpen={isMobileMenuOpen} 
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            pathname={pathname}
            handleGoBack={handleGoBack}
          />
        </Suspense>
      </div>
    </AuthCheck>
  )
}

function DashboardContent({ 
  children, 
  role, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  pathname,
  handleGoBack
}: DashboardLayoutProps & { 
  isMobileMenuOpen: boolean; 
  setIsMobileMenuOpen: (value: boolean) => void;
  pathname: string;
  handleGoBack: () => void;
}) {
  const searchParams = useSearchParams()
  
  const getNavItems = (role: string) => {
    const baseItems = [
      {
        name: "Dashboard",
        href: `/dashboard/${role}?tab=overview`,
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        name: "Profile",
        href: `/profile/${role}`,
        icon: <UserCircle className="h-5 w-5" />,
      },
    ]

    if (role === "principal") {
      return [
        ...baseItems.slice(0, 1),
        {
          name: "Teachers Management",
          href: `/dashboard/${role}?tab=teachers`,
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Students Management",
          href: `/dashboard/${role}?tab=students`,
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          name: "Class Management",
          href: `/dashboard/${role}/classes`,
          icon: <School className="h-5 w-5" />,
        },
        {
          name: "Subject Management",
          href: `/dashboard/${role}/subjects`,
          icon: <BookOpenCheck className="h-5 w-5" />,
        },
        {
          name: "Exam Analytics",
          href: `/dashboard/${role}?tab=exams`,
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          name: "Results",
          href: `/dashboard/${role}/results`,
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          name: "Activity Logs",
          href: `/dashboard/${role}/logs`,
          icon: <History className="h-5 w-5" />,
        },
        {
          name: "Notifications",
          href: `/dashboard/${role}/notifications`,
          icon: <Bell className="h-5 w-5" />,
        },
        baseItems[1],
      ]
    } else if (role === "teacher") {
      return [
        ...baseItems.slice(0, 1),
        {
          name: "My Exams",
          href: `/dashboard/${role}?tab=exams`,
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Create Exam",
          href: `/dashboard/${role}?tab=create`,
          icon: <PlusCircle className="h-5 w-5" />,
        },
        {
          name: "Question Bank",
          href: `/dashboard/${role}/questions`,
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          name: "My Students",
          href: `/dashboard/${role}?tab=students`,
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          name: "Class Management",
          href: `/dashboard/${role}/classes`,
          icon: <School className="h-5 w-5" />,
        },
        {
          name: "Results",
          href: `/dashboard/${role}/results`,
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          name: "Bulk Upload",
          href: `/dashboard/${role}/bulk-upload`,
          icon: <FileUp className="h-5 w-5" />,
        },
        {
          name: "Notifications",
          href: `/dashboard/${role}/notifications`,
          icon: <Bell className="h-5 w-5" />,
        },
        baseItems[1],
      ]
    } else {
      return [
        ...baseItems.slice(0, 1),
        {
          name: "Available Exams",
          href: `/dashboard/${role}?tab=exams`,
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          name: "My Results",
          href: `/dashboard/${role}?tab=results`,
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Notifications",
          href: `/dashboard/${role}/notifications`,
          icon: <Bell className="h-5 w-5" />,
        },
        baseItems[1],
      ]
    }
  }

  const navItems = getNavItems(role)
  const isActive = (href: string) => {
    const [targetPath, targetQuery = ""] = href.split("?")
    const currentTab = searchParams.get("tab")
    const targetTab = new URLSearchParams(targetQuery).get("tab")

    const isSamePath = pathname === targetPath
    const isSameTab = currentTab === targetTab

    if (targetTab) {
      return isSamePath && isSameTab
    }

    return isSamePath
  }

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800 text-white py-4 shadow-md">
        <div className="mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <span className="bg-white dark:bg-indigo-200 text-indigo-800 rounded-lg p-1 mr-2">TA</span>
              Tech Anubhavi
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <nav className="hidden md:flex space-x-4">
              <Link href={`/dashboard/${role}`} className="hover:underline flex items-center">
                Dashboard
              </Link>
              <Button onClick={handleLogout} variant="outline" asChild>
                
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                {/* </Link> */}
              </Button>
            </nav>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden "
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 shadow-lg z-50">
          <div className="py-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  isActive(item.href)
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 dark:border-indigo-400"
                    : ""
                }`}
              >
                <span className="mr-3 text-indigo-600 dark:text-indigo-400">{item.icon}</span>
                <span className="font-medium dark:text-white">{item.name}</span>
              </Link>
            ))}
            <div className="border-t dark:border-slate-700 my-2"></div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="flex items-center px-4 py-3 text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <aside className="w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 hidden md:block shadow-sm">
          <div className="p-4">
            <div className="mb-6">
              <div className="text-xs uppercase text-indigo-500 dark:text-indigo-400 font-semibold tracking-wider mb-2">
                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 font-medium"
                      : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-900 dark:hover:text-indigo-100"
                  }`}
                >
                  <span className={`mr-3 ${isActive(item.href) ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <ChevronRight className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-900 max-w-[100vw] overflow-auto">{children}</main>
      </div>
    </div>
  )
}
