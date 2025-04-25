import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, BookOpen, Calendar, Mail, Phone, MapPin, Clock } from "lucide-react"

export default function StudentProfilePage() {
  // Mock student data
  const student = {
    id: "STU2023001",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Student Lane, Academic City, AC 12345",
    dateOfBirth: "April 15, 2005",
    grade: "10th Grade",
    section: "A",
    joinDate: "September 2020",
    subjects: ["Mathematics", "Science", "English", "History", "Computer Science"],
    avatar: "/placeholder.svg?height=128&width=128",
  }

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
                {student.grade}, Section {student.section}
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
                    <div className="grid gap-2">
                      {student.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center p-3 rounded-md border">
                          <BookOpen className="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="exams">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-3 sm:col-span-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                          <div className="text-green-600 dark:text-green-400 font-medium">Mathematics</div>
                          <div className="text-2xl font-bold">92%</div>
                          <div className="text-xs text-muted-foreground">Final Exam</div>
                        </div>
                        <div className="col-span-3 sm:col-span-1 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          <div className="text-blue-600 dark:text-blue-400 font-medium">Science</div>
                          <div className="text-2xl font-bold">88%</div>
                          <div className="text-xs text-muted-foreground">Mid-term</div>
                        </div>
                        <div className="col-span-3 sm:col-span-1 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <div className="text-amber-600 dark:text-amber-400 font-medium">History</div>
                          <div className="text-2xl font-bold">78%</div>
                          <div className="text-xs text-muted-foreground">Quiz</div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View All Exam Results
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance">
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg border">
                          <div className="text-2xl font-bold">95%</div>
                          <div className="text-xs text-muted-foreground">Overall</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                          <div className="text-2xl font-bold">3</div>
                          <div className="text-xs text-muted-foreground">Absences</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                          <div className="text-2xl font-bold">2</div>
                          <div className="text-xs text-muted-foreground">Late</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                          <div className="text-2xl font-bold">1</div>
                          <div className="text-xs text-muted-foreground">Excused</div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Detailed Attendance
                      </Button>
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
      </div>
    </DashboardLayout>
  )
}
