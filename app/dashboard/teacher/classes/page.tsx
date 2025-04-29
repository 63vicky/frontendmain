"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
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
import { School, Users, BookOpen, Plus, Search, Edit, Trash2, UserPlus, Loader2, FileText, Download, Upload } from "lucide-react"
import { z } from "zod"

interface Class {
  _id: string
  name: string
  section: string
  students: number
  subject: {
    _id: string
    name: string
    code: string
  }
  schedule: string
  status: 'Active' | 'Inactive'
}

interface Student {
  _id: string
  name: string
  email: string
  role: string
  status: string
  classes: string[]
  class?: string
  rollNo: string
  subjects: string[]
  attendance?: number
  performance?: string
  createdAt: string
  updatedAt: string
}

interface Subject {
  _id: string
  name: string
  code: string
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
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

interface ClassResponse {
  _id: string;
  name: string;
  section: string;
  subject: {
    _id: string;
    name: string;
  };
  schedule: string;
  status: 'Active' | 'Inactive';
}

interface StudentResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  classes: string[];
  class?: string;
  rollNo: string;
  subjects: string[];
  attendance?: number;
  performance?: string;
  createdAt: string;
  updatedAt: string;
}

const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(50, "Class name must be less than 50 characters"),
  section: z.string().min(1, "Section is required").max(10, "Section must be less than 10 characters"),
  subject: z.string().min(1, "Subject is required"),
  schedule: z.string().min(1, "Schedule is required"),
  status: z.enum(['Active', 'Inactive']).default('Active')
})

type ClassStatus = 'Active' | 'Inactive';

interface FormData {
  name: string;
  section: string;
  subject: string;
  schedule: string;
  status: 'Active' | 'Inactive';
}

interface FormErrors {
  name?: string;
  section?: string;
  subject?: string;
  schedule?: string;
}

export default function TeacherClassesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all")
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false)
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false)
  const [isAddNewStudentDialogOpen, setIsAddNewStudentDialogOpen] = useState(false)
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialSearchTerm, setMaterialSearchTerm] = useState("")
  const [selectedMaterialClassFilter, setSelectedMaterialClassFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    section: "",
    subject: "",
    schedule: "",
    status: "Active"
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [classesRes, studentsRes, subjectsRes, materialsRes] = await Promise.all([
        api.get<ApiResponse<Class[]>>('/classes'),
        api.get<ApiResponse<Student[]>>('/users/students'),
        api.get<ApiResponse<Subject[]>>('/subjects'),
        api.get<ApiResponse<Material[]>>('/materials')
      ])
      
      if (classesRes.data.data && Array.isArray(classesRes.data.data)) {
        setClasses(classesRes.data.data as Class[])
      }
      
      if (studentsRes.data && Array.isArray(studentsRes.data)) {
        setStudents(studentsRes.data as Student[])
      }

      if (subjectsRes.data.data && Array.isArray(subjectsRes.data.data)) {
        setSubjects(subjectsRes.data.data as Subject[])
      }

      if (materialsRes.data.data && Array.isArray(materialsRes.data.data)) {
        setMaterials(materialsRes.data.data as Material[])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Class name is required';
    }

    if (!formData.section.trim()) {
      errors.section = 'Section is required';
    }

    if (!formData.subject) {
      errors.subject = 'Subject is required';
    }

    if (!formData.schedule.trim()) {
      errors.schedule = 'Schedule is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      const endpoint = selectedClass ? `/classes/${selectedClass._id}` : '/classes';
      const method = selectedClass ? 'PUT' : 'POST';
      
      const response = method === 'POST' 
        ? await api.post<ApiResponse<ClassResponse>>(endpoint, formData)
        : await api.put<ApiResponse<ClassResponse>>(endpoint, formData);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: `Class ${selectedClass ? 'updated' : 'created'} successfully`,
        variant: "default"
      });

      fetchData();
      setIsAddClassDialogOpen(false);
      setIsEditClassDialogOpen(false);
      setSelectedClass(null);
      setFormData({
        name: "",
        section: "",
        subject: "",
        schedule: "",
        status: "Active"
      });
      setFormErrors({});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save class",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      setActionLoading(true)
      await api.delete(`/classes/${classId}`)
      toast({
        title: "Success",
        description: "Class deleted successfully",
        variant: "default"
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete class",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
      setIsDeleteDialogOpen(false)
      setClassToDelete(null)
    }
  }

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClass) return;

    const formData = new FormData(e.currentTarget);
    const studentIds = formData.getAll('students') as string[];

    if (studentIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.post<ApiResponse<{ modifiedCount: number }>>(
        `/classes/${selectedClass._id}/students`,
        { studentIds },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Update the class's student count
      const updatedClass = classes.find(c => c._id === selectedClass._id);
      if (updatedClass) {
        updatedClass.students += response.data.data.modifiedCount;
        setClasses([...classes]);
      }

      toast({
        title: "Success",
        description: `Added ${response.data.data.modifiedCount} students to class`,
        variant: "default"
      });
      setIsAddStudentDialogOpen(false);
      setSelectedStudents([]);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add students",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (classData: Class) => {
    setSelectedClass(classData);
    setFormData({
      name: classData.name,
      section: classData.section,
      subject: classData.subject._id,
      schedule: classData.schedule,
      status: classData.status
    });
    setIsEditClassDialogOpen(true);
  };

  const openDeleteDialog = (cls: Class) => {
    setClassToDelete(cls)
    setIsDeleteDialogOpen(true)
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? students.map(s => s._id) : []);
  };

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => 
      selectedClassFilter === "all" || student.class === selectedClassFilter
    );

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditStudentDialogOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const formData = new FormData(e.currentTarget);
    const studentData = {
      name: formData.get('name') as string,
      rollNo: formData.get('rollNo') as string,
      class: formData.get('class') as string,
      performance: formData.get('performance') as string,
      attendance: parseInt(formData.get('attendance') as string) || 0
    };

    try {
      setActionLoading(true);
      const response = await api.put<ApiResponse<StudentResponse>>(
        `/users/${selectedStudent._id}`,
        studentData
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Update class student counts if class changed
      if (selectedStudent.class !== studentData.class) {
        // Decrease count from old class
        if (selectedStudent.class) {
          const oldClass = classes.find(c => c._id === selectedStudent.class);
          if (oldClass) {
            oldClass.students = Math.max(0, oldClass.students - 1);
          }
        }
        // Increase count in new class
        if (studentData.class && studentData.class !== "No Class") {
          const newClass = classes.find(c => c._id === studentData.class);
          if (newClass) {
            newClass.students += 1;
          }
        }
        setClasses([...classes]);
      }

      toast({
        title: "Success",
        description: "Student updated successfully",
        variant: "default"
      });
      setIsEditStudentDialogOpen(false);
      setSelectedStudent(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setActionLoading(true);
      await api.delete(`/users/${studentId}`);
      toast({
        title: "Success",
        description: "Student deleted successfully",
        variant: "default"
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNewStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const studentData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      rollNo: formData.get('rollNo') as string,
      class: formData.get('class') as string,
      role: 'student',
      status: 'Active'
    };

    try {
      setActionLoading(true);
      const response = await api.post<ApiResponse<StudentResponse>>(
        '/users',
        studentData
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: "Student added successfully",
        variant: "default"
      });
      setIsAddNewStudentDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const classId = formData.get('class') as string;
    const file = formData.get('file') as File;
    
    if (!file || file.size === 0) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    const materialData = new FormData();
    materialData.append('title', title);
    materialData.append('description', description);
    materialData.append('class', classId);
    materialData.append('file', file);

    try {
      setActionLoading(true);
      const response = await api.post<ApiResponse<Material>>(
        '/materials',
        materialData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: "Material uploaded successfully",
        variant: "default"
      });
      setIsAddMaterialDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload material",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      setActionLoading(true);
      await api.delete(`/materials/${materialId}`);
      toast({
        title: "Success",
        description: "Material deleted successfully",
        variant: "default"
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete material",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMaterials = materials
    .filter(material => 
      material.title.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(materialSearchTerm.toLowerCase())
    )
    .filter(material => 
      selectedMaterialClassFilter === "all" || material.class === selectedMaterialClassFilter
    );

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Class Management</h1>
          <p className="text-muted-foreground">Manage your classes, schedules, and students</p>
        </div>

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
              <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" type="button">
                    <Plus className="h-4 w-4" />
                    <span>Add New Class</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>Create a new class with subject and schedule details.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Class Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Class 8A"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={formErrors.name ? "border-red-500" : ""}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500">{formErrors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Input
                          id="section"
                          placeholder="e.g., A"
                          value={formData.section}
                          onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                          className={formErrors.section ? "border-red-500" : ""}
                        />
                        {formErrors.section && (
                          <p className="text-sm text-red-500">{formErrors.section}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject._id} value={subject._id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.subject && (
                          <p className="text-sm text-red-500">{formErrors.subject}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule">Schedule</Label>
                        <Input
                          id="schedule"
                          placeholder="e.g., Mon, Wed, Fri 9:00 AM - 10:30 AM"
                          value={formData.schedule}
                          onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                          className={formErrors.schedule ? "border-red-500" : ""}
                        />
                        {formErrors.schedule && (
                          <p className="text-sm text-red-500">{formErrors.schedule}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: ClassStatus) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={actionLoading}>
                        {actionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Class"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => (
                <Card key={cls._id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center justify-between">
                      <span>{cls.name}</span>
                      <School className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>{cls.section}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Students:</span>
                        <span className="text-sm font-medium">{cls.students}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedClass(cls)
                          setIsAddStudentDialogOpen(true)
                        }}
                        disabled={actionLoading}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(cls)}
                        disabled={actionLoading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => openDeleteDialog(cls)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
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
                <Input 
                  type="search" 
                  placeholder="Search students..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  defaultValue="all"
                  value={selectedClassFilter}
                  onValueChange={(value) => {
                    setSelectedClassFilter(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => {
                    setSelectedClass(null);
                    setIsAddNewStudentDialogOpen(true);
                  }}
                  disabled={actionLoading}
                >
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
                      <TableHead>Class</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>
                          {classes.find(c => c._id === student.class)?.name || '-'}
                        </TableCell>
                        <TableCell>{student.attendance || 0}%</TableCell>
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
                            {student.performance || 'Not Available'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                handleEditStudent(student);
                              }}
                              disabled={actionLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                                  handleDeleteStudent(student._id);
                                }
                              }}
                              disabled={actionLoading}
                            >
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
                <Input 
                  type="search" 
                  placeholder="Search materials..." 
                  className="pl-8"
                  value={materialSearchTerm}
                  onChange={(e) => setMaterialSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  defaultValue="all"
                  value={selectedMaterialClassFilter}
                  onValueChange={(value) => {
                    setSelectedMaterialClassFilter(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setIsAddMaterialDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Material
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material._id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{material.title}</span>
                      <FileText className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>
                      {classes.find(c => c._id === material.class)?.name || 'No Class'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(material.fileSize)}</span>
                        <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(material.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${material.title}?`)) {
                            handleDeleteMaterial(material._id);
                          }
                        }}
                        disabled={actionLoading}
                      >
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

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedClass ? `Add Students to ${selectedClass.name}` : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              {selectedClass 
                ? 'Select students to add to this class.'
                : 'Enter student details to add them to the system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent}>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded"
                        checked={selectedStudents.length === students.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentSelect(student._id)}
                          name="students"
                          value={student._id}
                          disabled={student.class === selectedClass?._id}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                        {student.class === selectedClass?._id && (
                          <span className="ml-2 text-xs text-muted-foreground">(Already in class)</span>
                        )}
                      </TableCell>
                      <TableCell>{student.rollNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Selected Students"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Class Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-section">Section</Label>
                <Input
                  id="edit-section"
                  value={formData.section}
                  onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  className={formErrors.section ? "border-red-500" : ""}
                />
                {formErrors.section && (
                  <p className="text-sm text-red-500">{formErrors.section}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.subject && (
                  <p className="text-sm text-red-500">{formErrors.subject}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input
                  id="edit-schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                  className={formErrors.schedule ? "border-red-500" : ""}
                />
                {formErrors.schedule && (
                  <p className="text-sm text-red-500">{formErrors.schedule}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ClassStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {classToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setClassToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => classToDelete && handleDeleteClass(classToDelete._id)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Name</Label>
                <Input
                  id="student-name"
                  name="name"
                  defaultValue={selectedStudent?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-rollno">Roll No.</Label>
                <Input
                  id="student-rollno"
                  name="rollNo"
                  defaultValue={selectedStudent?.rollNo}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class">Class</Label>
                <Select
                  name="class"
                  defaultValue={selectedStudent?.class || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Class">No Class</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-attendance">Attendance (%)</Label>
                <Input
                  id="student-attendance"
                  name="attendance"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedStudent?.attendance || 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-performance">Performance</Label>
                <Select
                  name="performance"
                  defaultValue={selectedStudent?.performance || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Available">Not Available</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Student Dialog */}
      <Dialog open={isAddNewStudentDialogOpen} onOpenChange={setIsAddNewStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter student details to add them to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewStudent}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-student-name">Name</Label>
                <Input
                  id="new-student-name"
                  name="name"
                  placeholder="Student name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-student-email">Email</Label>
                <Input
                  id="new-student-email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-student-rollno">Roll No.</Label>
                <Input
                  id="new-student-rollno"
                  name="rollNo"
                  placeholder="Roll number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-student-class">Class</Label>
                <Select
                  name="class"
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Class">No Class</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog open={isAddMaterialDialogOpen} onOpenChange={setIsAddMaterialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Learning Material</DialogTitle>
            <DialogDescription>Upload a new learning material for your students.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMaterial}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="material-title">Title</Label>
                <Input
                  id="material-title"
                  name="title"
                  placeholder="Material title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-description">Description</Label>
                <Input
                  id="material-description"
                  name="description"
                  placeholder="Brief description of the material"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-class">Class</Label>
                <Select
                  name="class"
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Classes">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-file">File</Label>
                <Input
                  id="material-file"
                  name="file"
                  type="file"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Material"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
