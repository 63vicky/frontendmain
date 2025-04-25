"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { FileUp, Download, FileText, CheckCircle, AlertCircle, X, Users, GraduationCap } from "lucide-react"

export default function BulkUpload() {
  const [activeTab, setActiveTab] = useState("students")
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUpload = () => {
    setUploadStatus("uploading")
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploadStatus("success")
          return 100
        }
        return prev + 10
      })
    }, 300)
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>Students Upload</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Teachers Upload</span>
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
                    {uploadStatus === "idle" && (
                      <>
                        <FileUp className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                        <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (.xlsx)</p>
                        <Button
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                          onClick={handleUpload}
                        >
                          Browse Files
                        </Button>
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

                    {uploadStatus === "success" && (
                      <div className="py-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">Upload Successful!</p>
                        <p className="text-sm text-gray-500 mb-4">120 students have been uploaded successfully</p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setUploadStatus("idle")
                              setUploadProgress(0)
                            }}
                          >
                            Upload Another File
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                            onClick={() => {
                              // Navigate to student management
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
                      <Button variant="outline" size="sm" className="bg-white">
                        <Download className="h-4 w-4 mr-2" />
                        Student Template (CSV)
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white">
                        <Download className="h-4 w-4 mr-2" />
                        Student Template (Excel)
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Use the provided templates to format your student data correctly</li>
                      <li>Required fields: Name, Email, Class, Roll Number, Parent Contact</li>
                      <li>Ensure email addresses are unique for each student</li>
                      <li>Class must match one of the existing classes in the system</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                          <div>
                            <p className="font-medium">Class8_Students.xlsx</p>
                            <p className="text-xs text-gray-500">Uploaded on May 1, 2025 • 45 students</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-green-500 mr-2">Processed</Badge>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                          <div>
                            <p className="font-medium">Class7_Students.csv</p>
                            <p className="text-xs text-gray-500">Uploaded on Apr 28, 2025 • 32 students</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-green-500 mr-2">Processed</Badge>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                    <FileUp className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                    <p className="text-lg text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                    <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (.xlsx)</p>
                    <Button
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                      onClick={handleUpload}
                    >
                      Browse Files
                    </Button>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-800 mb-2">Download Templates</h3>
                    <p className="text-sm text-indigo-600 mb-4">
                      Download our template files to ensure your data is formatted correctly
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="bg-white">
                        <Download className="h-4 w-4 mr-2" />
                        Teacher Template (CSV)
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white">
                        <Download className="h-4 w-4 mr-2" />
                        Teacher Template (Excel)
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Use the provided templates to format your teacher data correctly</li>
                      <li>Required fields: Name, Email, Subject, Classes, Phone Number</li>
                      <li>Ensure email addresses are unique for each teacher</li>
                      <li>Subject must match one of the existing subjects in the system</li>
                      <li>Classes should be comma-separated (e.g., "7A, 8B, 9C")</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Uploads</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                          <div>
                            <p className="font-medium">New_Teachers_2025.xlsx</p>
                            <p className="text-xs text-gray-500">Uploaded on Apr 15, 2025 • 12 teachers</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-green-500 mr-2">Processed</Badge>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
