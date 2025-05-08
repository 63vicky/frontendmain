"use client"

import { useState } from "react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Brush
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface StackedAreaChartProps {
  title?: string
  description?: string
  data: Array<{
    date: string
    [key: string]: any
  }>
  areaKeys: Array<{
    key: string
    name: string
    color: string
  }>
  xAxisDataKey?: string
  xAxisLabel?: string
  yAxisLabel?: string
  loading?: boolean
  timeRangeOptions?: Array<{
    value: string
    label: string
  }>
  showBrush?: boolean
  stackedMode?: boolean
}

export default function StackedAreaChart({
  title = "Performance Trends",
  description = "Visualize performance trends over time",
  data,
  areaKeys,
  xAxisDataKey = "date",
  xAxisLabel = "Date",
  yAxisLabel = "Score (%)",
  loading = false,
  timeRangeOptions = [
    { value: "1w", label: "Last Week" },
    { value: "1m", label: "Last Month" },
    { value: "3m", label: "Last 3 Months" },
    { value: "6m", label: "Last 6 Months" },
    { value: "1y", label: "Last Year" },
    { value: "all", label: "All Time" }
  ],
  showBrush = true,
  stackedMode = true
}: StackedAreaChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all")
  const [isStacked, setIsStacked] = useState<boolean>(stackedMode)
  
  // Filter data based on selected time range
  // In a real implementation, you would filter the data based on the selected time range
  // For now, we'll just use all the data
  const filteredData = data
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="stacked-mode" 
                checked={isStacked} 
                onCheckedChange={setIsStacked} 
              />
              <Label htmlFor="stacked-mode">Stacked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="time-range-select">Time Range:</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger id="time-range-select" className="w-[150px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
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
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {areaKeys.map((areaKey, index) => (
                <Area
                  key={areaKey.key}
                  type="monotone"
                  dataKey={areaKey.key}
                  name={areaKey.name}
                  stackId={isStacked ? "1" : index.toString()}
                  fill={areaKey.color}
                  stroke={areaKey.color}
                  fillOpacity={0.6}
                />
              ))}
              
              {showBrush && (
                <Brush 
                  dataKey={xAxisDataKey} 
                  height={30} 
                  stroke="#8884d8"
                  startIndex={Math.max(0, filteredData.length - 10)}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
