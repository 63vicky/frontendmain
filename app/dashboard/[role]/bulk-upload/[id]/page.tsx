"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Search } from "lucide-react"
import { bulkUploadApi } from "@/lib/api"
import { BulkUpload } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function BulkUploadDetails() {
  const params = useParams()
  const router = useRouter()
  const [bulkUpload, setBulkUpload] = useState<BulkUpload | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    const fetchBulkUploadDetails = async () => {
      try {
        setLoading(true)
        const response = await bulkUploadApi.getUploadById(params.id as string)
        setBulkUpload(response.data)

        // Extract records from the processedData field
        if (response.data.processedData && response.data.processedData.records) {
          // Fetch classes and subjects to map IDs to names
          let classes = []
          let subjects = []

          try {
            // Fetch classes
            const classesResponse = await fetch(`${API_URL}/classes`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            })
            if (classesResponse.ok) {
              const classesData = await classesResponse.json()
              classes = classesData.data || []
              console.log("Fetched classes:", classes)
            } else {
              console.error("Failed to fetch classes:", classesResponse.statusText)
            }

            // Fetch subjects
            const subjectsResponse = await fetch(`${API_URL}/subjects`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              }
            })
            if (subjectsResponse.ok) {
              const subjectsData = await subjectsResponse.json()
              subjects = subjectsData.data || []
              console.log("Fetched subjects:", subjects)
            } else {
              console.error("Failed to fetch subjects:", subjectsResponse.statusText)
            }
          } catch (err) {
            console.error("Error fetching classes or subjects:", err)
          }

          // Create maps for quick lookup
          const classMap = new Map()
          const subjectMap = new Map()

          // Add class mappings
          if (classes && classes.length > 0) {
            classes.forEach((c: any) => {
              if (c && c._id) {
                classMap.set(c._id, `${c.name}-${c.section}`)
              }
            })
          }

          // Add subject mappings
          if (subjects && subjects.length > 0) {
            subjects.forEach((s: any) => {
              if (s && s._id) {
                subjectMap.set(s._id, s.name)
              }
            })
          }

          console.log("Class map size:", classMap.size)
          console.log("Subject map size:", subjectMap.size)

          // Process records to replace IDs with names
          const processedRecords = response.data.processedData.records.map((record: any) => {
            const newRecord = { ...record }

            // Log the record for debugging
            console.log("Processing record:", newRecord)

            // Replace class ID with class name if it exists and is an ID
            if (newRecord.class && typeof newRecord.class === 'string' && newRecord.class.match(/^[0-9a-fA-F]{24}$/)) {
              const className = classMap.get(newRecord.class)
              console.log(`Mapping class ID ${newRecord.class} to ${className || 'not found'}`)
              newRecord.class = className || newRecord.class
            }

            // Replace subject ID with subject name if it exists and is an ID
            if (newRecord.subject && typeof newRecord.subject === 'string' && newRecord.subject.match(/^[0-9a-fA-F]{24}$/)) {
              const subjectName = subjectMap.get(newRecord.subject)
              console.log(`Mapping subject ID ${newRecord.subject} to ${subjectName || 'not found'}`)
              newRecord.subject = subjectName || newRecord.subject
            }

            // Also check for classes array (for teachers)
            if (newRecord.classes && Array.isArray(newRecord.classes)) {
              newRecord.classes = newRecord.classes.map((classId: string) => {
                if (typeof classId === 'string' && classId.match(/^[0-9a-fA-F]{24}$/)) {
                  return classMap.get(classId) || classId
                }
                return classId
              }).join(', ')
            }

            return newRecord
          })

          setRecords(processedRecords)
          setFilteredRecords(processedRecords)
        }
      } catch (error) {
        console.error("Error fetching bulk upload details:", error)
        toast.error("Failed to fetch bulk upload details")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBulkUploadDetails()
    }
  }, [params.id])

  useEffect(() => {
    if (records.length > 0 && searchTerm) {
      const filtered = records.filter((record) => {
        return Object.values(record).some((value) =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(records)
    }
  }, [searchTerm, records])

  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    }
  }

  const getColumnHeaders = () => {
    if (!filteredRecords.length) return []

    // Get all unique keys from all records
    const allKeys = new Set<string>()
    filteredRecords.forEach(record => {
      Object.keys(record).forEach(key => {
        // Exclude status, errors, password, className, and section fields
        if (key !== 'status' &&
            key !== 'errors' &&
            key !== 'password' &&
            key !== 'className' &&
            key !== 'section') {
          allKeys.add(key)
        }
      })
    })

    return Array.from(allKeys)
  }

  const goBack = () => {
    router.back()
  }

  // Extract role from the URL path
  const role = params.role as "principal" | "teacher" | "student" | "admin";

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={role}>
      <div className="container mx-auto py-4">
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bulk Uploads
        </Button>

        {bulkUpload ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Bulk Upload Details</CardTitle>
                <CardDescription>
                  View details and records for this bulk upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">File Name</h3>
                    <p className="mt-1">{bulkUpload.originalName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Upload Type</h3>
                    <p className="mt-1 capitalize">{bulkUpload.uploadType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
                    <p className="mt-1">{new Date(bulkUpload.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge className={
                      bulkUpload.status === "completed"
                        ? "bg-green-500 mt-1"
                        : bulkUpload.status === "processing"
                          ? "bg-yellow-500 mt-1"
                          : "bg-red-500 mt-1"
                    }>
                      {bulkUpload.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
                    <p className="mt-1">{bulkUpload.totalRecords}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                    <p className="mt-1">{bulkUpload.successCount} / {bulkUpload.totalRecords} ({Math.round((bulkUpload.successCount / bulkUpload.totalRecords) * 100)}%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Uploaded Records</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search records..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <CardDescription>
                  {filteredRecords.length} records found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRecords.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            {getColumnHeaders().map((header) => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {getStatusBadge(record.status || 'success')}
                              </TableCell>
                              {getColumnHeaders().map((header) => (
                                <TableCell key={header}>
                                  {record[header] !== undefined ?
                                    // If the field is a password field (for extra safety), display asterisks
                                    header.toLowerCase().includes('password') ?
                                    '********' : String(record[header])
                                    : '-'}
                                </TableCell>
                              ))}
                              <TableCell>
                                {record.errors ? record.errors.join(', ') : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Records Found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm ? "Try adjusting your search term" : "This upload doesn't have any processed records"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Bulk Upload Not Found</h3>
            <p className="text-sm text-gray-500 mt-1">
              The requested bulk upload could not be found
            </p>
            <Button variant="outline" onClick={goBack} className="mt-4">
              Go Back
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
