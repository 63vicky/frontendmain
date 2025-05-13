import ClassManagement from "@/app/dashboard/principal/classes/page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <Tabs defaultValue="classes">
      <TabsList>
        <TabsTrigger value="classes">Classes</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
      </TabsList>
      <TabsContent value="classes">
        <ClassManagement />
      </TabsContent>
      <TabsContent value="teachers">
        <div>Teachers content will go here</div>
      </TabsContent>
    </Tabs>
  )
}