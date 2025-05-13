import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, User, CheckCircle, Clock, BarChart, Award, FileUp, Bell, Database } from "lucide-react"
// import { GraduationCap, Users, User, CheckCircle, Clock, BarChart, Award, FileUp, Bell, Database } from "lucide-react"
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-indigo-800 rounded-lg p-1 mr-2">TA</span>
            Tech Anubhavi
          </h1>
          <nav className="space-x-4">
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-800 to-indigo-600 bg-clip-text text-transparent">
            Welcome to Tech Anubhavi Exam Management System
          </h2>
          <p className="text-xl mb-8 text-slate-600">
            A comprehensive exam management solution for educational institutions with advanced analytics and reporting
          </p>
          {/* <div className="grid md:grid-cols-3 gap-8 mb-12"> */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-md border border-indigo-100 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-700">For Principals</h3>
              <p className="mb-4 text-slate-600">
                Manage teachers, students, classes, subjects, and access comprehensive analytics
              </p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Link href="/login?role=principal">Principal Login</Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-700">For Teachers</h3>
              <p className="mb-4 text-slate-600">
                Create exams, manage questions, upload bulk papers, and analyze student performance
              </p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Link href="/login?role=teacher">Teacher Login</Link>
              </Button>
            </div>
            

            {/* <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-green-700">For Students</h3>
              <p className="mb-4 text-slate-600">
                Take exams, view detailed results, and track progress across subjects
              </p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Link href="/login?role=student">Student Login</Link>
              </Button>
            </div> */}
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-lg shadow-md border border-slate-100">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Key Features</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <div className="flex items-start">
                <div className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-3">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Multiple Question Types</h4>
                  <p className="text-slate-600">Support for MCQs, fill-ups, and true/false questions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-100 text-purple-700 rounded-full p-2 mr-3">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Detailed Analytics</h4>
                  <p className="text-slate-600">Comprehensive class-wise and subject-wise performance reports</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 text-green-700 rounded-full p-2 mr-3">
                  <BarChart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Interactive Scorecards</h4>
                  <p className="text-slate-600">Detailed visual analytics for students and administrators</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-amber-100 text-amber-700 rounded-full p-2 mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Flexible Scheduling</h4>
                  <p className="text-slate-600">Set exams for specific dates with automatic timing</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-red-100 text-red-700 rounded-full p-2 mr-3">
                  <FileUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Bulk Upload & Export</h4>
                  <p className="text-slate-600">Import/export questions and download results in various formats</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Notifications</h4>
                  <p className="text-slate-600">Email and SMS notifications for exam schedules and results</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-teal-100 text-teal-700 rounded-full p-2 mr-3">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Class & Subject Management</h4>
                  <p className="text-slate-600">Comprehensive management of classes, subjects, and students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Tech Anubhavi. All rights reserved.</p>
          <p className="text-indigo-200 text-sm mt-1">Empowering Education Through Technology</p>
        </div>
      </footer>
    </div>
  )
}
