"use client"

import { useState } from "react"
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

interface UserManagementProps {
  userType: "teacher" | "student"
  teacherView?: boolean
}

export default function UserManagement({ userType, teacherView = false }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Mock data
  const users =
    userType === "teacher"
      ? [
        {
          id: 1,
          name: "John Smith",
          email: "john.smith@example.com",
          subject: "Mathematics",
          classes: "8A, 9B, 10C",
          status: "Active",
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          subject: "Science",
          classes: "7A, 8B, 9A",
          status: "Active",
        },
        {
          id: 3,
          name: "Michael Brown",
          email: "michael.brown@example.com",
          subject: "English",
          classes: "10A, 10B, 10C",
          status: "Active",
        },
        {
          id: 4,
          name: "Emily Davis",
          email: "emily.davis@example.com",
          subject: "History",
          classes: "8A, 9A, 9C",
          status: "Active",
        },
        {
          id: 5,
          name: "David Wilson",
          email: "david.wilson@example.com",
          subject: "Geography",
          classes: "7B, 8C, 9B",
          status: "Inactive",
        },
      ]
      : [
        { id: 1, name: "Alex Johnson", email: "alex.j@example.com", class: "8A", rollNo: "8A01", status: "Active" },
        { id: 2, name: "Maria Garcia", email: "maria.g@example.com", class: "8A", rollNo: "8A02", status: "Active" },
        { id: 3, name: "James Wilson", email: "james.w@example.com", class: "8B", rollNo: "8B01", status: "Active" },
        { id: 4, name: "Sarah Chen", email: "sarah.c@example.com", class: "8B", rollNo: "8B02", status: "Active" },
        { id: 5, name: "Raj Patel", email: "raj.p@example.com", class: "9A", rollNo: "9A01", status: "Active" },
        {
          id: 6,
          name: "Emma Thompson",
          email: "emma.t@example.com",
          class: "9A",
          rollNo: "9A02",
          status: "Inactive",
        },
        {
          id: 7,
          name: "Mohammed Ali",
          email: "mohammed.a@example.com",
          class: "9B",
          rollNo: "9B01",
          status: "Active",
        },
        {
          id: 8,
          name: "Sofia Rodriguez",
          email: "sofia.r@example.com",
          class: "9B",
          rollNo: "9B02",
          status: "Active",
        },
      ]

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                {userType === "teacher" ? (
                  <>
                    <TableCell>{(user as any).subject}</TableCell>
                    <TableCell>{(user as any).classes}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{(user as any).class}</TableCell>
                    <TableCell>{(user as any).rollNo}</TableCell>
                  </>
                )}
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  {!teacherView && (
                    <Button variant="ghost" size="sm" className="text-red-500">
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {userType === "teacher" ? "Teacher" : "Student"}</DialogTitle>
            <DialogDescription>Fill in the details to add a new {userType} to the system.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" className="col-span-3" />
            </div>

            {userType === "teacher" ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input id="subject" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="classes" className="text-right">
                    Classes
                  </Label>
                  <Input id="classes" className="col-span-3" placeholder="e.g., 8A, 9B, 10C" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class" className="text-right">
                    Class
                  </Label>
                  <Select>
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
                  <Input id="rollNo" className="col-span-3" />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Add {userType === "teacher" ? "Teacher" : "Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
