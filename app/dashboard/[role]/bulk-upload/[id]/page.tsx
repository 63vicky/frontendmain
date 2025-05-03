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
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Search, Download } from "lucide-react"
import { bulkUploadApi } from "@/lib/api"
import { BulkUpload } from "@/lib/types"

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
          setRecords(response.data.processedData.records)
          setFilteredRecords(response.data.processedData.records)
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
        if (key !== 'status' && key !== 'errors') { // Exclude status and errors as they'll be shown separately
          allKeys.add(key)
        }
      })
    })
    
    return Array.from(allKeys)
  }

  const goBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
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
                                  {record[header] !== undefined ? String(record[header]) : '-'}
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
