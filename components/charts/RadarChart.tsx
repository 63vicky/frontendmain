"use client"

import { useState, useEffect } from "react"
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SkillRadarProps {
  title?: string
  description?: string
  data: Array<{
    subject: string
    [key: string]: any
  }>
  dataKeys: Array<{
    key: string
    name: string
    color: string
  }>
  loading?: boolean
  compareMode?: boolean
  studentId?: string
  classId?: string
  examId?: string
}

export default function SkillRadarChart({
  title = "Skill Analysis",
  description = "Performance across different skill areas",
  data,
  dataKeys,
  loading = false,
  compareMode = false,
  studentId,
  classId,
  examId
}: SkillRadarProps) {
  const [selectedView, setSelectedView] = useState<string>("student")
  const [chartData, setChartData] = useState(data)

  // Normalize data to 0-100 scale for better visualization
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data)
    }
  }, [data])

  // Handle view change (student vs class average)
  const handleViewChange = (value: string) => {
    setSelectedView(value)
    // In a real implementation, you would fetch different data based on the selected view
    // For now, we'll just use the same data
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Skeleton className="h-64 w-64 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {compareMode && (
            <div className="flex items-center gap-2">
              <Label htmlFor="view-select">Compare with:</Label>
              <Select value={selectedView} onValueChange={handleViewChange}>
                <SelectTrigger id="view-select" className="w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Only</SelectItem>
                  <SelectItem value="class">Class Average</SelectItem>
                  <SelectItem value="topPerformers">Top Performers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
              
              {dataKeys.map((dataKey) => (
                <Radar
                  key={dataKey.key}
                  name={dataKey.name}
                  dataKey={dataKey.key}
                  stroke={dataKey.color}
                  fill={dataKey.color}
                  fillOpacity={0.2}
                />
              ))}
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
