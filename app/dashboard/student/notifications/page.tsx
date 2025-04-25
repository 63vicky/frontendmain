"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import { Bell, CheckCircle, Clock, Search, Trash2, Eye } from "lucide-react"

export default function StudentNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const notifications = [
    {
      id: 1,
      title: "New Exam Scheduled",
      message: "Mathematics Chapter 3 Exam has been scheduled for May 2, 2025.",
      date: "Today, 10:30 AM",
      type: "exam",
      isRead: false,
    },
    {
      id: 2,
      title: "Result Published",
      message: "Your Science Quiz 4 result has been published. You scored 85%.",
      date: "Yesterday, 3:15 PM",
      type: "result",
      isRead: false,
    },
    {
      id: 3,
      title: "Assignment Reminder",
      message: "English Grammar Assignment is due tomorrow. Don't forget to submit.",
      date: "Yesterday, 9:00 AM",
      type: "assignment",
      isRead: true,
    },
    {
      id: 4,
      title: "New Learning Material",
      message: "New study material for History Chapter 5 has been uploaded.",
      date: "Apr 20, 2025",
      type: "material",
      isRead: true,
    },
    {
      id: 5,
      title: "Exam Rescheduled",
      message: "Science Final Exam has been rescheduled to May 15, 2025.",
      date: "Apr 18, 2025",
      type: "exam",
      isRead: true,
    },
    {
      id: 6,
      title: "Parent-Teacher Meeting",
      message: "Parent-Teacher Meeting is scheduled for May 5, 2025 at 4:00 PM.",
      date: "Apr 15, 2025",
      type: "announcement",
      isRead: true,
    },
  ]

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filter === "all" || (filter === "unread" && !notification.isRead) || filter === notification.type
    return matchesSearch && matchesFilter
  })

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "result":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "assignment":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "material":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "announcement":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your exams, results, and announcements</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark All as Read
          </Button>
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
              <TabsTrigger value="exam">Exams</TabsTrigger>
              <TabsTrigger value="result">Results</TabsTrigger>
              <TabsTrigger value="assignment">Assignments</TabsTrigger>
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-indigo-500">
                            New
                          </Badge>
                        )}
                        <Badge className={getNotificationTypeColor(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {notification.date}
                      </p>
                    </div>
                    <div className="flex gap-2 self-end md:self-auto">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
