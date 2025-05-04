"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { School, BookOpen, FileText, Download, Search, Calendar, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { authService } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Class {
  _id: string
  name: string
  section: string
  subject: {
    _id: string
    name: string
    code: string
  }
  schedule: string
  status: 'Active' | 'Inactive'
  teacher?: {
    _id: string
    name: string
  }
}

interface Material {
  _id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  class: string
  uploadedBy: {
    _id: string
    name: string
  }
  createdAt: string
}

interface Exam {
  _id: string
  title: string
  subject: string
  class: string
  chapter: string
  status: string
  startDate: string
  endDate: string
  duration: number
}

interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
  error?: string;
}

export default function StudentClasses() {
  const [activeTab, setActiveTab] = useState("classes")
  const [searchTerm, setSearchTerm] = useState("")
  const [materialSearchTerm, setMaterialSearchTerm] = useState("")
  const [classes, setClasses] = useState<Class[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  // No need for selectedClass state as students can only be in one class
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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

      // Get student's class
      const studentClass = user.class

      if (!studentClass || studentClass === "") {
        // If student doesn't have a class, just set loading to false and return
        // The UI will show "You are not enrolled in any class" message
        
        setLoading(false)
        return
      }

      try {
        // Fetch class details, materials, and exams
        const [classRes, materialsRes, examsRes] = await Promise.all([
          api.get<ApiResponse<Class>>(`/classes/${studentClass}`),
          api.get<ApiResponse<Material[]>>(`/materials/class/${studentClass}`),
          api.get<ApiResponse<Exam[]>>(`/exams/class/${studentClass}`)
        ])

        if (classRes.data.data) {
          setClasses([classRes.data.data])
        }

        if (materialsRes.data.data) {
          setMaterials(materialsRes.data.data)
        }

        if (examsRes.data.data) {
          setExams(examsRes.data.data)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load class data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    } catch (error) {
  toast({
    title: "Error",
    description: "An unexpected error occurred",
    variant: "destructive"
  })
} finally {
  setLoading(false)
}
  }

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(materialSearchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️'
    return '📁'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

 

if (loading) {
  return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )
}

return (
  <DashboardLayout role="student">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground">View your classes, materials, and upcoming exams</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes">My Class</TabsTrigger>
          <TabsTrigger value="materials">Class Materials</TabsTrigger>
          <TabsTrigger value="exams">Class Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4 pt-4">
          {classes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <School className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">You are not enrolled in any class</p>
                <p className="text-sm text-muted-foreground">Please contact your teacher or administrator to be assigned to a class</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-1">
              {classes.map((cls) => (
                <Card key={cls._id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center justify-between">
                      <span>{cls.name}</span>
                      <School className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>Section: {cls.section}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Subject</p>
                          <p className="font-medium flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-primary" />
                            {cls.subject?.name || "Not assigned"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                          <p className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            {cls.schedule || "Not scheduled"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                          <p className="font-medium">
                            {cls.teacher?.name || "Not assigned"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <Badge variant={cls.status === "Active" ? "default" : "secondary"}>
                            {cls.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/student/materials?class=${cls._id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Materials
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/student?tab=exams`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Exams
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={materialSearchTerm}
                onChange={(e) => setMaterialSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No materials found</p>
                <p className="text-sm text-muted-foreground">
                  {materialSearchTerm ? "Try a different search term" : "Your teacher hasn't uploaded any materials yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material._id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{material.title}</span>
                      <FileText className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>
                      Uploaded by: {material.uploadedBy?.name || "Unknown"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{getFileIcon(material.fileType)} {material.fileName}</span>
                        <span>{formatFileSize(material.fileSize)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded on: {formatDate(material.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-4">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exams" className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {exams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No exams found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try a different search term" : "No exams have been scheduled for your class yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exams
                .filter(exam =>
                  exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  exam.chapter.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((exam) => (
                  <Card key={exam._id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{exam.title}</span>
                        <BookOpen className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        {exam.subject} - {exam.chapter}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={
                            exam.status === "active" ? "default" :
                            exam.status === "scheduled" ? "outline" :
                            exam.status === "completed" ? "secondary" : "destructive"
                          }>
                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Start Date:</span>
                          <span className="text-sm">{formatDate(exam.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">End Date:</span>
                          <span className="text-sm">{formatDate(exam.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Duration:</span>
                          <span className="text-sm">{exam.duration} minutes</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4">
                      <Button
                        variant={exam.status === "active" ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        disabled={exam.status !== "active"}
                        asChild
                      >
                        <Link href={`/exam/${exam._id}`}>
                          {exam.status === "active" ? "Take Exam" : "View Details"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
)
}

