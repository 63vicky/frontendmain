import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Mail, Phone, MapPin, Calendar, BookOpen, Users, Clock } from "lucide-react"

export default function TeacherProfilePage() {
  // Mock teacher data
  const teacher = {
    id: "TCH2023005",
    name: "Dr. Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Faculty Avenue, Academic City, AC 12345",
    joinDate: "August 2018",
    department: "Science",
    qualification: "Ph.D. in Physics",
    subjects: ["Physics", "Advanced Physics", "Science Lab"],
    classes: ["Grade 9A", "Grade 10B", "Grade 11A"],
    avatar: "/placeholder.svg?height=128&width=128",
  }

  return (
    <DashboardLayout role="teacher">
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
                <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                <AvatarFallback>
                  {teacher.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{teacher.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{teacher.department} Department</p>
              <Badge variant="outline" className="mb-4">
                Teacher ID: {teacher.id}
              </Badge>

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{teacher.address}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Joined: {teacher.joinDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{teacher.qualification}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="subjects">
                  <TabsList className="mb-4">
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                    <TabsTrigger value="exams">Recent Exams</TabsTrigger>
                  </TabsList>

                  <TabsContent value="subjects">
                    <div className="grid gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center p-3 rounded-md border">
                          <BookOpen className="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="classes">
                    <div className="grid gap-2">
                      {teacher.classes.map((className, index) => (
                        <div key={index} className="flex items-center p-3 rounded-md border">
                          <Users className="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <span>{className}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="exams">
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">Physics Mid-term</div>
                              <div className="text-sm text-muted-foreground">Grade 10B</div>
                            </div>
                            <Badge>Published</Badge>
                          </div>
                          <div className="flex items-center text-sm mt-2">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>May 15, 2025</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">Advanced Physics Quiz</div>
                              <div className="text-sm text-muted-foreground">Grade 11A</div>
                            </div>
                            <Badge variant="outline">Draft</Badge>
                          </div>
                          <div className="flex items-center text-sm mt-2">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Not scheduled</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">Science Lab Practical</div>
                              <div className="text-sm text-muted-foreground">Grade 9A</div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Graded
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm mt-2">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>April 28, 2025</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View All Exams
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
