"use client"

import { useState } from "react"
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Label
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label as UILabel } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScatterPlotChartProps {
  title?: string
  description?: string
  data: Array<{
    id: string | number
    name?: string
    xValue: number
    yValue: number
    category?: string
    [key: string]: any
  }>
  xAxisDataKey?: string
  yAxisDataKey?: string
  xAxisLabel?: string
  yAxisLabel?: string
  loading?: boolean
  categories?: Array<{
    name: string
    color: string
  }>
  showTrendline?: boolean
  showQuadrants?: boolean
  quadrantLabels?: {
    q1: string
    q2: string
    q3: string
    q4: string
  }
}

export default function ScatterPlotChart({
  title = "Correlation Analysis",
  description = "Identify correlations between time spent and scores",
  data,
  xAxisDataKey = "xValue",
  yAxisDataKey = "yValue",
  xAxisLabel = "Time Spent (minutes)",
  yAxisLabel = "Score (%)",
  loading = false,
  categories = [
    { name: "Easy", color: "#10b981" },
    { name: "Medium", color: "#f59e0b" },
    { name: "Hard", color: "#ef4444" }
  ],
  showTrendline = true,
  showQuadrants = true,
  quadrantLabels = {
    q1: "High Score, Low Time (Efficient)",
    q2: "High Score, High Time (Thorough)",
    q3: "Low Score, Low Time (Rushed)",
    q4: "Low Score, High Time (Struggling)"
  }
}: ScatterPlotChartProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Calculate average x and y values for quadrant lines
  const avgX = data.reduce((sum, item) => sum + item[xAxisDataKey], 0) / data.length
  const avgY = data.reduce((sum, item) => sum + item[yAxisDataKey], 0) / data.length
  
  // Calculate linear regression for trendline
  const calculateTrendline = () => {
    const n = data.length
    const sumX = data.reduce((sum, item) => sum + item[xAxisDataKey], 0)
    const sumY = data.reduce((sum, item) => sum + item[yAxisDataKey], 0)
    const sumXY = data.reduce((sum, item) => sum + (item[xAxisDataKey] * item[yAxisDataKey]), 0)
    const sumXX = data.reduce((sum, item) => sum + (item[xAxisDataKey] * item[xAxisDataKey]), 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Get min and max x values
    const minX = Math.min(...data.map(item => item[xAxisDataKey]))
    const maxX = Math.max(...data.map(item => item[xAxisDataKey]))
    
    return [
      { x: minX, y: minX * slope + intercept },
      { x: maxX, y: maxX * slope + intercept }
    ]
  }
  
  const trendlineData = calculateTrendline()
  
  // Filter data based on active tab
  const filteredData = activeTab === "all" 
    ? data 
    : data.filter(item => item.category === activeTab)
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{data.name || `Student ${data.id}`}</p>
          <p className="text-sm text-gray-600">{`${xAxisLabel}: ${data[xAxisDataKey]}`}</p>
          <p className="text-sm text-gray-600">{`${yAxisLabel}: ${data[yAxisDataKey]}`}</p>
          {data.category && <p className="text-sm text-gray-600">{`Category: ${data.category}`}</p>}
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.name} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 40,
                left: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisDataKey} 
                type="number" 
                name={xAxisLabel} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey={yAxisDataKey} 
                type="number" 
                name={yAxisLabel}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Show quadrant lines if enabled */}
              {showQuadrants && (
                <>
                  <ReferenceLine x={avgX} stroke="#9ca3af" strokeDasharray="3 3">
                    <Label value={avgX.toFixed(1)} position="bottom" />
                  </ReferenceLine>
                  <ReferenceLine y={avgY} stroke="#9ca3af" strokeDasharray="3 3">
                    <Label value={avgY.toFixed(1)} position="left" />
                  </ReferenceLine>
                </>
              )}
              
              {/* Show trendline if enabled */}
              {showTrendline && (
                <Scatter
                  name="Trendline"
                  data={trendlineData}
                  line={{ stroke: '#6366f1', strokeWidth: 2 }}
                  shape="none"
                  legendType="none"
                />
              )}
              
              {/* Show data points */}
              {activeTab === "all" ? (
                categories.map((category) => (
                  <Scatter
                    key={category.name}
                    name={category.name}
                    data={data.filter(item => item.category === category.name)}
                    fill={category.color}
                  />
                ))
              ) : (
                <Scatter
                  name={activeTab}
                  data={filteredData}
                  fill={categories.find(c => c.name === activeTab)?.color || "#6366f1"}
                />
              )}
              
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Quadrant labels */}
        {showQuadrants && (
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600">
            <div className="text-right pr-4">{quadrantLabels.q1}</div>
            <div>{quadrantLabels.q2}</div>
            <div className="text-right pr-4">{quadrantLabels.q3}</div>
            <div>{quadrantLabels.q4}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
