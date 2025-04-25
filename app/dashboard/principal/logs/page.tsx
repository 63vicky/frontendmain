"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Download, Calendar, Clock, User, FileText, Filter } from "lucide-react"

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [activityType, setActivityType] = useState("all")
  const [userType, setUserType] = useState("all")

  // Mock data
  const logs = [
    {
      id: 1,
      user: "John Smith",
      userType: "Teacher",
      activity: "Created Quiz",
      details: "Mathematics - Chapter 3 Quiz",
      date: "2025-05-01",
      time: "09:15:22",
      ip: "192.168.1.105",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      userType: "Teacher",
      activity: "Modified Quiz",
      details: "Science - Quiz 4",
      date: "2025-05-01",
      time: "10:30:45",
      ip: "192.168.1.106",
    },
    {
      id: 3,
      user: "Dr. Robert Anderson",
      userType: "Principal",
      activity: "Approved Quiz",
      details: "Mathematics - Chapter 3 Quiz",
      date: "2025-05-01",
      time: "11:45:12",
      ip: "192.168.1.101",
    },
    {
      id: 4,
      user: "Michael Brown",
      userType: "Teacher",
      activity: "Bulk Upload",
      details: "Uploaded 45 questions for English - Grammar Test",
      date: "2025-05-02",
      time: "08:20:33",
      ip: "192.168.1.107",
    },
    {
      id: 5,
      user: "Dr. Robert Anderson",
      userType: "Principal",
      activity: "Added Class",
      details: "Added Class 7C",
      date: "2025-05-02",
      time: "09:05:18",
      ip: "192.168.1.101",
    },
    {
      id: 6,
      user: "Emily Davis",
      userType: "Teacher",
      activity: "Sent Notification",
      details: "Sent exam reminder to Class 9A",
      date: "2025-05-02",
      time: "10:15:40",
      ip: "192.168.1.108",
    },
    {
      id: 7,
      user: "Alex Johnson",
      userType: "Student",
      activity: "Completed Quiz",
      details: "Mathematics - Chapter 3 Quiz (Score: 85%)",
      date: "2025-05-02",
      time: "11:30:22",
      ip: "192.168.1.120",
    },
    {
      id: 8,
      user: "Dr. Robert Anderson",
      userType: "Principal",
      activity: "Generated Report",
      details: "Downloaded Class 8 Performance Report",
      date: "2025-05-03",
      time: "09:45:10",
      ip: "192.168.1.101",
    },
    {
      id: 9,
      user: "David Wilson",
      userType: "Teacher",
      activity: "Deactivated Quiz",
      details: "Geography - Map Quiz",
      date: "2025-05-03",
      time: "10:50:33",
      ip: "192.168.1.109",
    },
    {
      id: 10,
      user: "Maria Garcia",
      userType: "Student",
      activity: "Completed Quiz",
      details: "Science - Quiz 4 (Score: 92%)",
      date: "2025-05-03",
      time: "11:25:45",
      ip: "192.168.1.121",
    },
  ]

  // Filter logs based on search query, date range, activity type, and user type
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDateRange =
      (!dateRange.from || log.date >= dateRange.from) && (!dateRange.to || log.date <= dateRange.to)

    const matchesActivityType = activityType === "all" || log.activity.includes(activityType)

    const matchesUserType = userType === "all" || log.userType === userType

    return matchesSearch && matchesDateRange && matchesActivityType && matchesUserType
  })

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">Track all activities in the system</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>System Activity Logs</CardTitle>
            <CardDescription>View all activities performed by users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    placeholder="From"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="date"
                    placeholder="To"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-32"
                  />
                </div>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Activities</option>
                  <option value="Created">Created</option>
                  <option value="Modified">Modified</option>
                  <option value="Approved">Approved</option>
                  <option value="Bulk Upload">Bulk Upload</option>
                  <option value="Added">Added</option>
                  <option value="Sent">Sent</option>
                  <option value="Completed">Completed</option>
                  <option value="Generated">Generated</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Users</option>
                  <option value="Principal">Principal</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("")
                    setDateRange({ from: "", to: "" })
                    setActivityType("all")
                    setUserType("all")
                  }}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-500" />
                            <div>
                              <p className="font-medium">{log.user}</p>
                              <Badge
                                variant="outline"
                                className={
                                  log.userType === "Principal"
                                    ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                                    : log.userType === "Teacher"
                                      ? "border-purple-500 text-purple-700 bg-purple-50"
                                      : "border-green-500 text-green-700 bg-green-50"
                                }
                              >
                                {log.userType}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.activity.includes("Created") || log.activity.includes("Added")
                                ? "border-green-500 text-green-700 bg-green-50"
                                : log.activity.includes("Modified") || log.activity.includes("Approved")
                                  ? "border-blue-500 text-blue-700 bg-blue-50"
                                  : log.activity.includes("Deactivated")
                                    ? "border-red-500 text-red-700 bg-red-50"
                                    : "border-indigo-500 text-indigo-700 bg-indigo-50"
                            }
                          >
                            {log.activity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span>{log.details}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{log.time}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{log.ip}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
