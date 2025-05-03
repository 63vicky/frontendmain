"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api, getSubjects } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Plus, Edit, Trash2, FileUp, Download, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function TeacherQuestionsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [allSubjects, setAllSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [allClasses, setAllClasses] = useState<string[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
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

  // Add a separate state for tracking which options are checked
  const [checkedOptions, setCheckedOptions] = useState<boolean[]>([false, false, false, false]);

  // Add a function to handle option changes
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

  // Add a function to handle correct answer changes
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

  // Add a function to check if an option is selected
  const isOptionSelected = (index: number) => {
    return checkedOptions[index];
  };

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

  // Fetch questions and filters
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [questionsRes, subjectsRes, allSubjectsRes,classesRes, allClassesRes] = await Promise.all([
        api.questions.getAll({
          subject: selectedSubject !== "all" ? selectedSubject : undefined,
          className: selectedClass !== "all" ? selectedClass : undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
          search: searchTerm || undefined,
        }),
        api.questions.getSubjects(),
        getSubjects(),
        api.questions.getClasses(),
        api.classes.getAll(),
      ])

      setQuestions(questionsRes.data)
      setSubjects(subjectsRes.data)
      setAllSubjects(allSubjectsRes.data)
      setClasses(classesRes.data)
      setAllClasses(allClassesRes.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || question.subject === selectedSubject
    const matchesClass = selectedClass === "all" || question.className === selectedClass
    const matchesType = selectedType === "all" || question.type === selectedType
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty
    return matchesSearch && matchesSubject && matchesClass && matchesType && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "descriptive":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "short-answer":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    if (newSelectAll) {
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
      await Promise.all(selectedQuestions.map((id) => api.questions.delete(id)))
      toast({
        title: "Success",
        description: `${selectedQuestions.length} questions deleted successfully`,
      })
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
    const newCheckedOptions = optionsCopy.map((option, index) =>
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

  const handleDelete = (question: Question) => {
    setSelectedQuestion(question)
    setShowDeleteDialog(true)
  }

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

      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedQuestion(null)

      // Reset form data to initial state
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
      })

      
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

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Skeleton className="h-4 w-4" />
                    </TableHead>
                    <TableHead className="w-[45%]">
                      <Skeleton className="h-4 w-32" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">Manage and organize your exam questions</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open);
              if (open) {
                resetFormData();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add New Question</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                  <DialogDescription>Create a new question for your question bank.</DialogDescription>
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
                          {allSubjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject.name}>
                              {subject.name}
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
                          {allClasses.map((cls) => (
                            <SelectItem key={cls._id} value={cls.name}>
                              {cls.name}
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
                              id={`option-${option}`}
                              name={`correct-${option}`}
                              checked={isOptionSelected(index)}
                              onCheckedChange={(checked) => {
                                handleCorrectAnswerChange(index, checked as boolean);
                              }}
                            />
                            <Label htmlFor={`option-${option}`} className="flex-1">
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
                      <Label htmlFor="descriptive-answer">Correct Answer</Label>
                      <Textarea
                        id="descriptive-answer"
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
                          {selectedQuestion ? "Saving..." : "Adding..."}
                        </>
                      ) : selectedQuestion ? (
                        "Save Changes"
                      ) : (
                        "Add Question"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Import Questions</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="multiple-choice">Multiple Choice</TabsTrigger>
            <TabsTrigger value="short-answer">Short Answer</TabsTrigger>
            <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4">
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
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
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
          </div>
          {selectedQuestions.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} className="ml-auto flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedQuestions.length})
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all questions" />
                  </TableHead>
                  <TableHead className="w-[45%]">Question</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                        <p className="text-muted-foreground">No questions found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
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
                          aria-label={`Select question ${question._id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{question.text}</TableCell>
                      <TableCell>{question.subject}</TableCell>
                      <TableCell>{question.className}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                          {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell>{question.time}s</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(question)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(question)}>
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
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
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
    </DashboardLayout>
  )
}
