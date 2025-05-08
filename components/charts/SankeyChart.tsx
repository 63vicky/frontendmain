"use client"

import { useState } from "react"
import { 
  Sankey, 
  Tooltip, 
  ResponsiveContainer,
  Rectangle,
  Layer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SankeyChartProps {
  title?: string
  description?: string
  data: {
    nodes: Array<{
      name: string
      color?: string
      value?: number
    }>
    links: Array<{
      source: number
      target: number
      value: number
      color?: string
    }>
  }
  loading?: boolean
  viewOptions?: Array<{
    value: string
    label: string
  }>
  nodePadding?: number
  nodeWidth?: number
  linkOpacity?: number
}

// Custom node renderer
const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload, containerWidth } = props
  const isOut = x + width + 6 > containerWidth
  
  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color || "#8884d8"}
        fillOpacity="1"
      />
      <text
        textAnchor={isOut ? 'end' : 'start'}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="12"
        fill="#333"
        alignmentBaseline="middle"
      >
        {payload.name} ({payload.value})
      </text>
    </Layer>
  )
}

// Custom link renderer
const CustomLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props
  
  return (
    <Layer key={`CustomLink${index}`}>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        `}
        fill="none"
        stroke={payload.color || "#9ca3af"}
        strokeWidth={linkWidth}
        strokeOpacity={payload.opacity || 0.3}
      />
    </Layer>
  )
}

export default function SankeyChart({
  title = "Student Flow Analysis",
  description = "Visualize the flow of students through different performance categories",
  data,
  loading = false,
  viewOptions = [
    { value: "performance", label: "Performance Categories" },
    { value: "difficulty", label: "Difficulty Levels" },
    { value: "subjects", label: "Subjects" }
  ],
  nodePadding = 50,
  nodeWidth = 20,
  linkOpacity = 0.3
}: SankeyChartProps) {
  const [selectedView, setSelectedView] = useState<string>(viewOptions[0].value)
  
  // In a real implementation, you would filter or transform the data based on the selected view
  // For now, we'll just use the same data
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          {data.payload.source && data.payload.target ? (
            <>
              <p className="font-medium">Flow</p>
              <p className="text-sm text-gray-600">{`${data.payload.source.name} → ${data.payload.target.name}`}</p>
              <p className="text-sm text-gray-600">{`Students: ${data.payload.value}`}</p>
            </>
          ) : (
            <>
              <p className="font-medium">{data.name}</p>
              <p className="text-sm text-gray-600">{`Students: ${data.value}`}</p>
            </>
          )}
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
            <Label htmlFor="view-select">View:</Label>
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger id="view-select" className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {viewOptions.map((option) => (
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
            <Sankey
              data={data}
              nodePadding={nodePadding}
              nodeWidth={nodeWidth}
              linkCurvature={0.5}
              link={<CustomLink />}
              node={<CustomNode />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
