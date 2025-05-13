"use client"

import { useState, useEffect } from "react"
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
import { PlusCircle, Search, Edit, Trash2, Users, Loader2 } from "lucide-react"
import { classApi, getSubjects } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Class {
  _id: string;
  name: string;
  section: string;
  students: number;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  schedule: string;
  status: 'Active' | 'Inactive';
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    subject: '',
    schedule: '',
    status: 'Active' as 'Active' | 'Inactive'
  })
  const { toast } = useToast()

  useEffect(() => {
    loadClasses()
    loadSubjects()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await classApi.getAllClasses()
      setClasses(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true)
      const data = await getSubjects()
      setSubjects(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive"
      })
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (selectedClass) {
        await classApi.updateClass(selectedClass._id, formData)
        toast({
          title: "Success",
          description: "Class updated successfully",
          variant: "default"
        })
      } else {
        await classApi.createClass(formData)
        toast({
          title: "Success",
          description: "Class created successfully",
          variant: "default"
        })
      }
      setShowAddDialog(false)
      setSelectedClass(null)
      setFormData({
        name: '',
        section: '',
        subject: '',
        schedule: '',
        status: 'Active'
      })
      loadClasses()
    } catch (error) {
      toast({
        title: "Error",
        description: selectedClass ? "Failed to update class" : "Failed to create class",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls)
    setFormData({
      name: cls.name,
      section: cls.section,
      subject: cls?.subject?._id || "",
      schedule: cls?.schedule || "",
      status: cls.status
    })
    setShowAddDialog(true)
  }

  const handleDelete = async () => {
    if (!selectedClass) return
    setIsSubmitting(true)
    try {
      await classApi.deleteClass(selectedClass._id)
      toast({
        title: "Success",
        description: "Class deleted successfully",
        variant: "default"
      })
      setShowDeleteDialog(false)
      setSelectedClass(null)
      loadClasses()
    } catch (error) {
      // Display the specific error message from the API
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete class",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusToggle = async (cls: Class) => {
    try {
      const newStatus = cls.status === 'Active' ? 'Inactive' : 'Active'
      await classApi.updateClass(cls._id, { status: newStatus })
      toast({
        title: "Success",
        description: `Class status updated to ${newStatus}`,
        variant: "default"
      })
      loadClasses()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class status",
        variant: "destructive"
      })
    }
  }

  // Filter classes based on search query
  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout role="principal">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Class Management</h1>
            <p className="text-muted-foreground">Add, edit, or remove classes from the system</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            onClick={() => {
              setSelectedClass(null)
              setFormData({
                name: '',
                section: '',
                subject: '',
                schedule: '',
                status: 'Active'
              })
              setShowAddDialog(true)
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Class
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <CardDescription>Manage all classes in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No classes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.section}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-indigo-500" />
                          {cls.students}
                        </div>
                      </TableCell>
                      <TableCell>{cls?.subject?.name || "-"}</TableCell>
                      <TableCell>{cls?.schedule || "-"}</TableCell>
                      <TableCell>
                        <Badge onClick={() => handleStatusToggle(cls)}
                          variant={cls.status === "Active" ? "default" : "secondary"}
                          className={cls.status === "Active" ? "bg-green-500 cursor-pointer" : "bg-red-500 cursor-pointer"}
                        >
                          {cls.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cls)}>
                          <Edit className="h-4 w-4 text-indigo-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls)
                            setShowDeleteDialog(true)
                          }}
                        >
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

      {/* Add/Edit Class Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedClass ? "Edit Class" : "Add New Class"}</DialogTitle>
            <DialogDescription>
              {selectedClass ? "Edit class details" : "Fill in the details to add a new class"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="className" className="text-right font-medium">
                  Class Name
                </label>
                <Input
                  id="className"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Class 7A"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="section" className="text-right font-medium">
                  Section
                </label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., A"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="subject" className="text-right font-medium">
                  Subject
                </label>
                <div className="col-span-3">
                  {loadingSubjects ? (
                    <div className="h-10 w-full rounded-md border border-input bg-muted animate-pulse" />
                  ) : (
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger>
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
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="schedule" className="text-right font-medium">
                  Schedule
                </label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Mon, Wed, Fri 9:00 AM - 10:30 AM"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right font-medium">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedClass ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  selectedClass ? "Update Class" : "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? (
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
    </DashboardLayout>
  )
}
