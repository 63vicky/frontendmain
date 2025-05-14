"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api, getSubjects } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Search, Eye, Download, Loader2, Plus, FileUp, Edit, Trash2 } from "lucide-react"
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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    text: "",
    type: "multiple-choice" as "multiple-choice" | "short-answer" | "descriptive",
    subject: "",
    className: "",
    chapter: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    options: ["", "", "", ""],
    correctAnswer: [] as string[],
    points: 1,
    time: 30,
    tags: [] as string[],
  })
  const [checkedOptions, setCheckedOptions] = useState<boolean[]>([false, false, false, false])
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

  const handleBulkDelete = async () => {
    try {
      setLoading(true)

      // Delete questions one by one to handle potential errors
      const results = await Promise.allSettled(selectedQuestions.map((id) => api.questions.delete(id)))

      // Count successful and failed deletions
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      // Show appropriate toast message
      if (successful > 0 && failed === 0) {
        toast({
          title: "Success",
          description: `${successful} questions deleted successfully`,
        })
      } else if (successful > 0 && failed > 0) {
        toast({
          title: "Partial Success",
          description: `${successful} questions deleted successfully, ${failed} failed`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete questions",
          variant: "destructive",
        })
      }

      setSelectedQuestions([])
      setSelectAll(false)

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete questions",
        variant: "destructive",
      })
    } finally {
      fetchData()
      setLoading(false)
    }
  }

  const handleViewQuestion = (question: Question) => {
    setViewQuestionData(question)
    setShowViewDialog(true)
  }

  // Function to handle option changes
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });

    // Update correctAnswer if this option was previously selected
    if (checkedOptions[index]) {
      const newCorrectAnswer = [...formData.correctAnswer];
      // Remove the old value if it exists
      const oldValue = formData.options[index];
      const oldIndex = newCorrectAnswer.indexOf(oldValue);
      if (oldIndex !== -1) {
        newCorrectAnswer.splice(oldIndex, 1);
      }
      // Add the new value if it's not empty
      if (value && !newCorrectAnswer.includes(value)) {
        newCorrectAnswer.push(value);
      }
      setFormData(prev => ({ ...prev, correctAnswer: newCorrectAnswer }));
    }
  };

  // Function to handle correct answer changes
  const handleCorrectAnswerChange = (index: number, checked: boolean) => {
    // Update the checked state
    const newCheckedOptions = [...checkedOptions];
    newCheckedOptions[index] = checked;
    setCheckedOptions(newCheckedOptions);

    // Update the correctAnswer array
    const optionValue = formData.options[index];
    let newCorrectAnswer = [...formData.correctAnswer];

    if (checked) {
      // Only add if not already included and not empty
      if (optionValue && !newCorrectAnswer.includes(optionValue)) {
        newCorrectAnswer.push(optionValue);
      }
    } else {
      // Remove this specific option
      const optionIndex = newCorrectAnswer.indexOf(optionValue);
      if (optionIndex !== -1) {
        newCorrectAnswer.splice(optionIndex, 1);
      }
    }

    // Update state with the new array
    setFormData(prevData => ({
      ...prevData,
      correctAnswer: newCorrectAnswer
    }));
  };

  // Function to check if an option is selected
  const isOptionSelected = (index: number) => {
    return checkedOptions[index];
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      text: "",
      type: "multiple-choice" as "multiple-choice" | "short-answer" | "descriptive",
      subject: "",
      className: "",
      chapter: "",
      difficulty: "Medium" as "Easy" | "Medium" | "Hard",
      options: ["", "", "", ""],
      correctAnswer: [],
      points: 1,
      time: 30,
      tags: [],
    });
    setCheckedOptions([false, false, false, false]);
    setSelectedQuestion(null);
  };

  // Handle edit question
  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);

    // Create a deep copy of the options array to avoid reference issues
    const optionsCopy = question.options ? [...question.options] : ["", "", "", ""];

    // Ensure correctAnswer is always an array
    let correctAnswerCopy: string[] = [];
    if (Array.isArray(question.correctAnswer)) {
      correctAnswerCopy = [...question.correctAnswer];
    } else if (question.correctAnswer) {
      correctAnswerCopy = [question.correctAnswer];
    }

    // Set the checked options based on the correctAnswer
    const newCheckedOptions = optionsCopy.map((option) =>
      correctAnswerCopy.includes(option)
    );

    setCheckedOptions(newCheckedOptions);

    setFormData({
      text: question.text,
      type: question.type,
      subject: question.subject,
      className: question.className,
      chapter: question.chapter || "",
      difficulty: question.difficulty,
      options: optionsCopy,
      correctAnswer: correctAnswerCopy,
      points: question.points,
      time: question.time,
      tags: question.tags ? [...question.tags] : [],
    });

    setShowEditDialog(true);
  };

  // Handle delete question
  const handleDelete = (question: Question) => {
    setSelectedQuestion(question)
    setShowDeleteDialog(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return

    try {
      setLoading(true)
      await api.questions.delete(selectedQuestion._id)
      toast({
        title: "Success",
        description: "Question deleted successfully",
      })
      setShowDeleteDialog(false)
      setSelectedQuestion(null)

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete question",
        variant: "destructive",
      })
    } finally {
      fetchData()
      setLoading(false)
    }
  }

  // Handle form submission (for both add and edit)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setLoading(true)
      const data = {
        ...formData,
        correctAnswer: formData.type === "multiple-choice" ? formData.correctAnswer : formData.correctAnswer[0],
      }

      if (selectedQuestion) {
        await api.questions.update(selectedQuestion._id, data)
        toast({
          title: "Success",
          description: "Question updated successfully",
        })
      } else {
        await api.questions.create(data)
        toast({
          title: "Success",
          description: "Question created successfully",
        })
      }

      setShowEditDialog(false)
      resetFormData()

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save question",
        variant: "destructive",
      })
    } finally {
      fetchData()
      setLoading(false)
    }
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

                <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
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

            {selectedQuestions.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete} className="ml-auto flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedQuestions.length})
              </Button>
            )}
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
                  <TableHead>Class</TableHead>
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
                      <TableCell>{question.className}</TableCell>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewQuestion(question)}
                            aria-label={`View question ${question.text}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(question)}
                            aria-label={`Edit question ${question.text}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(question)}
                            aria-label={`Delete question ${question.text}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update the question details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={formData.className}
                  onValueChange={(value) => setFormData({ ...formData, className: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter/Topic</Label>
                <Input
                  id="chapter"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="Enter chapter or topic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value as "Easy" | "Medium" | "Hard" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as "multiple-choice" | "short-answer" | "descriptive" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="descriptive">Descriptive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter your question here"
                rows={3}
              />
            </div>
            {formData.type === "multiple-choice" && (
              <div className="space-y-2">
                <Label>Options (for Multiple Choice)</Label>
                <div className="space-y-2">
                  {["A", "B", "C", "D"].map((option, index) => (
                    <div key={option} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-option-${option}`}
                        name={`edit-correct-${option}`}
                        checked={isOptionSelected(index)}
                        onCheckedChange={(checked) => {
                          handleCorrectAnswerChange(index, checked as boolean);
                        }}
                      />
                      <Label htmlFor={`edit-option-${option}`} className="flex-1">
                        <Input
                          value={formData.options[index]}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${option}`}
                        />
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Check the correct answer(s)</p>
              </div>
            )}
            {formData.type === "short-answer" && (
              <div className="space-y-2">
                <Label htmlFor="answer">Correct Answer</Label>
                <Input
                  id="answer"
                  value={formData.correctAnswer[0] || ""}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: [e.target.value] })}
                  placeholder="Enter the correct answer"
                />
              </div>
            )}
            {formData.type === "descriptive" && (
              <div className="space-y-2">
                <Label htmlFor="edit-descriptive-answer">Correct Answer</Label>
                <Textarea
                  id="edit-descriptive-answer"
                  value={formData.correctAnswer[0] || ""}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: [e.target.value] })}
                  placeholder="Enter the model answer for this descriptive question"
                  rows={3}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="time">Time Limit</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="time"
                  type="number"
                  min="5"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: Number.parseInt(e.target.value) })}
                  className="w-20"
                />
                <span>seconds</span>
              </div>
              <p className="text-xs text-muted-foreground">Default: 30s for MCQ, 10s for SCQ</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value.split(",").map((tag) => tag.trim()) })
                  }
                  placeholder="e.g., important, exam"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
