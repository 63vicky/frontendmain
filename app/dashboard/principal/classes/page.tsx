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
import { PlusCircle, Search, Edit, Trash2, Users } from "lucide-react"

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)

  // Mock data
  const classes = [
    { id: 1, name: "Class 7A", section: "A", students: 32, teacher: "John Smith", status: "Active" },
    { id: 2, name: "Class 7B", section: "B", students: 30, teacher: "Sarah Johnson", status: "Active" },
    { id: 3, name: "Class 8A", section: "A", students: 35, teacher: "Michael Brown", status: "Active" },
    { id: 4, name: "Class 8B", section: "B", students: 33, teacher: "Emily Davis", status: "Active" },
    { id: 5, name: "Class 9A", section: "A", students: 30, teacher: "David Wilson", status: "Active" },
    { id: 6, name: "Class 9B", section: "B", students: 28, teacher: "Jennifer Lee", status: "Inactive" },
    { id: 7, name: "Class 10A", section: "A", students: 25, teacher: "Robert Taylor", status: "Active" },
    { id: 8, name: "Class 10B", section: "B", students: 27, teacher: "Lisa Anderson", status: "Active" },
  ]

  // Filter classes based on search query
  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (cls: any) => {
    setSelectedClass(cls)
    setShowAddDialog(true)
  }

  const handleDelete = (cls: any) => {
    setSelectedClass(cls)
    setShowDeleteDialog(true)
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
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No classes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.section}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-indigo-500" />
                          {cls.students}
                        </div>
                      </TableCell>
                      <TableCell>{cls.teacher}</TableCell>
                      <TableCell>
                        <Badge
                          variant={cls.status === "Active" ? "default" : "secondary"}
                          className={cls.status === "Active" ? "bg-green-500" : "bg-red-500"}
                        >
                          {cls.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cls)}>
                          <Edit className="h-4 w-4 text-indigo-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cls)}>
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

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="className" className="text-right font-medium">
                Class Name
              </label>
              <Input
                id="className"
                defaultValue={selectedClass?.name || ""}
                className="col-span-3"
                placeholder="e.g., Class 7A"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="section" className="text-right font-medium">
                Section
              </label>
              <Input
                id="section"
                defaultValue={selectedClass?.section || ""}
                className="col-span-3"
                placeholder="e.g., A"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="teacher" className="text-right font-medium">
                Class Teacher
              </label>
              <Input
                id="teacher"
                defaultValue={selectedClass?.teacher || ""}
                className="col-span-3"
                placeholder="Select class teacher"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <select
                id="status"
                defaultValue={selectedClass?.status || "Active"}
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
              {selectedClass ? "Save Changes" : "Add Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedClass?.name}? This action cannot be undone.
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
