"use client"

import { useState } from "react"
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
import { Search, Plus, Edit, Trash2, FileUp, Download, Copy } from "lucide-react"

export default function TeacherQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const questions = [
    {
      id: 1,
      question: "What is the formula for calculating the area of a circle?",
      type: "multiple-choice",
      subject: "Mathematics",
      class: "Class 8",
      chapter: "Geometry",
      difficulty: "Easy",
      options: ["πr", "2πr", "πr²", "2πr²"],
      correctAnswer: "πr²",
      marks: 1,
      time: "30s",
    },
    {
      id: 2,
      question: "Which of the following is NOT a noble gas?",
      type: "multiple-choice",
      subject: "Science",
      class: "Class 9",
      chapter: "Periodic Table",
      difficulty: "Medium",
      options: ["Helium", "Neon", "Oxygen", "Argon"],
      correctAnswer: "Oxygen",
      marks: 1,
      time: "30s",
    },
    {
      id: 3,
      question: "Explain the process of photosynthesis.",
      type: "descriptive",
      subject: "Science",
      class: "Class 8",
      chapter: "Plants",
      difficulty: "Medium",
      marks: 5,
    },
    {
      id: 4,
      question: "Solve the equation: 2x + 5 = 15",
      type: "short-answer",
      subject: "Mathematics",
      class: "Class 7",
      chapter: "Algebra",
      difficulty: "Easy",
      correctAnswer: "x = 5",
      marks: 2,
    },
    {
      id: 5,
      question: "What are the main causes of World War I?",
      type: "descriptive",
      subject: "History",
      class: "Class 10",
      chapter: "World Wars",
      difficulty: "Hard",
      marks: 5,
    },
    {
      id: 6,
      question: "Identify the parts of speech in the sentence: 'The quick brown fox jumps over the lazy dog.'",
      type: "descriptive",
      subject: "English",
      class: "Class 9",
      chapter: "Grammar",
      difficulty: "Medium",
      marks: 3,
    },
    {
      id: 7,
      question: "Which of the following is a primary color?",
      type: "multiple-choice",
      subject: "Art",
      class: "Class 7",
      chapter: "Colors",
      difficulty: "Easy",
      options: ["Green", "Purple", "Blue", "Orange"],
      correctAnswer: "Blue",
      marks: 1,
    },
    {
      id: 8,
      question: "Calculate the volume of a cube with side length 5 cm.",
      type: "short-answer",
      subject: "Mathematics",
      class: "Class 8",
      chapter: "Mensuration",
      difficulty: "Medium",
      correctAnswer: "125 cm³",
      marks: 2,
    },
  ]

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || question.subject === selectedSubject
    const matchesClass = selectedClass === "all" || question.class === selectedClass
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
      setSelectedQuestions(filteredQuestions.map((q) => q.id))
    } else {
      setSelectedQuestions([])
    }
  }

  const handleSelectQuestion = (id: number) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((qId) => qId !== id))
    } else {
      setSelectedQuestions([...selectedQuestions, id])
    }
  }

  const handleBulkDelete = () => {
    // In a real app, you would call an API to delete the selected questions
    console.log("Deleting questions:", selectedQuestions)
    // For now, we'll just show a success message
    alert(`${selectedQuestions.length} questions deleted successfully`)
    setSelectedQuestions([])
    setSelectAll(false)
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
            <Dialog>
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
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select defaultValue="mathematics">
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
                      <Select defaultValue="class8">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chapter">Chapter/Topic</Label>
                      <Input id="chapter" placeholder="e.g., Geometry" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select defaultValue="multiple-choice">
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
                    <Textarea id="question" placeholder="Enter your question here" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Options (for Multiple Choice)</Label>
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox id={`option-${option}`} />
                          <Label htmlFor={`option-${option}`} className="flex-1">
                            <Input placeholder={`Option ${option}`} />
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Check the correct answer(s)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Correct Answer (for Short Answer)</Label>
                    <Input id="answer" placeholder="Enter the correct answer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input id="time" type="number" min="5" placeholder="30" className="w-20" />
                      <span>seconds</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Default: 30s for MCQ, 10s for SCQ</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marks">Marks</Label>
                      <Input id="marks" type="number" min="1" defaultValue="1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (Optional)</Label>
                      <Input id="tags" placeholder="e.g., important, exam" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Question</Button>
                </DialogFooter>
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

        <Tabs defaultValue="all" className="w-full">
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
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="Class 7">Class 7</SelectItem>
                <SelectItem value="Class 8">Class 8</SelectItem>
                <SelectItem value="Class 9">Class 9</SelectItem>
                <SelectItem value="Class 10">Class 10</SelectItem>
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
            <Table className="w-full overflow-auto">
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
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleSelectQuestion(question.id)}
                          aria-label={`Select question ${question.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{question.question}</TableCell>
                      <TableCell>{question.subject}</TableCell>
                      <TableCell>{question.class}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                          {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            question.difficulty,
                          )}`}
                        >
                          {question.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>{question.marks}</TableCell>
                      <TableCell>{question.time || (question.type === "multiple-choice" ? "30s" : "10s")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                        <p className="text-muted-foreground">No questions found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
