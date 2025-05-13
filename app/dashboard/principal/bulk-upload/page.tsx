"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { FileUp, Download, FileText, CheckCircle, AlertCircle, Users, RefreshCw } from "lucide-react"
import { bulkUploadApi } from "@/lib/api"
import type { BulkUpload } from "@/lib/types"

export default function BulkUpload() {
  // Get the tab from URL if available
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'questions' ? 'questions' : 'teachers';

  const [activeTab, setActiveTab] = useState(initialTab)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [recentUploads, setRecentUploads] = useState<BulkUpload[]>([])
  const [uploadFilter, setUploadFilter] = useState<string>("all")
  const [uploadResult, setUploadResult] = useState<{
    totalRecords: number;
    successCount: number;
    failureCount: number;
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const questionFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch recent uploads on component mount
  useEffect(() => {
    if (activeTab === "teachers") {
      fetchRecentUploads("teachers")
    } else if (activeTab === "questions") {
      fetchRecentUploads("questions")
    } else if (activeTab === "uploads") {
      fetchRecentUploads(uploadFilter)
    }
  }, [activeTab, uploadFilter])

  // Run once on component mount to handle initial tab
  useEffect(() => {
    if (initialTab === "questions") {
      fetchRecentUploads("questions")
    } else {
      fetchRecentUploads("teachers")
    }
  }, [])

  const fetchRecentUploads = async (type: string) => {
    try {
      const response = await bulkUploadApi.getAllUploads(type)

      // When on the uploads tab, get all uploads, otherwise just get the 5 most recent
      if (activeTab === "uploads") {
        setRecentUploads(response.data)
      } else {
        setRecentUploads(response.data.slice(0, 5)) // Get the 5 most recent uploads
      }
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

  const handleBrowseClick = () => {
    if (activeTab === "teachers") {
      fileInputRef.current?.click()
    } else if (activeTab === "questions") {
      questionFileInputRef.current?.click()
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

      let response;

      // Make API call based on active tab
      if (activeTab === "teachers") {
        response = await bulkUploadApi.uploadTeachers(formData)
        toast.success("Teachers uploaded successfully")
      } else if (activeTab === "questions") {
        response = await bulkUploadApi.uploadQuestions(formData)
        toast.success("Questions uploaded successfully")
      } else {
        clearInterval(interval)
        setUploadStatus("error")
        toast.error("Invalid upload type")
        return
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
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      toast.error(error instanceof Error ? error.message : "Upload failed")
    }
  }

  const handleDownloadTemplate = () => {
    if (activeTab === "teachers") {
      // Generate and download teacher template
      const csvContent = generateSampleCSV()
      downloadCSV(csvContent, "teacher_template.csv")
    } else if (activeTab === "questions") {
      // Use the API to download question template
      bulkUploadApi.downloadQuestionTemplate()
    }
  }

  const generateSampleCSV = () => {
    let headers: string[] = []
    let sampleData: string[][] = []

    // Note: Passwords will be hashed on the server side during import
    headers = ["name", "email", "password", "subject", "className", "section", "status"]
    sampleData = [
      ["John Smith", "john.smith@example.com", "password123", "Mathematics", "10", "A", "active"],
      ["Mary Johnson", "mary.johnson@example.com", "password123", "Science", "8", "A", "active"],
      ["Robert Brown", "robert.brown@example.com", "password123", "English", "7", "A", "active"]
    ]

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
            <p className="text-muted-foreground">Upload teachers and questions in bulk</p>
          </div>
        </div>

        <Tabs defaultValue={initialTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Teachers Upload</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Questions Upload</span>
            </TabsTrigger>
            <TabsTrigger value="uploads" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>View Uploads</span>
            </TabsTrigger>
          </TabsList>



          <TabsContent value="teachers" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Upload Teachers</CardTitle>
                <CardDescription>Upload multiple teachers at once using CSV or Excel files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {/* Hidden file input for teachers */}
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

                  <div className="bg-primary p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-2">Download Templates</h3>
                    <p className="text-sm text-white mb-4">
                      Download our template files to ensure your data is formatted correctly
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-background text-foreground"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Teacher Template
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
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

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      {recentUploads.length > 0 ? (
                        recentUploads.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-2 hover:bg-background/50 bg-background rounded border">
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

          <TabsContent value="questions" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Upload Questions</CardTitle>
                <CardDescription>Upload multiple questions at once using CSV or Excel files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {/* Hidden file input for questions */}
                    <Input
                      type="file"
                      ref={questionFileInputRef}
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
                                if (questionFileInputRef.current) {
                                  questionFileInputRef.current.value = ""
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
                        <p className="text-lg text-gray-600 mb-2">Uploading questions...</p>
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
                          {uploadResult.successCount} of {uploadResult.totalRecords} questions have been uploaded successfully
                          {uploadResult.failureCount > 0 && ` (${uploadResult.failureCount} failed)`}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setUploadStatus("idle")
                              setUploadProgress(0)
                              setSelectedFile(null)
                              if (questionFileInputRef.current) {
                                questionFileInputRef.current.value = ""
                              }
                            }}
                          >
                            Upload Another File
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={() => {
                              window.location.href = "/dashboard/principal/questions"
                            }}
                          >
                            View Questions
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
                            if (questionFileInputRef.current) {
                              questionFileInputRef.current.value = ""
                            }
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-2">Download Templates</h3>
                    <p className="text-sm text-white mb-4">
                      Download our template files to ensure your data is formatted correctly
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-background text-foreground"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Question Template
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Use the provided template to format your question data correctly</li>
                      <li>Required fields: Text, Type, Subject, Correct Answer</li>
                      <li>Optional fields: Class, Section, Difficulty, Chapter, Tags</li>
                      <li>For multiple-choice questions, provide options separated by pipe (|) character</li>
                      <li>Correct answers for multiple-choice should be the index of the correct option (0-based)</li>
                      <li>Points field determines the score value of each question</li>
                      <li>Time field specifies the recommended time in seconds for answering the question</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      {recentUploads.length > 0 ? (
                        recentUploads.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-2 hover:bg-background/50 bg-background rounded border">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                              <div>
                                <p className="font-medium">{upload.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded on {new Date(upload.createdAt).toLocaleDateString()} •
                                  {upload.successCount} questions
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

          <TabsContent value="uploads" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>View all your previous uploads and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant={uploadFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setUploadFilter("all");
                          fetchRecentUploads("all");
                        }}
                      >
                        All
                      </Button>
                      <Button
                        variant={uploadFilter === "students" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setUploadFilter("students");
                          fetchRecentUploads("students");
                        }}
                      >
                        Students
                      </Button>
                      <Button
                        variant={uploadFilter === "teachers" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setUploadFilter("teachers");
                          fetchRecentUploads("teachers");
                        }}
                      >
                        Teachers
                      </Button>
                      <Button
                        variant={uploadFilter === "questions" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setUploadFilter("questions");
                          fetchRecentUploads("questions");
                        }}
                      >
                        Questions
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Force refresh the data
                        setRecentUploads([]);
                        fetchRecentUploads(uploadFilter);
                        toast.success("Refreshing upload history...");
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {recentUploads.length > 0 ? (
                    <div className="space-y-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Records</TableHead>
                            <TableHead>Success</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentUploads.map((upload) => (
                            <TableRow key={upload._id}>
                              <TableCell className="font-medium">{upload.originalName}</TableCell>
                              <TableCell className="capitalize">{upload.uploadType}</TableCell>
                              <TableCell>{new Date(upload.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{upload.totalRecords}</TableCell>
                              <TableCell>{upload.successCount} / {upload.totalRecords}</TableCell>
                              <TableCell>
                                <Badge className={
                                  upload.status === "completed"
                                    ? "bg-green-500"
                                    : upload.status === "processing"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }>
                                  {upload.status === "completed"
                                    ? "Completed"
                                    : upload.status === "processing"
                                      ? "Processing"
                                      : "Failed"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {upload.status === "completed" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.location.href = `/dashboard/principal/bulk-upload/${upload._id}`}
                                  >
                                    View
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upload history found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
