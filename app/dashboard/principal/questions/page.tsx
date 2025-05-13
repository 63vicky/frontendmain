"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api, getSubjects } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Eye, Download, Loader2, Plus, FileUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Question {
  _id: string
  text: string
  type: "multiple-choice" | "short-answer" | "descriptive"
  subject: string
  className: string
  chapter?: string
  difficulty: "Easy" | "Medium" | "Hard"
  options?: string[]
  correctAnswer: string | string[]
  points: number
  time: number
  tags?: string[]
  status: "Active" | "Inactive"
  createdAt: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
}

export default function PrincipalQuestionBank() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedTeacher, setSelectedTeacher] = useState("all")
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [teachers, setTeachers] = useState<{id: string, name: string}[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [viewQuestionData, setViewQuestionData] = useState<Question | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [selectedSubject, selectedClass, selectedType, selectedDifficulty, selectedTeacher])

  useEffect(() => {
    if (searchTerm) {
      const filtered = questions.filter(
        (q) =>
          q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (q.chapter && q.chapter.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredQuestions(filtered)
    } else {
      setFilteredQuestions(questions)
    }
  }, [searchTerm, questions])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [questionsRes, subjectsRes, classesRes] = await Promise.all([
        api.questions.getAll({
          subject: selectedSubject !== "all" ? selectedSubject : undefined,
          className: selectedClass !== "all" ? selectedClass : undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
          search: searchTerm || undefined,
          teacherId: selectedTeacher !== "all" ? selectedTeacher : undefined,
        }),
        api.questions.getSubjects(),
        api.questions.getClasses(),
      ]);

      // Fetch teachers separately to better handle any issues
      let teachersRes;
      try {
        // Try using the users API first (more reliable)
        teachersRes = await api.users.getAllTeachers();
      } catch (teacherError) {
        console.error('Error fetching teachers with users API:', teacherError);
        try {
          // Fallback to the teachers API
          teachersRes = await api.teachers.getAll();
        } catch (fallbackError) {
          console.error('Error fetching teachers with fallback API:', fallbackError);
          teachersRes = [];
        }
      }

      setQuestions(questionsRes.data || [])
      setFilteredQuestions(questionsRes.data || [])
      setSubjects(subjectsRes.data || [])
      setClasses(classesRes.data || [])

      // Extract teacher information from the response
      try {
        // Check if teachersRes is an array or has a data property
        const teachersData = Array.isArray(teachersRes) ? teachersRes : (teachersRes.data || []);

        if (!teachersData || !Array.isArray(teachersData)) {
          console.error('Teachers data is not an array:', teachersData);
          setTeachers([]);
        } else {
          const teachersList = teachersData.map((teacher: any) => ({
            id: teacher._id || teacher.id,
            name: teacher.name
          }));
          setTeachers(teachersList);
        }
      } catch (teacherError) {
        console.error('Error processing teachers data:', teacherError);
        setTeachers([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch questions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedQuestions(filteredQuestions.map((q) => q._id))
    } else {
      setSelectedQuestions([])
    }
  }

  const handleSelectQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((qId) => qId !== id))
    } else {
      setSelectedQuestions([...selectedQuestions, id])
    }
  }

  const handleViewQuestion = (question: Question) => {
    setViewQuestionData(question)
    setShowViewDialog(true)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice"
      case "short-answer":
        return "Short Answer"
      case "descriptive":
        return "Descriptive"
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">View all questions created by teachers</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              onClick={() => router.push('/dashboard/principal/questions/add')}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Question</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push('/dashboard/principal/bulk-upload?tab=questions')}
            >
              <FileUp className="h-4 w-4" />
              <span>Bulk Upload</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

           

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers && teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-teachers" disabled>No teachers available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all questions" />
                  </TableHead>
                  <TableHead className="w-[40%]">Question</TableHead>
                  <TableHead>Subject</TableHead>
                  
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg font-medium">No questions found</p>
                        <p className="text-muted-foreground">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question._id)}
                          onCheckedChange={() => handleSelectQuestion(question._id)}
                          aria-label={`Select question ${question.text}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="line-clamp-2">{question.text}</div>
                      </TableCell>
                      <TableCell>{question.subject}</TableCell>
                      
                      <TableCell>{getTypeLabel(question.type)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            question.difficulty === "Easy"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : question.difficulty === "Medium"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.createdBy?.name || "Unknown"}</TableCell>
                      <TableCell>{formatDate(question.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewQuestion(question)}
                          aria-label={`View question ${question.text}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Question Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>View the complete details of this question</DialogDescription>
          </DialogHeader>
          {viewQuestionData && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md">{viewQuestionData.text}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">{viewQuestionData.subject}</div>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">{viewQuestionData.className}</div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">{getTypeLabel(viewQuestionData.type)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">{viewQuestionData.difficulty}</div>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">{viewQuestionData.points}</div>
                </div>
                <div className="space-y-2">
                  <Label>Time (seconds)</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">{viewQuestionData.time}</div>
                </div>
              </div>
              {viewQuestionData.type === "multiple-choice" && viewQuestionData.options && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {viewQuestionData.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md ${
                          Array.isArray(viewQuestionData.correctAnswer)
                            ? viewQuestionData.correctAnswer.includes(option)
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-slate-50 dark:bg-slate-900"
                            : viewQuestionData.correctAnswer === option
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                            : "bg-slate-50 dark:bg-slate-900"
                        }`}
                      >
                        {option}
                        {Array.isArray(viewQuestionData.correctAnswer)
                          ? viewQuestionData.correctAnswer.includes(option) && " (Correct)"
                          : viewQuestionData.correctAnswer === option && " (Correct)"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(viewQuestionData.type === "short-answer" || viewQuestionData.type === "descriptive") && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    {typeof viewQuestionData.correctAnswer === "string"
                      ? viewQuestionData.correctAnswer
                      : viewQuestionData.correctAnswer.join(", ")}
                  </div>
                </div>
              )}
              {viewQuestionData.tags && viewQuestionData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {viewQuestionData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Created By</Label>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                  {viewQuestionData.createdBy?.name || "Unknown"} ({viewQuestionData.createdBy?.email || ""})
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
