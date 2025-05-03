"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PasswordInput } from "@/components/ui/password-input"
import { teacherApi, studentApi, classApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface UserManagementProps {
  userType: "teacher" | "student"
  teacherView?: boolean
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subject: string;
  classes: string[];
  status: 'active' | 'inactive';
}

interface Student {
  _id: string;
  name: string;
  email: string;
  class: string;
  rollNo: string;
  status: 'active' | 'inactive';
}

interface Class {
  _id: string;
  name: string;
  code: string;
}

export default function UserManagement({ userType, teacherView = false }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [addingUser, setAddingUser] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    classes: [] as string[],
    class: '',
    rollNo: ''
  })
  const [editData, setEditData] = useState<Teacher | Student | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userType === 'teacher') {
      loadTeachers()
    } else {
      loadStudents()
    }
    loadClasses()
  }, [userType])

  const loadClasses = async () => {
    try {
      setLoadingClasses(true)
      const response = await classApi.getAllClasses()
      setClasses(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      })
    } finally {
      setLoadingClasses(false)
    }
  }

  const loadTeachers = async () => {
    try {
      setLoading(true)
      const data = await teacherApi.getAllTeachers()
      setTeachers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await studentApi.getAllStudents()
      setStudents(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingUser(true)
    try {
      if (userType === 'teacher') {
        await teacherApi.createTeacher({
          ...formData,
          classes: formData.classes
        })
      } else {
        // Create the student with or without a class
        const response = await studentApi.createStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          class: "", // Empty string instead of null to match expected type
          rollNo: formData.rollNo
        })

        // If student should be assigned to a class, update the class student count
        if (formData.class) {
          try {
            // Get the student ID from the response
            const studentId = response.data?._id || response._id

            if (studentId) {
              // First update the student with the class
              await studentApi.updateStudent(studentId, {
                class: formData.class
              });

              // Then update the class student count
              const addResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/classes/${formData.class}/students`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: JSON.stringify({ studentIds: [studentId] })
              });

              if (!addResponse.ok) {
                const errorData = await addResponse.json();
                console.error("Error adding student to class:", errorData);
              }
            }
          } catch (error) {
            console.error("Error updating class student count:", error);
          }
        }
      }

      toast({
        title: "Success",
        description: `${userType === 'teacher' ? 'Teacher' : 'Student'} added successfully`
      })
      setShowAddDialog(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        subject: '',
        classes: [],
        class: '',
        rollNo: ''
      })
      if (userType === 'teacher') {
        loadTeachers()
      } else {
        loadStudents()
      }
      // Reload classes to update student counts
      loadClasses()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${userType}`,
        variant: "destructive"
      })
    } finally {
      setAddingUser(false)
    }
  }

  const handleEdit = (user: Teacher | Student) => {
    setEditData(user)
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editData) return

    setUpdatingUser(true)
    try {
      if (userType === 'teacher') {
        const teacher = editData as Teacher
        await teacherApi.updateTeacher(teacher._id, {
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject,
          classes: teacher.classes,
          status: teacher.status
        })
      } else {
        const student = editData as Student

        // Get the original student data to check if class has changed
        const originalStudent = students.find(s => s._id === student._id)
        const previousClassId = originalStudent?.class
        const newClassId = student.class

        // Check if class has changed
        const classChanged = previousClassId !== newClassId

        // If class has changed, handle class updates first
        if (classChanged) {
          // If student was in a class before, remove them from that class first
          if (previousClassId) {
            try {
              // First, set the student's class to empty string in the database
              await studentApi.updateStudent(student._id, {
                class: ""
              });

              // Then, update the previous class's student count
              const removeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/classes/${previousClassId}/remove-students`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: JSON.stringify({ studentIds: [student._id] })
              });

              if (!removeResponse.ok) {
                const errorData = await removeResponse.json();
                console.error("Error removing student from previous class:", errorData);
              }
            } catch (error) {
              console.error("Error removing student from previous class:", error);
            }
          }
        }

        // Now update the student with all the new data
        await studentApi.updateStudent(student._id, {
          name: student.name,
          email: student.email,
          class: newClassId,
          rollNo: student.rollNo,
          status: student.status
        });

        // If class has changed and there's a new class, add the student to it
        if (classChanged && newClassId) {
          try {
            const addResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/classes/${newClassId}/students`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              credentials: 'include',
              body: JSON.stringify({ studentIds: [student._id] })
            });

            if (!addResponse.ok) {
              const errorData = await addResponse.json();
              console.error("Error adding student to new class:", errorData);
            }
          } catch (error) {
            console.error("Error adding student to new class:", error);
          }
        }
      }

      toast({
        title: "Success",
        description: `${userType === 'teacher' ? 'Teacher' : 'Student'} updated successfully`
      })
      setShowEditDialog(false)
      setEditData(null)
      if (userType === 'teacher') {
        loadTeachers()
      } else {
        loadStudents()
      }
      // Reload classes to update student counts
      loadClasses()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${userType}`,
        variant: "destructive"
      })
    } finally {
      setUpdatingUser(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${userType}?`)) return

    setDeletingUser(true)
    try {
      if (userType === 'teacher') {
        await teacherApi.deleteTeacher(id)
      } else {
        // Find the student to get their class before deletion
        const student = students.find(s => s._id === id)
        const classId = student?.class

        // If student is in a class, first remove them from the class
        if (classId) {
          try {
            // First, set the student's class to empty string in the database
            await studentApi.updateStudent(id, {
              class: ""
            });

            // Then, update the class's student count
            const removeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/classes/${classId}/remove-students`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              credentials: 'include',
              body: JSON.stringify({ studentIds: [id] })
            });

            if (!removeResponse.ok) {
              const errorData = await removeResponse.json();
              console.error("Error removing student from class:", errorData);
            }
          } catch (error) {
            console.error("Error updating class student count:", error);
          }
        }

        // Now delete the student
        await studentApi.deleteStudent(id)
      }

      toast({
        title: "Success",
        description: `${userType === 'teacher' ? 'Teacher' : 'Student'} deleted successfully`
      })
      if (userType === 'teacher') {
        loadTeachers()
      } else {
        loadStudents()
      }
      // Reload classes to update student counts
      loadClasses()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${userType}`,
        variant: "destructive"
      })
    } finally {
      setDeletingUser(false)
    }
  }

  const handleStatusChange = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      if (userType === 'teacher') {
        await teacherApi.updateTeacher(id, {
          status: currentStatus === 'active' ? 'inactive' : 'active'
        })
      } else {
        await studentApi.updateStudent(id, {
          status: currentStatus === 'active' ? 'inactive' : 'active'
        })
      }
      toast({
        title: "Success",
        description: `${userType === 'teacher' ? 'Teacher' : 'Student'} status updated successfully`
      })
      if (userType === 'teacher') {
        loadTeachers()
      } else {
        loadStudents()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${userType} status`,
        variant: "destructive"
      })
    }
  }

  // Filter users based on search query
  const filteredUsers = userType === 'teacher'
    ? teachers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{userType === "teacher" ? "Manage Teachers" : "Manage Students"}</CardTitle>
        <CardDescription>
          {userType === "teacher"
            ? "Add, edit, or remove teachers from the system"
            : "Add, edit, or remove students from the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="relative w-64">
            <Input
              placeholder={`Search ${userType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            disabled={addingUser || updatingUser || deletingUser}
          >
            Add {userType === "teacher" ? "Teacher" : "Student"}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              {userType === "teacher" ? (
                <>
                  <TableHead>Subject</TableHead>
                  <TableHead>Classes</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll No.</TableHead>
                </>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                {userType === "teacher" ? (
                  <>
                    <TableCell>{(user as Teacher).subject}</TableCell>
                    <TableCell>
                      {(user as Teacher).classes.map(classId => {
                        const classObj = classes.find(c => c._id === classId);
                        return classObj ? classObj.name : classId;
                      }).join(', ')}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      {classes.find(cls => cls._id === (user as Student).class)?.name || 'Unknown Class'}
                    </TableCell>
                    <TableCell>{(user as Student).rollNo}</TableCell>
                  </>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(user._id, user.status)}
                    className={user.status === "active" ? "text-green-600" : "text-red-600"}
                  >
                    {user.status === "active" ? "Active" : "Inactive"}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </Button>
                  {!teacherView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingUser}
                    >
                      {deletingUser ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {userType === "teacher" ? "Teacher" : "Student"}</DialogTitle>
            <DialogDescription>Fill in the details to add a new {userType} to the system.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3">
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {userType === "teacher" ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subject" className="text-right">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      className="col-span-3"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="classes" className="text-right">
                      Classes
                    </Label>
                    <div className="col-span-3">
                      {loadingClasses ? (
                        <Skeleton className="h-10 w-full" />
                      ) : classes.length > 0 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {formData.classes.length > 0
                                ? `${formData.classes.length} classes selected`
                                : "Select classes"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search classes..." />
                              <CommandEmpty>No class found.</CommandEmpty>
                              <CommandGroup className="max-h-60 overflow-y-auto">
                                {classes.map((cls) => (
                                  <CommandItem
                                    key={cls._id}
                                    value={cls.name}
                                    onSelect={() => {
                                      const isSelected = formData.classes.includes(cls._id);
                                      const updatedClasses = isSelected
                                        ? formData.classes.filter(id => id !== cls._id)
                                        : [...formData.classes, cls._id];
                                      setFormData({ ...formData, classes: updatedClasses });
                                    }}
                                  >
                                    <Checkbox
                                      checked={formData.classes.includes(cls._id)}
                                      className="mr-2"
                                    />
                                    {cls.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <p className="text-sm text-slate-500">No classes available</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="class" className="text-right">
                      Class
                    </Label>
                    <div className="col-span-3">
                      {loadingClasses ? (
                        <Skeleton className="h-10 w-full" />
                      ) : classes.length > 0 ? (
                        <Select
                          value={formData.class}
                          onValueChange={(value) => setFormData({ ...formData, class: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls._id} value={cls._id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-slate-500">No classes available</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rollNo" className="text-right">
                      Roll No.
                    </Label>
                    <Input
                      id="rollNo"
                      className="col-span-3"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addingUser}>
                {addingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>Add {userType === "teacher" ? "Teacher" : "Student"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {userType === "teacher" ? "Teacher" : "Student"}</DialogTitle>
            <DialogDescription>Update {userType} details.</DialogDescription>
          </DialogHeader>

          {editData && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    className="col-span-3"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    className="col-span-3"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    required
                  />
                </div>
                {userType === "teacher" ? (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-subject" className="text-right">
                        Subject
                      </Label>
                      <Input
                        id="edit-subject"
                        className="col-span-3"
                        value={(editData as Teacher).subject}
                        onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-classes" className="text-right">
                        Classes
                      </Label>
                      <div className="col-span-3">
                        {loadingClasses ? (
                          <Skeleton className="h-10 w-full" />
                        ) : classes.length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                {(editData as Teacher).classes.length > 0
                                  ? `${(editData as Teacher).classes.length} classes selected`
                                  : "Select classes"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search classes..." />
                                <CommandEmpty>No class found.</CommandEmpty>
                                <CommandGroup className="max-h-60 overflow-y-auto">
                                  {classes.map((cls) => (
                                    <CommandItem
                                      key={cls._id}
                                      value={cls.name}
                                      onSelect={() => {
                                        const isSelected = (editData as Teacher).classes.includes(cls._id);
                                        const updatedClasses = isSelected
                                          ? (editData as Teacher).classes.filter(id => id !== cls._id)
                                          : [...(editData as Teacher).classes, cls._id];
                                        setEditData({ ...editData, classes: updatedClasses });
                                      }}
                                    >
                                      <Checkbox
                                        checked={(editData as Teacher).classes.includes(cls._id)}
                                        className="mr-2"
                                      />
                                      {cls.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <p className="text-sm text-slate-500">No classes available</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-class" className="text-right">
                        Class
                      </Label>
                      <div className="col-span-3">
                        {loadingClasses ? (
                          <Skeleton className="h-10 w-full" />
                        ) : Array.isArray(classes) && classes.length > 0 ? (
                          <Select
                            value={(editData as Student).class}
                            onValueChange={(value) => setEditData({ ...editData, class: value })}
                          >
                            <SelectTrigger>
                              <SelectValue>
                                {Array.isArray(classes) && classes.find(cls => cls._id === (editData as Student).class)?.name || "Select class"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls._id} value={cls._id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-slate-500">No classes available</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-rollNo" className="text-right">
                        Roll No.
                      </Label>
                      <Input
                        id="edit-rollNo"
                        className="col-span-3"
                        value={(editData as Student).rollNo}
                        onChange={(e) => setEditData({ ...editData, rollNo: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updatingUser}>
                  {updatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>Update {userType === "teacher" ? "Teacher" : "Student"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
