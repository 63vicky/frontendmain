"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api, getSubjects, studentApi } from "@/lib/api"
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
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
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
  useEffect(() => {
    fetchData()
  }, []);

  // Add this useEffect to initialize selected students when dialog opens
  useEffect(() => {
    if (isAddStudentDialogOpen && selectedClass) {
      // Pre-select students who are already in this class
      const studentsInClass = students
        .filter(student => student.class === selectedClass._id)
        .map(student => student._id);

      setSelectedStudents(studentsInClass);
    }
  }, [isAddStudentDialogOpen, selectedClass, students]);
  const fetchData = async () => {
    try {
      setLoading(true)
      const [classesRes, subjectsRes, materialsRes] = await Promise.all([
        api.classes.getAll(),
        getSubjects(),
        api.materials.getAll(),
      ])

      // Handle classes
      if (classesRes && typeof classesRes === 'object' && 'data' in classesRes && Array.isArray(classesRes.data)) {
        const teacherClasses = classesRes.data as Class[]
        setClasses(teacherClasses)

        // Get all students for the add student dialog
        const studentsRes = await studentApi.getAllStudents()
        if (Array.isArray(studentsRes)) {
          setStudents(studentsRes as Student[])
        }
      }

      // Handle subjects
      if (subjectsRes && typeof subjectsRes === 'object' && 'data' in subjectsRes && Array.isArray(subjectsRes.data)) {
        setSubjects(subjectsRes.data as Subject[])
      }

      // Handle materials
      if (materialsRes && typeof materialsRes === 'object' && 'data' in materialsRes && Array.isArray(materialsRes.data)) {
        setMaterials(materialsRes.data as Material[])
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
      await api.classes.delete(classId)
      setSelectedClass(null);
      toast({
        title: "Success",
        description: "Class deleted successfully",
        variant: "default"
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : error || "Failed to delete class",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
      setIsDeleteDialogOpen(false)
      setClassToDelete(null)
    }
  }

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
    // Find the student
    const student = students.find(s => s._id === studentId);

    // If student is in another class, don't allow selection
    if (student?.class && student.class !== selectedClass?._id) {
      toast({
        title: "Cannot select student",
        description: "This student is already assigned to another class",
        variant: "destructive"
      });
      return;
    }

    // Toggle selection
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select students who are not in other classes
      const availableStudents = students.filter(s =>
        !s.class || s.class === selectedClass?._id
      ).map(s => s._id);
      setSelectedStudents(availableStudents);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClass) return;

    // Get selected student IDs from checkboxes
    const selectedIds = selectedStudents;

    // Get current students in the class
    const currentStudents = students.filter(s => s.class === selectedClass._id).map(s => s._id);

    // Students to add (selected but not in class and not in any other class)
    const studentsToAdd = selectedIds.filter(id => {
      const student = students.find(s => s._id === id);
      // Only add if student is not already in this class and either has no class or is in this class
      return !currentStudents.includes(id) && (!student?.class || student.class === selectedClass._id);
    });

    // Students to remove (in class but not selected)
    const studentsToRemove = currentStudents.filter(id => !selectedIds.includes(id));

    try {
      setActionLoading(true);

      // Add students if there are any to add
      if (studentsToAdd.length > 0) {
        // Use fetch directly to have more control over the request
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/classes/${selectedClass._id}/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({ studentIds: studentsToAdd })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add students');
        }
      }

      // Remove students if there are any to remove
      if (studentsToRemove.length > 0) {
        // Use fetch directly to have more control over the request
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/classes/${selectedClass._id}/remove-students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({ studentIds: studentsToRemove })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove students');
        }
      }

      toast({
        title: "Success",
        description: "Class roster updated successfully",
        variant: "default"
      });

      setIsAddStudentDialogOpen(false);
      setSelectedStudents([]);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update class roster",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // For the students tab, only show students who are in the teacher's classes
  const teacherClassIds = classes.map(cls => cls._id);
  const filteredStudents = students
    .filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student =>
      (selectedClassFilter === "all" || student.class === selectedClassFilter) &&
      // Only show students who are in one of the teacher's classes
      student.class && teacherClassIds.includes(student.class)
    );
const handleEditDialogClose = () => {
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
      await api.materials.delete(materialId);
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
      material.title?.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(materialSearchTerm.toLowerCase())
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
          <p className="text-muted-foreground">Manage your classes, schedules, and learning materials</p>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              <span>My Classes</span>
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
                        className="flex-1 hidden"
                        onClick={() => {
                          setSelectedClass(cls)
                          setIsAddStudentDialogOpen(true)
                        }}
                        disabled={actionLoading}
                      >
                        <School className="h-4 w-4 mr-1" />
                        Manage Class
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
              {selectedClass ? `Manage Students in ${selectedClass.name}` : 'Manage Students'}
            </DialogTitle>
            <DialogDescription>
              {selectedClass
                ? 'Select students to add to this class. Uncheck students to remove them from the class.'
                : 'Select students to add or remove from this class.'}
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
                        checked={selectedStudents.length > 0 &&
                          selectedStudents.length === students.filter(s =>
                            !s.class || s.class === selectedClass?._id
                          ).length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Current Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const isInClass = student.class === selectedClass?._id;
                    const isInOtherClass = student.class && student.class !== selectedClass?._id;
                    return (
                      <TableRow key={student._id} className={isInOtherClass ? "opacity-50" : ""}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentSelect(student._id)}
                            name="students"
                            value={student._id}
                            disabled={isInOtherClass ? true : false}
                            title={isInOtherClass ? "Student is already in another class" : undefined}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                          {isInClass && (
                            <span className="ml-2 text-xs text-muted-foreground">(Already in class)</span>
                          )}
                          {isInOtherClass && (
                            <span className="ml-2 text-xs text-red-500">(In another class)</span>
                          )}
                        </TableCell>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>
                          {isInOtherClass && (
                            <span className="text-xs text-muted-foreground">
                              {classes.find(c => c._id === student.class)?.name || 'Unknown Class'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="mt-4">
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

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassDialogOpen} onOpenChange={handleEditDialogClose}>
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






