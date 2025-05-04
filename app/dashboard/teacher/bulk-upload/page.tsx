"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { FileUp, FileText, CheckCircle, AlertCircle, X, Upload, File, RefreshCw, Download } from "lucide-react"
import { bulkUploadApi } from "@/lib/api"
import { BulkUpload } from "@/lib/types"

export default function TeacherBulkUploadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("questions")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [recentUploads, setRecentUploads] = useState<BulkUpload[]>([])
  const [uploadFilter, setUploadFilter] = useState<string>("all")
  const [uploadResult, setUploadResult] = useState<{
    totalRecords: number;
    successCount: number;
    failureCount: number;
  } | null>(null)
  // Removed class and subject selectors

  // Fetch all uploads when component mounts
  useEffect(() => {
    fetchRecentUploads("all")
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const studentFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch recent uploads on component mount or when tab/filter changes
  useEffect(() => {
    if (activeTab === "students") {
      fetchRecentUploads("students")
    } else if (activeTab === "questions") {
      fetchRecentUploads("questions")
    } else if (activeTab === "teachers") {
      fetchRecentUploads("teachers")
    } else if (activeTab === "uploads") {
      fetchRecentUploads(uploadFilter)
    }
  }, [activeTab, uploadFilter])

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
    setSelectedFile(file)
    setUploadStatus("idle")
    setUploadProgress(0)
  }

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Teacher file change handler removed - teachers can't add other teachers

  const handleBrowseClick = (tab: string) => {
    if (tab === "students") {
      studentFileInputRef.current?.click()
    } else if (tab === "questions") {
      fileInputRef.current?.click()
    }
  }

  const simulateUpload = () => {
    // Instead of simulating, let's use the real upload function
    handleUpload();
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
      let response;
      if (activeTab === "students") {
        response = await bulkUploadApi.uploadStudents(formData);
      // Teacher upload removed - teachers can't add other teachers
      } else if (activeTab === "questions") {
        response = await bulkUploadApi.uploadQuestions(formData);
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

      // Show success message based on active tab
      if (activeTab === "students") {
        toast.success("Students uploaded successfully");
      } else if (activeTab === "questions") {
        toast.success("Questions uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")

      // Try to extract more detailed error message
      let errorMessage = "Upload failed"

      if (error instanceof Error) {
        errorMessage = error.message
      }

      // Try to extract API error response
      if (error instanceof Response) {
        try {
          const data = await error.json()
          errorMessage = data.message || data.error || errorMessage
        } catch (e) {
          console.error("Error parsing error response:", e)
        }
      }

      toast.error(errorMessage)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    setUploadProgress(0)
  }

  // Sample CSV generation function removed as we now use API endpoints for templates

  const handleDownloadTemplate = () => {
    if (activeTab === "students") {
      bulkUploadApi.downloadStudentTemplate();
    // Teacher template removed - teachers can't add other teachers
    } else if (activeTab === "questions") {
      bulkUploadApi.downloadQuestionTemplate();
    }
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">Bulk Upload</h1>
            <p className="text-muted-foreground">Upload multiple questions, student data, or results at once</p>
          </div>
        </div>

        <Tabs defaultValue="questions" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Questions</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Student Data</span>
            </TabsTrigger>
            <TabsTrigger value="uploads" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>View Uploads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Questions</CardTitle>
                <CardDescription>Upload multiple questions at once using a CSV or Excel file.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Removed class and subject selectors */}

                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  {selectedFile && uploadStatus !== "idle" ? (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={resetUpload}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {uploadStatus === "uploading"
                            ? `Uploading... ${Math.round(uploadProgress)}%`
                            : uploadStatus === "success"
                              ? "Upload complete!"
                              : "Upload failed"}
                        </p>
                        {uploadStatus === "success" && (
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                        )}
                        {uploadStatus === "error" && <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />}
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileUp className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">Drag and drop your file here</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Supports CSV, Excel (.xlsx), or our template format
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        The template includes separate columns for Class and Section for better organization.
                      </p>
                      <div className="flex gap-4">
                        <Button variant="outline" asChild>
                          <label className="cursor-pointer">
                            <Input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            Browse Files
                          </label>
                        </Button>
                        <Button variant="outline" onClick={handleDownloadTemplate}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {selectedFile && uploadStatus === "idle" && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetUpload}>
                      Cancel
                    </Button>
                    <Button onClick={simulateUpload}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetUpload}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Upload Another
                    </Button>
                    <Button onClick={() => router.push("/dashboard/teacher/questions")}>
                      View Uploaded Questions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>Recent question uploads and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {recentUploads.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
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
                                onClick={() => {
                                  router.push(`/dashboard/teacher/bulk-upload/${upload._id}`);
                                }}
                              >
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No upload history found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Student Data</CardTitle>
                <CardDescription>Upload student information, class assignments, and other data. Passwords will be securely hashed during import.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">


                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  {/* Hidden file input */}
                  <Input
                    type="file"
                    ref={studentFileInputRef}
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleStudentFileChange}
                  />

                  {uploadStatus === "idle" && (
                    <>
                      <FileUp className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">
                        {selectedFile ? selectedFile.name : "Drag and drop your file here"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Supports CSV, Excel (.xlsx), or our template format
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        The template includes separate columns for Class and Section. Passwords will be automatically hashed for security.
                        Make sure the Class and Section values match existing classes in the system.
                      </p>
                      {selectedFile ? (
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedFile(null)
                              if (studentFileInputRef.current) {
                                studentFileInputRef.current.value = ""
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpload}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={() => handleBrowseClick("students")}
                          >
                            Browse Files
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {uploadStatus === "uploading" && (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                          <div>
                            <p className="font-medium">{selectedFile?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedFile && (selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}

                  {uploadStatus === "success" && uploadResult && (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
                      </div>
                      <h3 className="text-lg font-medium text-center">Upload Successful!</h3>
                      <p className="text-sm text-muted-foreground text-center">
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
                            if (studentFileInputRef.current) {
                              studentFileInputRef.current.value = ""
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Upload Another
                        </Button>
                        <Button
                          onClick={() => {
                            setActiveTab("uploads")
                            setUploadFilter("students")
                            fetchRecentUploads("students")
                          }}
                        >
                          View Uploaded Students
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
                      </div>
                      <h3 className="text-lg font-medium text-center">Upload Failed</h3>
                      <p className="text-sm text-red-500 dark:text-red-400 text-center">
                        There was an error uploading your file. Please check the format and try again.
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadStatus("idle")
                            setUploadProgress(0)
                            setSelectedFile(null)
                            if (studentFileInputRef.current) {
                              studentFileInputRef.current.value = ""
                            }
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent uploads */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Recent Uploads</h3>
                  {recentUploads.length > 0 ? (
                    <div className="space-y-2">
                      {recentUploads.map((upload) => (
                        <div key={upload._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                            <div>
                              <p className="font-medium">{upload.originalName}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded on {new Date(upload.createdAt).toLocaleDateString()} •
                                {upload.successCount} students
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            upload.status === "completed"
                              ? "bg-green-500"
                              : upload.status === "processing"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }>
                            {upload.status === "completed"
                              ? "Processed"
                              : upload.status === "processing"
                                ? "Processing"
                                : "Failed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent uploads found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher upload tab removed - teachers can't add other teachers */}



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
                              <TableCell>{upload.uploadType}</TableCell>
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
                                    onClick={() => {
                                      // Use router.push instead of window.location to ensure proper navigation
                                      router.push(`/dashboard/teacher/bulk-upload/${upload._id}`);
                                    }}
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
