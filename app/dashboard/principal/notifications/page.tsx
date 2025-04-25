"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DashboardLayout from "@/components/dashboard-layout"
import { Bell, CheckCircle, Clock, Search, MoreVertical, Trash2, Eye, Send } from "lucide-react"

export default function PrincipalNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const notifications = [
    {
      id: 1,
      title: "Teacher Approval Request",
      message: "Mr. Johnson has requested approval for Mathematics Final Exam.",
      date: "Today, 11:30 AM",
      type: "approval",
      isRead: false,
      sender: "Mr. Johnson",
      priority: "high",
    },
    {
      id: 2,
      title: "System Update",
      message: "The exam management system will be updated tonight at 11:00 PM.",
      date: "Today, 9:15 AM",
      type: "system",
      isRead: false,
      sender: "System Admin",
      priority: "medium",
    },
    {
      id: 3,
      title: "Parent Complaint",
      message: "A parent has raised concerns about the Science exam difficulty level.",
      date: "Yesterday, 2:45 PM",
      type: "complaint",
      isRead: true,
      sender: "Parent Portal",
      priority: "high",
    },
    {
      id: 4,
      title: "Staff Meeting Reminder",
      message: "Staff meeting scheduled for tomorrow at 9:00 AM in the conference room.",
      date: "Yesterday, 10:00 AM",
      type: "meeting",
      isRead: true,
      sender: "Admin Office",
      priority: "medium",
    },
    {
      id: 5,
      title: "Exam Results Summary",
      message: "Class 10 Mathematics exam results have been published. Average score: 78%.",
      date: "Apr 20, 2025",
      type: "result",
      isRead: true,
      sender: "Exam Department",
      priority: "medium",
    },
    {
      id: 6,
      title: "New Teacher Onboarding",
      message: "Ms. Sarah Chen has joined as the new English teacher. Please complete onboarding.",
      date: "Apr 18, 2025",
      type: "onboarding",
      isRead: true,
      sender: "HR Department",
      priority: "medium",
    },
    {
      id: 7,
      title: "Budget Approval Required",
      message: "Science department has requested additional budget for lab equipment.",
      date: "Apr 15, 2025",
      type: "approval",
      isRead: true,
      sender: "Finance Department",
      priority: "high",
    },
  ]

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.isRead) ||
      (filter === "high" && notification.priority === "high") ||
      filter === notification.type
    return matchesSearch && matchesFilter
  })

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "approval":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "result":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "complaint":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "meeting":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "system":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case "onboarding":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500 dark:bg-red-600">High Priority</Badge>
      case "medium":
        return <Badge className="bg-yellow-500 dark:bg-yellow-600">Medium Priority</Badge>
      default:
        return <Badge className="bg-green-500 dark:bg-green-600">Low Priority</Badge>
    }
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with important school activities and requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Mark All as Read
            </Button>
            <Button className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Announcement
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notifications..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="high">High Priority</TabsTrigger>
              <TabsTrigger value="approval">Approvals</TabsTrigger>
              <TabsTrigger value="complaint">Complaints</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden border-l-4 ${
                  !notification.isRead ? "border-l-indigo-500 dark:border-l-indigo-400" : "border-l-transparent"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-indigo-500">
                            New
                          </Badge>
                        )}
                        <Badge className={getNotificationTypeColor(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1 inline" />
                          {notification.date}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          From: <span className="font-medium">{notification.sender}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-auto">
                      <Button variant="outline" size="sm" className="h-8">
                        Respond
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-red-500 dark:text-red-400">
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search or filter criteria"
                  : "You're all caught up! Check back later for new notifications"}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
