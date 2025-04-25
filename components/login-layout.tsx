import type React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface LoginLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  role?: string
}

export default function LoginLayout({ children, title, description, role }: LoginLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="bg-white dark:bg-indigo-200 text-indigo-800 rounded-lg p-1 mr-2">TA</span>
            Tech Anubhavi
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-indigo-800 dark:text-indigo-400">{title}</h1>
              <p className="text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
      <footer className="bg-gradient-to-r from-indigo-800 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Tech Anubhavi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
