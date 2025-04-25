"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import DashboardLayout from "@/components/dashboard-layout"
import { FileUp, FileText, CheckCircle, AlertCircle, X, Upload, File, RefreshCw } from "lucide-react"

export default function TeacherBulkUploadPage() {
  const [activeTab, setActiveTab] = useState("questions")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setUploadStatus("idle")
    setUploadProgress(0)
  }

  const simulateUpload = () => {
    if (!selectedFile) return

    setUploadStatus("uploading")
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 20
        if (newProgress >= 100) {
          clearInterval(interval)
          setUploadStatus("success")
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    setUploadProgress(0)
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
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Questions</CardTitle>
                <CardDescription>Upload multiple questions at once using a CSV or Excel file.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class7">Class 7</SelectItem>
                        <SelectItem value="class8">Class 8</SelectItem>
                        <SelectItem value="class9">Class 9</SelectItem>
                        <SelectItem value="class10">Class 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                      <p className="text-sm text-muted-foreground mb-4">
                        Supports CSV, Excel (.xlsx), or our template format
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
                        <Button variant="outline">Download Template</Button>
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
                    <Button>View Uploaded Questions</Button>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: 1,
                        fileName: "math_questions_class8.xlsx",
                        date: "Apr 22, 2025",
                        subject: "Mathematics",
                        class: "Class 8",
                        questions: 45,
                        status: "Completed",
                      },
                      {
                        id: 2,
                        fileName: "science_questions_class9.csv",
                        date: "Apr 18, 2025",
                        subject: "Science",
                        class: "Class 9",
                        questions: 32,
                        status: "Completed",
                      },
                      {
                        id: 3,
                        fileName: "english_grammar_class7.xlsx",
                        date: "Apr 15, 2025",
                        subject: "English",
                        class: "Class 7",
                        questions: 28,
                        status: "Completed",
                      },
                    ].map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell className="font-medium">{upload.fileName}</TableCell>
                        <TableCell>{upload.date}</TableCell>
                        <TableCell>{upload.subject}</TableCell>
                        <TableCell>{upload.class}</TableCell>
                        <TableCell>{upload.questions}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            {upload.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Student Data</CardTitle>
                <CardDescription>Upload student information, class assignments, and other data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-type">Data Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student-info">Student Information</SelectItem>
                        <SelectItem value="class-assignment">Class Assignment</SelectItem>
                        <SelectItem value="attendance">Attendance Records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class7">Class 7</SelectItem>
                        <SelectItem value="class8">Class 8</SelectItem>
                        <SelectItem value="class9">Class 9</SelectItem>
                        <SelectItem value="class10">Class 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  <FileUp className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Drag and drop your file here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports CSV, Excel (.xlsx), or our template format
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">Browse Files</Button>
                    <Button variant="outline">Download Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Exam Results</CardTitle>
                <CardDescription>Upload exam results for multiple students at once.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math-final">Mathematics Final Exam</SelectItem>
                        <SelectItem value="science-midterm">Science Midterm</SelectItem>
                        <SelectItem value="english-quiz">English Grammar Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class7">Class 7</SelectItem>
                        <SelectItem value="class8">Class 8</SelectItem>
                        <SelectItem value="class9">Class 9</SelectItem>
                        <SelectItem value="class10">Class 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Exam Date</Label>
                    <Input type="date" id="date" />
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  <FileUp className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Drag and drop your file here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports CSV, Excel (.xlsx), or our template format
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">Browse Files</Button>
                    <Button variant="outline">Download Template</Button>
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
