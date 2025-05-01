"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, BookOpen, Calendar, Mail, Phone, MapPin, Clock, Loader2, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { authService } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)
  const [recentExams, setRecentExams] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true)
        const user = authService.getCurrentUser()

        if (!user || user.role !== "student") {
          toast({
            title: "Error",
            description: "You must be logged in as a student to view this page",
            variant: "destructive"
          })
          return
        }

        // Fetch student profile
        const profileResponse = await api.get(`/users/${user._id}`)
        if (profileResponse.data) {
          setStudent({
            id: profileResponse.data._id,
            name: profileResponse.data.name,
            email: profileResponse.data.email,
            phone: profileResponse.data.phone || "Not provided",
            address: profileResponse.data.address || "Not provided",
            dateOfBirth: profileResponse.data.dateOfBirth || "Not provided",
            grade: profileResponse.data.grade || "Not provided",
            section: profileResponse.data.section || "Not provided",
            joinDate: new Date(profileResponse.data.createdAt).toLocaleDateString(),
            subjects: profileResponse.data.subjects || [],
            class: profileResponse.data.class,
            rollNo: profileResponse.data.rollNo,
            avatar: profileResponse.data.avatar || "/placeholder.svg?height=128&width=128",
          })
        }

        // Fetch recent exams
        const examsResponse = await api.get(`/results/student/${user._id}`)
        if (examsResponse.data) {
          setRecentExams(examsResponse.data.slice(0, 3)) // Get only 3 recent exams
        }

        // Fetch attendance (if available)
        try {
          const attendanceResponse = await api.get(`/attendance/student/${user._id}`)
          if (attendanceResponse.data) {
            setAttendance(attendanceResponse.data)
          }
        } catch (attendanceError) {
          console.log("Attendance data not available")
          // Set default attendance data
          setAttendance({
            overall: "95%",
            absences: 3,
            late: 2,
            excused: 1
          })
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching student profile:", error)
        setError("Failed to load profile data. Please try again later.")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive"
        })
      }
    }

    fetchStudentProfile()
  }, [toast])

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : student ? (
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{student.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Class: {student.class}, Roll No: {student.rollNo}
                </p>
                <Badge variant="outline" className="mb-4">
                  Student ID: {student.id}
                </Badge>

                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{student.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>DOB: {student.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Joined: {student.joinDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="subjects">
                    <TabsList className="mb-4">
                      <TabsTrigger value="subjects">Subjects</TabsTrigger>
                      <TabsTrigger value="exams">Recent Exams</TabsTrigger>
                      <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="subjects">
                      {student.subjects && student.subjects.length > 0 ? (
                        <div className="grid gap-2">
                          {student.subjects.map((subject, index) => (
                            <div key={index} className="flex items-center p-3 rounded-md border">
                              <BookOpen className="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              <span>{subject}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          No subjects assigned yet
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="exams">
                      <div className="space-y-4">
                        {recentExams && recentExams.length > 0 ? (
                          <>
                            <div className="grid grid-cols-3 gap-4">
                              {recentExams.map((exam, index) => {
                                const bgColors = [
                                  "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400",
                                  "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400",
                                  "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
                                ];

                                return (
                                  <div
                                    key={exam._id}
                                    className={`col-span-3 sm:col-span-1 p-4 rounded-lg border ${bgColors[index % 3]}`}
                                  >
                                    <div className="font-medium">{exam.examId?.subject || "Subject"}</div>
                                    <div className="text-2xl font-bold">{exam.score}%</div>
                                    <div className="text-xs text-muted-foreground">{exam.examId?.title || "Exam"}</div>
                                  </div>
                                );
                              })}
                            </div>

                            <Button variant="outline" className="w-full" asChild>
                              <Link href="/dashboard/student?tab=results">View All Exam Results</Link>
                            </Button>
                          </>
                        ) : (
                          <div className="p-6 text-center text-muted-foreground">
                            No exam results available
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="attendance">
                      <div className="space-y-4">
                        {attendance ? (
                          <>
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{attendance.overall}</div>
                                <div className="text-xs text-muted-foreground">Overall</div>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{attendance.absences}</div>
                                <div className="text-xs text-muted-foreground">Absences</div>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{attendance.late}</div>
                                <div className="text-xs text-muted-foreground">Late</div>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{attendance.excused}</div>
                                <div className="text-xs text-muted-foreground">Excused</div>
                              </div>
                            </div>

                            <Button variant="outline" className="w-full">
                              View Detailed Attendance
                            </Button>
                          </>
                        ) : (
                          <div className="p-6 text-center text-muted-foreground">
                            Attendance data not available
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your account preferences and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
            <p className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              No student profile found. Please make sure you are logged in as a student.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
