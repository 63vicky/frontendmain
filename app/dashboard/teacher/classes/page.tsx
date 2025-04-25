"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { School, Users, BookOpen, Plus, Search, Edit, Trash2, UserPlus } from "lucide-react"

export default function TeacherClassesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const classes = [
    {
      id: 1,
      name: "Class 8A",
      subject: "Mathematics",
      students: 32,
      schedule: "Mon, Wed, Fri - 9:00 AM",
      room: "Room 101",
    },
    {
      id: 2,
      name: "Class 9B",
      subject: "Science",
      students: 28,
      schedule: "Tue, Thu - 10:30 AM",
      room: "Lab 3",
    },
    {
      id: 3,
      name: "Class 10C",
      subject: "English",
      students: 30,
      schedule: "Mon, Wed - 1:00 PM",
      room: "Room 205",
    },
    {
      id: 4,
      name: "Class 7D",
      subject: "History",
      students: 25,
      schedule: "Tue, Fri - 11:00 AM",
      room: "Room 108",
    },
  ]

  const students = [
    { id: 1, name: "Alex Johnson", rollNo: "S001", attendance: "92%", performance: "Excellent" },
    { id: 2, name: "Maria Garcia", rollNo: "S002", attendance: "88%", performance: "Good" },
    { id: 3, name: "James Wilson", rollNo: "S003", attendance: "95%", performance: "Excellent" },
    { id: 4, name: "Sarah Chen", rollNo: "S004", attendance: "90%", performance: "Good" },
    { id: 5, name: "David Kim", rollNo: "S005", attendance: "85%", performance: "Average" },
    { id: 6, name: "Emma Davis", rollNo: "S006", attendance: "93%", performance: "Excellent" },
    { id: 7, name: "Michael Brown", rollNo: "S007", attendance: "87%", performance: "Good" },
    { id: 8, name: "Sophia Martinez", rollNo: "S008", attendance: "91%", performance: "Good" },
  ]

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <p className="text-muted-foreground">Manage your classes, schedules, and students</p>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              <span>My Classes</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Learning Materials</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4 pt-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search classes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add New Class</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>Create a new class with subject and schedule details.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="class-name" className="text-right">
                        Class Name
                      </Label>
                      <Input id="class-name" placeholder="e.g., Class 8A" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject" className="text-right">
                        Subject
                      </Label>
                      <Input id="subject" placeholder="e.g., Mathematics" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule" className="text-right">
                        Schedule
                      </Label>
                      <Input id="schedule" placeholder="e.g., Mon, Wed, Fri - 9:00 AM" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="room" className="text-right">
                        Room
                      </Label>
                      <Input id="room" placeholder="e.g., Room 101" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Class</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white p-4">
                    <CardTitle className="flex justify-between items-center">
                      <span>{cls.name}</span>
                      <School className="h-5 w-5" />
                    </CardTitle>
                    <CardDescription className="text-indigo-100 dark:text-indigo-200">{cls.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Students:</span>
                        <span className="text-sm font-medium">{cls.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Schedule:</span>
                        <span className="text-sm font-medium">{cls.schedule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Room:</span>
                        <span className="text-sm font-medium">{cls.room}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedClass(cls.name)
                          setIsAddStudentDialogOpen(true)
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Students
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4 pt-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search students..." className="pl-8" />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="8a">Class 8A</SelectItem>
                    <SelectItem value="9b">Class 9B</SelectItem>
                    <SelectItem value="10c">Class 10C</SelectItem>
                    <SelectItem value="7d">Class 7D</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Student
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>{student.attendance}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.performance === "Excellent"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : student.performance === "Good"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {student.performance}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 pt-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search materials..." className="pl-8" />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="8a">Class 8A</SelectItem>
                    <SelectItem value="9b">Class 9B</SelectItem>
                    <SelectItem value="10c">Class 10C</SelectItem>
                    <SelectItem value="7d">Class 7D</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Upload Material
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: 1,
                  title: "Algebra Fundamentals",
                  type: "PDF",
                  class: "Class 8A",
                  uploadedOn: "Apr 15, 2025",
                  size: "2.4 MB",
                },
                {
                  id: 2,
                  title: "Chemical Reactions Video",
                  type: "Video",
                  class: "Class 9B",
                  uploadedOn: "Apr 12, 2025",
                  size: "45 MB",
                },
                {
                  id: 3,
                  title: "Grammar Exercises",
                  type: "PDF",
                  class: "Class 10C",
                  uploadedOn: "Apr 10, 2025",
                  size: "1.8 MB",
                },
                {
                  id: 4,
                  title: "World War II Presentation",
                  type: "PPT",
                  class: "Class 7D",
                  uploadedOn: "Apr 8, 2025",
                  size: "5.2 MB",
                },
                {
                  id: 5,
                  title: "Geometry Practice Problems",
                  type: "PDF",
                  class: "Class 8A",
                  uploadedOn: "Apr 5, 2025",
                  size: "1.5 MB",
                },
                {
                  id: 6,
                  title: "Periodic Table Interactive",
                  type: "HTML",
                  class: "Class 9B",
                  uploadedOn: "Apr 3, 2025",
                  size: "3.7 MB",
                },
              ].map((material) => (
                <Card key={material.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>
                      {material.class} • {material.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Uploaded:</span>
                        <span className="text-sm font-medium">{material.uploadedOn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Size:</span>
                        <span className="text-sm font-medium">{material.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Students to {selectedClass}</DialogTitle>
            <DialogDescription>Select students to add to this class.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 9, name: "Oliver Taylor", rollNo: "S009" },
                  { id: 10, name: "Ava Williams", rollNo: "S010" },
                  { id: 11, name: "Noah Jones", rollNo: "S011" },
                  { id: 12, name: "Isabella Brown", rollNo: "S012" },
                  { id: 13, name: "Liam Davis", rollNo: "S013" },
                  { id: 14, name: "Sophia Miller", rollNo: "S014" },
                ].map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <input type="checkbox" className="h-4 w-4 rounded" />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.rollNo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Selected Students</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
