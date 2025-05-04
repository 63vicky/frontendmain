"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getSubjects, createSubject, updateSubject, deleteSubject } from "@/lib/api"
import { teacherApi } from "@/lib/api"
import { classApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { PlusCircle, Search, Edit, Trash2, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Class {
  _id: string;
  name: string;
  section: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacher?: {
    _id: string;
    name: string;
  };
  classes: string[];
  status: 'Active' | 'Inactive';
}

export default function SubjectManagement() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    teacher: "",
    classes: [] as string[],
    status: "Active" as "Active" | "Inactive"
  })
  const [classSearchQuery, setClassSearchQuery] = useState("");

  useEffect(() => {
    fetchSubjects()
    fetchTeachers()
    fetchClasses()
  }, [])

  // Handle clicking outside of the classes dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('classesDropdown');
      const button = document.querySelector('[data-dropdown-toggle="classesDropdown"]');

      if (dropdown && !dropdown.contains(event.target as Node) &&
          button && !button.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects()
      setSubjects(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const data = await teacherApi.getAllTeachers()
      setTeachers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive"
      })
    }
  }

  const fetchClasses = async () => {
    try {
      const data = await classApi.getAllClasses()
      setClasses(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive"
      })
    }
  }

  // Filter subjects based on search query
  const filteredSubjects = Array.isArray(subjects) ? subjects.filter(
    (subject: Subject) =>
      subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject?.teacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject?.code?.toLowerCase().includes(searchQuery.toLowerCase()),
  ) : [];

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      teacher: subject.teacher?._id || "",
      classes: subject.classes,
      status: subject.status
    })
    setShowAddDialog(true)
  }

  const handleDelete = (subject: any) => {
    setSelectedSubject(subject)
    setShowDeleteDialog(true)
  }

  const handleSubmit = async () => {
    try {
      const subjectData = {
        ...formData,
        classes: formData.classes
      }

      if (selectedSubject) {
        await updateSubject(selectedSubject._id, subjectData)
        toast({
          title: "Success",
          description: "Subject updated successfully"
        })
      } else {
        await createSubject(subjectData)
        toast({
          title: "Success",
          description: "Subject created successfully"
        })
      }
      setShowAddDialog(false)
      fetchSubjects()
      setSelectedSubject(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subject",
        variant: "destructive"
      })
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteSubject(selectedSubject._id)
      toast({
        title: "Success",
        description: "Subject deleted successfully"
      })
      setShowDeleteDialog(false)
      fetchSubjects()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive"
      })
    }
  }

  const handleStatusToggle = async (subject: any) => {
    try {
      const newStatus = subject.status === "Active" ? "Inactive" : "Active";
      await updateSubject(subject._id, { ...subject, status: newStatus });
      toast({
        title: "Success",
        description: `Subject status updated to ${newStatus}`
      });
      fetchSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="principal">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Skeleton className="h-10 w-64" />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Subject Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Subject Management</h1>
            <p className="text-muted-foreground">Add, edit, or remove subjects from the system</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            onClick={() => {
              setSelectedSubject(null)
              setFormData({
                name: "",
                code: "",
                description: "",
                teacher: "",
                classes: [],
                status: "Active"
              })
              setShowAddDialog(true)
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Subject
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>All Subjects</CardTitle>
            <CardDescription>Manage all subjects in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Subject Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton rows
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No subjects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>
                        {subject.classes.map((cls: string) => (
                          <Badge key={cls} className="mr-1">
                            {cls}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>{subject.teacher?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={subject.status === "Active" ? "default" : "secondary"}
                          className={`${
                            subject.status === "Active" ? "bg-green-500" : "bg-red-500"
                          } cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => handleStatusToggle(subject)}
                        >
                          {subject.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)}>
                          <Edit className="h-4 w-4 text-indigo-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(subject)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Subject Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
            <DialogDescription>
              {selectedSubject ? "Edit subject details" : "Fill in the details to add a new subject"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="subjectName" className="text-right font-medium">
                Subject Name
              </label>
              <Input
                id="subjectName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="code" className="text-right font-medium">
                Subject Code
              </label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
                placeholder="e.g., MATH"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right font-medium">
                Description
              </label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Enter subject description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="teacher" className="text-right font-medium">
                Subject Teacher
              </label>
              <Select
                value={formData.teacher}
                onValueChange={(value) => setFormData({ ...formData, teacher: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="classes" className="text-right font-medium">
                Classes
              </label>
              <div className="col-span-3 space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.classes.length > 0 ? (
                    formData.classes.map((className, index) => (
                      <Badge key={index} className="px-3 py-1 flex items-center gap-1">
                        {className}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedClasses = [...formData.classes];
                            updatedClasses.splice(index, 1);
                            setFormData({ ...formData, classes: updatedClasses });
                          }}
                          className="ml-1 rounded-full hover:bg-red-500/20 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No classes selected</div>
                  )}
                </div>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                    data-dropdown-toggle="classesDropdown"
                    onClick={() => document.getElementById('classesDropdown')?.classList.toggle('hidden')}
                  >
                    <span>
                      {formData.classes.length > 0
                        ? `${formData.classes.length} class${formData.classes.length > 1 ? 'es' : ''} selected`
                        : 'Select classes'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </Button>
                  <div
                    id="classesDropdown"
                    className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg hidden max-h-60 overflow-auto"
                  >
                    <div className="p-2 space-y-2">
                      <div className="sticky top-0 bg-white pb-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search classes..."
                            value={classSearchQuery}
                            onChange={(e) => setClassSearchQuery(e.target.value)}
                            className="pl-8 w-full"
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (classes && classes.length > 0) {
                                const allClassNames = classes.map(cls => cls.name);
                                setFormData(prev => ({
                                  ...prev,
                                  classes: allClassNames
                                }));
                              }
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                classes: []
                              }));
                            }}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>

                      {classes && classes.length > 0 ? (
                        classes
                          .filter(cls =>
                            cls.name.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
                            cls.section.toLowerCase().includes(classSearchQuery.toLowerCase())
                          )
                          .map((cls) => (
                            <div key={cls._id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                              <input
                                type="checkbox"
                                id={`class-${cls._id}`}
                                checked={formData.classes.includes(cls.name)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    classes: isChecked
                                      ? [...prev.classes, cls.name]
                                      : prev.classes.filter(c => c !== cls.name)
                                  }));
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`class-${cls._id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                {cls.name} ({cls.section})
                              </label>
                            </div>
                          ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No classes available</div>
                      )}

                      {classes && classes.length > 0 &&
                        classes.filter(cls =>
                          cls.name.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
                          cls.section.toLowerCase().includes(classSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="p-2 text-sm text-gray-500">No matching classes found</div>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              onClick={handleSubmit}
            >
              {selectedSubject ? "Save Changes" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSubject?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
