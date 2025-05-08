"use client"

import { useState } from "react"
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface HeatmapChartProps {
  title?: string
  description?: string
  data: Array<{
    x: string | number
    y: string | number
    z: number
    name?: string
    [key: string]: any
  }>
  xAxisDataKey?: string
  yAxisDataKey?: string
  zAxisDataKey?: string
  xAxisLabel?: string
  yAxisLabel?: string
  loading?: boolean
  colorScale?: Array<string>
  metricOptions?: Array<{
    value: string
    label: string
  }>
}

export default function HeatmapChart({
  title = "Performance Heatmap",
  description = "Visualize performance patterns across classes and subjects",
  data,
  xAxisDataKey = "x",
  yAxisDataKey = "y",
  zAxisDataKey = "z",
  xAxisLabel = "Classes",
  yAxisLabel = "Subjects",
  loading = false,
  colorScale = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#818cf8"],
  metricOptions = [
    { value: "avgScore", label: "Average Score" },
    { value: "passRate", label: "Pass Rate" },
    { value: "attempts", label: "Attempts" }
  ]
}: HeatmapChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>(metricOptions[0].value)

  // Get color based on value
  const getColor = (value: number) => {
    // Normalize value to 0-1 range
    const normalizedValue = Math.min(Math.max(value / 100, 0), 1)
    
    // Calculate index in color scale
    const index = Math.floor(normalizedValue * (colorScale.length - 1))
    
    // Interpolate between colors if needed
    const lowerIndex = Math.floor(index)
    const upperIndex = Math.ceil(index)
    
    if (lowerIndex === upperIndex) {
      return colorScale[lowerIndex]
    }
    
    // Simple linear interpolation between colors
    return colorScale[lowerIndex]
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{`${data.x} - ${data.y}`}</p>
          <p className="text-sm text-gray-600">{`${selectedMetric === 'avgScore' ? 'Average Score' : 
            selectedMetric === 'passRate' ? 'Pass Rate' : 'Attempts'}: ${data.z}${selectedMetric === 'avgScore' || selectedMetric === 'passRate' ? '%' : ''}`}</p>
          {data.students && <p className="text-sm text-gray-600">{`Students: ${data.students}`}</p>}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <Skeleton className="h-80 w-full" />
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
          <div className="flex items-center gap-2">
            <Label htmlFor="metric-select">Metric:</Label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger id="metric-select" className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisDataKey} 
                type="category" 
                name={xAxisLabel} 
                allowDuplicatedCategory={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                dataKey={yAxisDataKey} 
                type="category" 
                name={yAxisLabel}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <ZAxis 
                dataKey={zAxisDataKey} 
                type="number" 
                range={[100, 1000]} 
                name={selectedMetric === 'avgScore' ? 'Average Score' : 
                  selectedMetric === 'passRate' ? 'Pass Rate' : 'Attempts'} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Performance" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.z)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
