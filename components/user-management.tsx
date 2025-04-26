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
import { teacherApi, studentApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

export default function UserManagement({ userType, teacherView = false }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    classes: '',
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
  }, [userType])

  const loadTeachers = async () => {
    try {
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
    try {
      if (userType === 'teacher') {
        const classes = formData.classes.split(',').map(c => c.trim())
        await teacherApi.createTeacher({
          ...formData,
          classes
        })
      } else {
        await studentApi.createStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          class: formData.class,
          rollNo: formData.rollNo
        })
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
        classes: '',
        class: '',
        rollNo: ''
      })
      if (userType === 'teacher') {
        loadTeachers()
      } else {
        loadStudents()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${userType}`,
        variant: "destructive"
      })
    }
  }

  const handleEdit = (user: Teacher | Student) => {
    setEditData(user)
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editData) return

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
        await studentApi.updateStudent(student._id, {
          name: student.name,
          email: student.email,
          class: student.class,
          rollNo: student.rollNo,
          status: student.status
        })
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
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${userType}`,
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${userType}?`)) return
    try {
      if (userType === 'teacher') {
        await teacherApi.deleteTeacher(id)
      } else {
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
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${userType}`,
        variant: "destructive"
      })
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
    return <div>Loading...</div>
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
          <Button onClick={() => setShowAddDialog(true)}>Add {userType === "teacher" ? "Teacher" : "Student"}</Button>
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
                    <TableCell>{(user as Teacher).classes.join(', ')}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{(user as Student).class}</TableCell>
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
                    >
                      Delete
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
                <Input 
                  id="password" 
                  type="password" 
                  className="col-span-3"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
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
                    <Input 
                      id="classes" 
                      className="col-span-3" 
                      placeholder="e.g., 8A, 9B, 10C"
                      value={formData.classes}
                      onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="class" className="text-right">
                      Class
                    </Label>
                    <Select
                      value={formData.class}
                      onValueChange={(value) => setFormData({ ...formData, class: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7A">7A</SelectItem>
                        <SelectItem value="7B">7B</SelectItem>
                        <SelectItem value="8A">8A</SelectItem>
                        <SelectItem value="8B">8B</SelectItem>
                        <SelectItem value="9A">9A</SelectItem>
                        <SelectItem value="9B">9B</SelectItem>
                      </SelectContent>
                    </Select>
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
              <Button type="submit">Add {userType === "teacher" ? "Teacher" : "Student"}</Button>
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
                      <Input 
                        id="edit-classes" 
                        className="col-span-3" 
                        placeholder="e.g., 8A, 9B, 10C"
                        value={(editData as Teacher).classes.join(', ')}
                        onChange={(e) => setEditData({ ...editData, classes: e.target.value.split(',').map(c => c.trim()) })}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-class" className="text-right">
                        Class
                      </Label>
                      <Select
                        value={(editData as Student).class}
                        onValueChange={(value) => setEditData({ ...editData, class: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7A">7A</SelectItem>
                          <SelectItem value="7B">7B</SelectItem>
                          <SelectItem value="8A">8A</SelectItem>
                          <SelectItem value="8B">8B</SelectItem>
                          <SelectItem value="9A">9A</SelectItem>
                          <SelectItem value="9B">9B</SelectItem>
                        </SelectContent>
                      </Select>
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
                <Button type="submit">Update {userType === "teacher" ? "Teacher" : "Student"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
