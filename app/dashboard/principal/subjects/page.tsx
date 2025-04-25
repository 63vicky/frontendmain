"use client"

import { useState } from "react"
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
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)

  // Mock data
  const subjects = [
    { id: 1, name: "Mathematics", code: "MATH", classes: "7A, 7B, 8A, 8B", teacher: "John Smith", status: "Active" },
    { id: 2, name: "Science", code: "SCI", classes: "7A, 7B, 8A, 8B", teacher: "Sarah Johnson", status: "Active" },
    { id: 3, name: "English", code: "ENG", classes: "7A, 7B, 8A, 8B", teacher: "Michael Brown", status: "Active" },
    { id: 4, name: "History", code: "HIST", classes: "9A, 9B, 10A, 10B", teacher: "Emily Davis", status: "Active" },
    { id: 5, name: "Geography", code: "GEO", classes: "9A, 9B, 10A, 10B", teacher: "David Wilson", status: "Active" },
    {
      id: 6,
      name: "Computer Science",
      code: "CS",
      classes: "9A, 9B, 10A, 10B",
      teacher: "Jennifer Lee",
      status: "Inactive",
    },
    { id: 7, name: "Physics", code: "PHY", classes: "9A, 9B, 10A, 10B", teacher: "Robert Taylor", status: "Active" },
    { id: 8, name: "Chemistry", code: "CHEM", classes: "9A, 9B, 10A, 10B", teacher: "Lisa Anderson", status: "Active" },
  ]

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject)
    setShowAddDialog(true)
  }

  const handleDelete = (subject: any) => {
    setSelectedSubject(subject)
    setShowDeleteDialog(true)
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
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No subjects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.classes}</TableCell>
                      <TableCell>{subject.teacher}</TableCell>
                      <TableCell>
                        <Badge
                          variant={subject.status === "Active" ? "default" : "secondary"}
                          className={subject.status === "Active" ? "bg-green-500" : "bg-red-500"}
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
                defaultValue={selectedSubject?.name || ""}
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
                defaultValue={selectedSubject?.code || ""}
                className="col-span-3"
                placeholder="e.g., MATH"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="classes" className="text-right font-medium">
                Classes
              </label>
              <Input
                id="classes"
                defaultValue={selectedSubject?.classes || ""}
                className="col-span-3"
                placeholder="e.g., 7A, 7B, 8A"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="teacher" className="text-right font-medium">
                Subject Teacher
              </label>
              <Input
                id="teacher"
                defaultValue={selectedSubject?.teacher || ""}
                className="col-span-3"
                placeholder="Select subject teacher"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <select
                id="status"
                defaultValue={selectedSubject?.status || "Active"}
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
              onClick={() => setShowAddDialog(false)}
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
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
