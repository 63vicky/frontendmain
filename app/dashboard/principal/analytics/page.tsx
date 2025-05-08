"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  RadarChart, 
  HeatmapChart, 
  ScatterPlotChart, 
  StackedAreaChart, 
  SankeyChart 
} from "@/components/charts"
import { useToast } from "@/hooks/use-toast"

// Mock data for the charts
const generateMockData = () => {
  // Radar chart data
  const radarData = [
    { subject: 'Mathematics', student: 85, classAverage: 70, topPerformers: 95 },
    { subject: 'Science', student: 65, classAverage: 68, topPerformers: 90 },
    { subject: 'English', student: 90, classAverage: 75, topPerformers: 92 },
    { subject: 'History', student: 70, classAverage: 65, topPerformers: 85 },
    { subject: 'Geography', student: 60, classAverage: 62, topPerformers: 80 },
    { subject: 'Computer Science', student: 95, classAverage: 72, topPerformers: 98 },
  ]

  // Heatmap data
  const classes = ['Class 7', 'Class 8', 'Class 9', 'Class 10']
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography']
  
  const heatmapData = []
  for (const cls of classes) {
    for (const subject of subjects) {
      heatmapData.push({
        x: cls,
        y: subject,
        z: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        students: Math.floor(Math.random() * 20) + 10 // Random number of students
      })
    }
  }

  // Scatter plot data
  const scatterData = []
  for (let i = 0; i < 50; i++) {
    const category = ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
    const timeSpent = Math.floor(Math.random() * 60) + 10 // 10-70 minutes
    
    // Create correlation between time and score based on difficulty
    let scoreBase = 0
    if (category === 'Easy') {
      scoreBase = 80 // Easy questions tend to have higher scores
    } else if (category === 'Medium') {
      scoreBase = 70
    } else {
      scoreBase = 60 // Hard questions tend to have lower scores
    }
    
    // Add some randomness to the score
    const score = Math.min(100, Math.max(0, scoreBase + (Math.random() * 30) - 15))
    
    scatterData.push({
      id: i + 1,
      name: `Student ${i + 1}`,
      xValue: timeSpent,
      yValue: score,
      category
    })
  }

  // Stacked area chart data
  const areaData = []
  const startDate = new Date('2023-01-01')
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)
    
    areaData.push({
      date: date.toISOString().split('T')[0],
      excellent: Math.floor(Math.random() * 20) + 10,
      good: Math.floor(Math.random() * 25) + 20,
      average: Math.floor(Math.random() * 30) + 15,
      needsImprovement: Math.floor(Math.random() * 15) + 5
    })
  }

  // Sankey diagram data
  const sankeyData = {
    nodes: [
      { name: 'Class 7', color: '#60a5fa' },
      { name: 'Class 8', color: '#60a5fa' },
      { name: 'Class 9', color: '#60a5fa' },
      { name: 'Class 10', color: '#60a5fa' },
      { name: 'Excellent', color: '#10b981' },
      { name: 'Good', color: '#34d399' },
      { name: 'Average', color: '#fbbf24' },
      { name: 'Needs Improvement', color: '#f87171' }
    ],
    links: [
      { source: 0, target: 4, value: 30 },
      { source: 0, target: 5, value: 40 },
      { source: 0, target: 6, value: 20 },
      { source: 0, target: 7, value: 10 },
      { source: 1, target: 4, value: 25 },
      { source: 1, target: 5, value: 35 },
      { source: 1, target: 6, value: 30 },
      { source: 1, target: 7, value: 10 },
      { source: 2, target: 4, value: 20 },
      { source: 2, target: 5, value: 30 },
      { source: 2, target: 6, value: 35 },
      { source: 2, target: 7, value: 15 },
      { source: 3, target: 4, value: 15 },
      { source: 3, target: 5, value: 25 },
      { source: 3, target: 6, value: 40 },
      { source: 3, target: 7, value: 20 }
    ]
  }

  return {
    radarData,
    heatmapData,
    scatterData,
    areaData,
    sankeyData
  }
}

export default function AdvancedAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading data from an API
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // In a real application, you would fetch data from your API
        // For now, we'll use mock data
        setTimeout(() => {
          const mockData = generateMockData()
          setData(mockData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again later.',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Gain deeper insights with advanced visualizations</p>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 gap-4">
              <RadarChart
                title="Subject Performance Analysis"
                description="Compare student performance across different subjects"
                data={data?.radarData || []}
                dataKeys={[
                  { key: 'student', name: 'Student', color: '#6366f1' },
                  { key: 'classAverage', name: 'Class Average', color: '#f59e0b' },
                  { key: 'topPerformers', name: 'Top Performers', color: '#10b981' }
                ]}
                loading={loading}
                compareMode={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="grid grid-cols-1 gap-4">
              <HeatmapChart
                title="Class-Subject Performance Heatmap"
                description="Visualize performance patterns across classes and subjects"
                data={data?.heatmapData || []}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="correlation">
            <div className="grid grid-cols-1 gap-4">
              <ScatterPlotChart
                title="Time vs. Score Correlation"
                description="Identify correlations between time spent and scores achieved"
                data={data?.scatterData || []}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="grid grid-cols-1 gap-4">
              <StackedAreaChart
                title="Performance Trends Over Time"
                description="Track how student performance categories change over time"
                data={data?.areaData || []}
                areaKeys={[
                  { key: 'excellent', name: 'Excellent', color: '#10b981' },
                  { key: 'good', name: 'Good', color: '#34d399' },
                  { key: 'average', name: 'Average', color: '#fbbf24' },
                  { key: 'needsImprovement', name: 'Needs Improvement', color: '#f87171' }
                ]}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="flow">
            <div className="grid grid-cols-1 gap-4">
              <SankeyChart
                title="Student Performance Flow"
                description="Visualize how students from different classes flow into performance categories"
                data={data?.sankeyData || { nodes: [], links: [] }}
                loading={loading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
