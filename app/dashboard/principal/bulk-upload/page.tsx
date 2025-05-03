"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { FileUp, Download, FileText, CheckCircle, AlertCircle, X, Users, GraduationCap } from "lucide-react"
import { bulkUploadApi } from "@/lib/api"
import { BulkUpload } from "@/lib/types"

export default function BulkUpload() {
  const [activeTab, setActiveTab] = useState("students")
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [recentUploads, setRecentUploads] = useState<BulkUpload[]>([])
  const [uploadResult, setUploadResult] = useState<{
    totalRecords: number;
    successCount: number;
    failureCount: number;
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch recent uploads on component mount
  useEffect(() => {
    if (activeTab === "students") {
      fetchRecentUploads("students")
    } else if (activeTab === "teachers") {
      fetchRecentUploads("teachers")
    } else if (activeTab === "results") {
      fetchRecentUploads("results")
    }
  }, [activeTab])

  const fetchRecentUploads = async (type: string) => {
    try {
      const response = await bulkUploadApi.getAllUploads(type)
      setRecentUploads(response.data.slice(0, 5)) // Get the 5 most recent uploads
    } catch (error) {
      console.error("Error fetching recent uploads:", error)
      toast.error("Failed to fetch recent uploads")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    // Validate file type
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
        toast.error("Please select a CSV or Excel file")
        return
      }
    }

    setSelectedFile(file)
    setUploadStatus("idle")
    setUploadProgress(0)
  }

  const handleResultsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    // Validate file type
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
        toast.error("Please select a CSV or Excel file")
        return
      }
    }

    setSelectedFile(file)
    setUploadStatus("idle")
    setUploadProgress(0)
  }

  const handleBrowseClick = (tab?: string) => {
    if (tab === "results") {
      resultsFileInputRef.current?.click()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    setUploadStatus("uploading")
    setUploadProgress(0)

    // Create form data
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      // Start progress simulation
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return 90 // Cap at 90% until actual completion
          }
          return prev + 5
        })
      }, 300)

      // Make API call based on active tab
      let response
      if (activeTab === "students") {
        response = await bulkUploadApi.uploadStudents(formData)
      } else if (activeTab === "teachers") {
        response = await bulkUploadApi.uploadTeachers(formData)
      } else if (activeTab === "results") {
        // For now, we'll use the student upload endpoint
        // In a real implementation, you would have a dedicated endpoint for results
        response = await bulkUploadApi.uploadStudents(formData)
      }

      // Clear interval and set to 100%
      clearInterval(interval)
      setUploadProgress(100)
      setUploadStatus("success")

      // Store upload result
      setUploadResult({
        totalRecords: response.data.totalRecords,
        successCount: response.data.successCount,
        failureCount: response.data.failureCount
      })

      // Refresh recent uploads
      fetchRecentUploads(activeTab)

      if (activeTab === "students") {
        toast.success("Students uploaded successfully")
      } else if (activeTab === "teachers") {
        toast.success("Teachers uploaded successfully")
      } else if (activeTab === "results") {
        toast.success("Results uploaded successfully")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      toast.error(error instanceof Error ? error.message : "Upload failed")
    }
  }

  const handleDownloadTemplate = () => {
    if (activeTab === "students") {
      // Generate and download student template
      const csvContent = generateSampleCSV("students")
      downloadCSV(csvContent, "student_template.csv")
    } else if (activeTab === "teachers") {
      // Generate and download teacher template
      const csvContent = generateSampleCSV("teachers")
      downloadCSV(csvContent, "teacher_template.csv")
    } else if (activeTab === "results") {
      // Generate and download results template
      const csvContent = generateSampleCSV("results")
      downloadCSV(csvContent, "results_template.csv")
    }
  }

  const generateSampleCSV = (type: string) => {
    let headers: string[] = []
    let sampleData: string[][] = []

    if (type === "students") {
      // Note: Passwords will be hashed on the server side during import
      headers = ["name", "email", "password", "class", "section", "rollNo", "status"]
      sampleData = [
        ["John Doe", "john.doe@example.com", "password123", "10", "A", "10001", "active"],
        ["Jane Smith", "jane.smith@example.com", "password123", "9", "B", "9002", "active"],
        ["Sam Wilson", "sam.wilson@example.com", "password123", "8", "C", "8003", "active"]
      ]
    } else if (type === "teachers") {
      // Note: Passwords will be hashed on the server side during import
      headers = ["name", "email", "password", "subject", "classes", "status"]
      sampleData = [
        ["John Smith", "john.smith@example.com", "password123", "Mathematics", "10A,9B", "active"],
        ["Mary Johnson", "mary.johnson@example.com", "password123", "Science", "8A,8B,9A", "active"],
        ["Robert Brown", "robert.brown@example.com", "password123", "English", "7A,7B", "active"]
      ]
    } else if (type === "results") {
      headers = ["studentEmail", "examId", "score", "startTime", "endTime", "status"]
      sampleData = [
        ["john.doe@example.com", "exam123", "85", "2023-05-10T09:00:00", "2023-05-10T10:30:00", "completed"],
        ["jane.smith@example.com", "exam123", "92", "2023-05-10T09:15:00", "2023-05-10T10:45:00", "completed"],
        ["sam.wilson@example.com", "exam123", "78", "2023-05-10T09:30:00", "2023-05-10T11:00:00", "completed"]
      ]
    }

    // Helper function to escape CSV values
    const escapeCSV = (value: string) => {
      // If the value contains commas, quotes, or newlines, wrap it in quotes
      if (/[",\n\r]/.test(value)) {
        // Double up any quotes within the value
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    // Create CSV content
    let csvContent = headers.join(",") + "\n"
    sampleData.forEach(row => {
      csvContent += row.map(escapeCSV).join(",") + "\n"
    })

    return csvContent
  }

  const downloadCSV = (csvContent: string, fileName: string) => {
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bulk Upload</h1>
            <p className="text-muted-foreground">Upload students and teachers in bulk</p>
          </div>
        </div>

        <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>Students Upload</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Teachers Upload</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Results Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Upload Students</CardTitle>
                <CardDescription>Upload multiple students at once using CSV or Excel files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {/* Hidden file input */}
                    <Input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />

                    {uploadStatus === "idle" && (
                      <>
                        <FileUp className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          {selectedFile ? selectedFile.name : "Drag and drop your file here, or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (.xlsx)</p>
                        {selectedFile ? (
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedFile(null)
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ""
                                }
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                              onClick={handleUpload}
                            >
                              Upload File
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={handleBrowseClick}
                          >
                            Browse Files
                          </Button>
                        )}
                      </>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="py-4">
                        <FileText className="h-12 w-12 mx-auto text-indigo-400 mb-4 animate-pulse" />
                        <p className="text-lg text-gray-600 mb-2">Uploading students...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 max-w-md mx-auto">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                      </div>
                    )}

                    {uploadStatus === "success" && uploadResult && (
                      <div className="py-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Successful!</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {uploadResult.successCount} of {uploadResult.totalRecords} students have been uploaded successfully
                          {uploadResult.failureCount > 0 && ` (${uploadResult.failureCount} failed)`}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setUploadStatus("idle")
                              setUploadProgress(0)
                              setSelectedFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                          >
                            Upload Another File
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={() => {
                              window.location.href = "/dashboard/principal?tab=students"
                            }}
                          >
                            View Students
                          </Button>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="py-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Failed</p>
                        <p className="text-sm text-red-500 mb-4">
                          There was an error uploading your file. Please check the format and try again.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadStatus("idle")
                            setUploadProgress(0)
                            setSelectedFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""
                            }
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-800 mb-2">Download Templates</h3>
                    <p className="text-sm text-indigo-600 mb-4">
                      Download our template files to ensure your data is formatted correctly
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Student Template with Class & Section
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Use the provided templates to format your student data correctly</li>
                      <li>Required fields: Name, Email, Password, Class, Section, Roll Number, Status</li>
                      <li>Ensure email addresses are unique for each student</li>
                      <li>Class and Section must match existing classes in the system</li>
                      <li>Passwords will be automatically hashed for security</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      {recentUploads.length > 0 ? (
                        recentUploads.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                              <div>
                                <p className="font-medium">{upload.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded on {new Date(upload.createdAt).toLocaleDateString()} •
                                  {upload.successCount} {activeTab === "students" ? "students" : "teachers"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge className={
                                upload.status === "completed"
                                  ? "bg-green-500 mr-2"
                                  : upload.status === "processing"
                                    ? "bg-yellow-500 mr-2"
                                    : "bg-red-500 mr-2"
                              }>
                                {upload.status === "completed"
                                  ? "Processed"
                                  : upload.status === "processing"
                                    ? "Processing"
                                    : "Failed"}
                              </Badge>
                              {upload.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `/dashboard/principal/bulk-upload/${upload._id}`}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No recent uploads found</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Upload Teachers</CardTitle>
                <CardDescription>Upload multiple teachers at once using CSV or Excel files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {/* Hidden file input - reusing the same ref */}
                    <Input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />

                    {uploadStatus === "idle" && (
                      <>
                        <FileUp className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          {selectedFile ? selectedFile.name : "Drag and drop your file here, or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (.xlsx)</p>
                        {selectedFile ? (
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedFile(null)
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ""
                                }
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                              onClick={handleUpload}
                            >
                              Upload File
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={handleBrowseClick}
                          >
                            Browse Files
                          </Button>
                        )}
                      </>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="py-4">
                        <FileText className="h-12 w-12 mx-auto text-indigo-400 mb-4 animate-pulse" />
                        <p className="text-lg text-gray-600 mb-2">Uploading teachers...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 max-w-md mx-auto">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                      </div>
                    )}

                    {uploadStatus === "success" && uploadResult && (
                      <div className="py-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Successful!</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {uploadResult.successCount} of {uploadResult.totalRecords} teachers have been uploaded successfully
                          {uploadResult.failureCount > 0 && ` (${uploadResult.failureCount} failed)`}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setUploadStatus("idle")
                              setUploadProgress(0)
                              setSelectedFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                          >
                            Upload Another File
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={() => {
                              window.location.href = "/dashboard/principal?tab=teachers"
                            }}
                          >
                            View Teachers
                          </Button>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="py-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Failed</p>
                        <p className="text-sm text-red-500 mb-4">
                          There was an error uploading your file. Please check the format and try again.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadStatus("idle")
                            setUploadProgress(0)
                            setSelectedFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""
                            }
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-800 mb-2">Download Templates</h3>
                    <p className="text-sm text-indigo-600 mb-4">
                      Download our template files to ensure your data is formatted correctly
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Teacher Template with Classes
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Use the provided templates to format your teacher data correctly</li>
                      <li>Required fields: Name, Email, Password, Subject, Classes, Status</li>
                      <li>Ensure email addresses are unique for each teacher</li>
                      <li>Subject must match one of the existing subjects in the system</li>
                      <li>Classes should be comma-separated (e.g., "7A,8B,9C")</li>
                      <li>Passwords will be automatically hashed for security</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      {recentUploads.length > 0 ? (
                        recentUploads.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                              <div>
                                <p className="font-medium">{upload.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded on {new Date(upload.createdAt).toLocaleDateString()} •
                                  {upload.successCount} {activeTab === "students" ? "students" : "teachers"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge className={
                                upload.status === "completed"
                                  ? "bg-green-500 mr-2"
                                  : upload.status === "processing"
                                    ? "bg-yellow-500 mr-2"
                                    : "bg-red-500 mr-2"
                              }>
                                {upload.status === "completed"
                                  ? "Processed"
                                  : upload.status === "processing"
                                    ? "Processing"
                                    : "Failed"}
                              </Badge>
                              {upload.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `/dashboard/principal/bulk-upload/${upload._id}`}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No recent uploads found</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Upload Exam Results</CardTitle>
                <CardDescription>Upload exam results in bulk using CSV or Excel files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {/* Hidden file input */}
                    <Input
                      type="file"
                      ref={resultsFileInputRef}
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleResultsFileChange}
                    />

                    {uploadStatus === "idle" && (
                      <>
                        <FileUp className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          {selectedFile ? selectedFile.name : "Drag and drop your file here, or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (.xlsx)</p>
                        {selectedFile ? (
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedFile(null)
                                if (resultsFileInputRef.current) {
                                  resultsFileInputRef.current.value = ""
                                }
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                              onClick={handleUpload}
                            >
                              Upload File
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={() => handleBrowseClick("results")}
                          >
                            Browse Files
                          </Button>
                        )}
                      </>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="py-4">
                        <FileText className="h-12 w-12 mx-auto text-indigo-400 mb-4 animate-pulse" />
                        <p className="text-lg text-gray-600 mb-2">Uploading results...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 max-w-md mx-auto">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                      </div>
                    )}

                    {uploadStatus === "success" && uploadResult && (
                      <div className="py-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Successful!</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {uploadResult.successCount} of {uploadResult.totalRecords} results have been uploaded successfully
                          {uploadResult.failureCount > 0 && ` (${uploadResult.failureCount} failed)`}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setUploadStatus("idle")
                              setUploadProgress(0)
                              setSelectedFile(null)
                              if (resultsFileInputRef.current) {
                                resultsFileInputRef.current.value = ""
                              }
                            }}
                          >
                            Upload Another File
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={() => {
                              window.location.href = "/dashboard/principal/results"
                            }}
                          >
                            View Results
                          </Button>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="py-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Failed</p>
                        <p className="text-sm text-red-500 mb-4">
                          There was an error uploading your file. Please check the format and try again.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadStatus("idle")
                            setUploadProgress(0)
                            setSelectedFile(null)
                            if (resultsFileInputRef.current) {
                              resultsFileInputRef.current.value = ""
                            }
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-800 mb-2">Download Templates</h3>
                    <p className="text-sm text-indigo-600 mb-4">
                      Download our template files to ensure your data is formatted correctly
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Results Template (Excel)
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Use the provided templates to format your exam results data correctly</li>
                      <li>Required fields: Student Email, Exam ID, Score, Start Time, End Time, Status</li>
                      <li>Ensure student emails match existing students in the system</li>
                      <li>Exam ID must match an existing exam in the system</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      {recentUploads.length > 0 ? (
                        recentUploads.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                              <div>
                                <p className="font-medium">{upload.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded on {new Date(upload.createdAt).toLocaleDateString()} •
                                  {upload.successCount} results
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge className={
                                upload.status === "completed"
                                  ? "bg-green-500 mr-2"
                                  : upload.status === "processing"
                                    ? "bg-yellow-500 mr-2"
                                    : "bg-red-500 mr-2"
                              }>
                                {upload.status === "completed"
                                  ? "Processed"
                                  : upload.status === "processing"
                                    ? "Processing"
                                    : "Failed"}
                              </Badge>
                              {upload.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `/dashboard/principal/bulk-upload/${upload._id}`}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No recent uploads found</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
