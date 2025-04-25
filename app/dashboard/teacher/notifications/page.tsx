import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, Clock, Info, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function TeacherNotificationsPage() {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Exam Approval Required",
      message: "Your Mathematics Final Exam needs principal approval before publishing",
      date: "1 hour ago",
      type: "warning",
      read: false,
      actionable: true,
      action: "Review",
    },
    {
      id: 2,
      title: "Student Query",
      message: "John Smith has a question about the Science Mid-term exam",
      date: "3 hours ago",
      type: "info",
      read: false,
      actionable: true,
      action: "Respond",
    },
    {
      id: 3,
      title: "Exam Results Published",
      message: "History Mid-term results have been published successfully",
      date: "Yesterday",
      type: "success",
      read: false,
      actionable: false,
    },
    {
      id: 4,
      title: "Deadline Approaching",
      message: "Grade submission deadline for English Literature is tomorrow",
      date: "2 days ago",
      type: "alert",
      read: true,
      actionable: true,
      action: "Submit Grades",
    },
    {
      id: 5,
      title: "Department Meeting",
      message: "Reminder: Science department meeting scheduled for Friday, 2:00 PM",
      date: "3 days ago",
      type: "info",
      read: true,
      actionable: false,
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3.5 w-3.5" />
            <span>{notifications.filter((n) => !n.read).length} Unread</span>
          </Badge>
        </div>

        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-70 dark:opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(notification.type)}
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                  </div>
                  <CardDescription>{notification.date}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                  {notification.actionable && (
                    <Button size="sm" variant="outline" className="ml-4">
                      {notification.action}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
