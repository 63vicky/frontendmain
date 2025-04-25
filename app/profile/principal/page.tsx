import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Mail, Phone, MapPin, Calendar, Building2, Clock } from "lucide-react"

export default function PrincipalProfilePage() {
  // Mock principal data
  const principal = {
    id: "PRIN2023001",
    name: "Dr. Michael Anderson",
    email: "michael.anderson@example.com",
    phone: "+1 (555) 123-7890",
    address: "789 Admin Boulevard, Academic City, AC 12345",
    joinDate: "January 2015",
    qualification: "Ph.D. in Educational Leadership",
    experience: "15+ years in educational administration",
    avatar: "/placeholder.svg?height=128&width=128",
  }

  return (
    <DashboardLayout role="principal">
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
                <AvatarImage src={principal.avatar || "/placeholder.svg"} alt={principal.name} />
                <AvatarFallback>
                  {principal.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{principal.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">School Principal</p>
              <Badge variant="outline" className="mb-4">
                Admin ID: {principal.id}
              </Badge>

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{principal.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{principal.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{principal.address}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Joined: {principal.joinDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{principal.qualification}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{principal.experience}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">1,245</div>
                          <p className="text-xs text-muted-foreground">+3.2% from last year</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">78</div>
                          <p className="text-xs text-muted-foreground">+5 new this semester</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">12</div>
                          <p className="text-xs text-muted-foreground">Including 3 specialized labs</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="staff">
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Science Department</div>
                              <div className="text-sm text-muted-foreground">15 teachers, 3 lab assistants</div>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Mathematics Department</div>
                              <div className="text-sm text-muted-foreground">12 teachers</div>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Languages Department</div>
                              <div className="text-sm text-muted-foreground">18 teachers</div>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View All Departments
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">92.7%</div>
                            <p className="text-xs text-muted-foreground">+1.5% from previous year</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">95.3%</div>
                            <p className="text-xs text-muted-foreground">+0.8% from previous year</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Detailed Analytics
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
