"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Exam, Question } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFetch } from "@/hooks/use-fetch"
import { Loader2, Plus, Search } from "lucide-react"

interface QuestionDialogProps {
  exam: Exam | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  existingQuestions?: Question[]
}

export function QuestionDialog({
  exam,
  open,
  onOpenChange,
  onSuccess,
  existingQuestions = []
}: QuestionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'short-answer' | 'descriptive'>('multiple-choice')
  const [activeTab, setActiveTab] = useState("create")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [chapters, setChapters] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  // Memoize fetch options to prevent unnecessary re-renders
  const fetchOptions = useMemo(() => ({
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    autoFetch: false, // Disable auto-fetch
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch questions',
        variant: 'destructive'
      })
    }
  }), [toast])

  // Only fetch questions when the dialog is open and we're on the existing tab
  const questionsUrl = useMemo(() => {
    if (activeTab === 'existing' && open) {
      return `${API_URL}/questions`
    }
    return ''
  }, [activeTab, open, API_URL])

  const { data: questionsData, loading: loadingQuestions, refetch: refetchQuestions } = useFetch<{ success: boolean; data: Question[] }>(
    questionsUrl,
    fetchOptions
  )

  // Fetch questions when dialog opens or tab changes
  useEffect(() => {
    if (activeTab === 'existing' && open) {
      refetchQuestions()
    }
  }, [activeTab, open, refetchQuestions])

  // Reset search query when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setActiveTab("create")
    }
  }, [open])

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!questionsData?.data) return []
    return questionsData.data.filter(q => 
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [questionsData?.data, searchQuery])

  // Check if a question is already added to the exam
  const isQuestionAdded = (question: Question) => {
    if (!exam || !question.examIds) return false;
    
    console.log('Checking if question is added:', {
      questionText: question.text,
      questionExamIds: question.examIds,
      currentExamId: exam._id
    });
    
    return question.examIds.includes(exam._id);
  }

  // Debug existing questions when they change
  useEffect(() => {
    console.log('Existing questions updated:', existingQuestions);
  }, [existingQuestions]);

  // Debug when exam changes
  useEffect(() => {
    console.log('Exam changed:', exam);
  }, [exam]);

  // Fetch dynamic data for dropdowns
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await fetch(`${API_URL}/questions/subjects`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(subjectsResponse);
        if (subjectsResponse.ok) {
          const data = await subjectsResponse.json();
          setSubjects(data.data);
        }

        // Fetch classes
        const classesResponse = await fetch(`${API_URL}/questions/classes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (classesResponse.ok) {
          const data = await classesResponse.json();
          setClasses(data.data);
        }
      } catch (error) {
        console.error('Error fetching dynamic data:', error);
      }
    };

    if (open) {
      fetchDynamicData();
    }
  }, [open, API_URL]);

  // Fetch chapters when subject changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedSubject) return;

      try {
        const response = await fetch(`${API_URL}/questions/chapters/${selectedSubject}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setChapters(data.data);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    fetchChapters();
  }, [selectedSubject, API_URL]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!exam) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      // Handle correct answer based on question type
      let correctAnswer;
      const questionType = formData.get('question-type') as string;
      
      if (questionType === 'multiple-choice') {
        // For multiple choice, collect all checked options
        const options = ["A", "B", "C", "D"].map(option => ({
          option: formData.get(`option-${option}`) as string,
          isCorrect: formData.get(`correct-${option}`) === 'on'
        }));
        
        // Filter out empty options and get correct answers
        const validOptions = options.filter(opt => opt.option);
        correctAnswer = validOptions
          .filter(opt => opt.isCorrect)
          .map(opt => opt.option);
          
        if (correctAnswer.length === 0) {
          throw new Error('Please select at least one correct answer');
        }
      } else {
        // For short answer and descriptive, use the answer field
        correctAnswer = formData.get('answer');
        if (!correctAnswer) {
          throw new Error('Please provide a correct answer');
        }
      }

      const response = await fetch(`${API_URL}/questions/exam/${exam._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: formData.get('question'),
          type: questionType,
          options: questionType === 'multiple-choice' 
            ? ["A", "B", "C", "D"].map(option => formData.get(`option-${option}`)).filter(Boolean)
            : [],
          correctAnswer,
          points: parseInt(formData.get('marks') as string),
          difficulty: formData.get('difficulty'),
          time: parseInt(formData.get('time') as string),
          subject: formData.get('subject'),
          class: formData.get('class'),
          chapter: formData.get('chapter'),
          tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()) || []
        })
      })

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add question');
      }

      toast({
        title: 'Success',
        description: 'Question added successfully'
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add question',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddExistingQuestion = async (question: Question) => {
    if (!exam) return

    setLoading(true)
    try {
      console.log('Adding question to exam:', { question, examId: exam._id });
      
      const response = await fetch(`${API_URL}/questions/${question._id}/add-to-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          examId: exam._id
        })
      })

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add question');
      }

      toast({
        title: 'Success',
        description: 'Question added successfully'
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add question',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Questions</DialogTitle>
          <DialogDescription>Add questions to {exam?.title}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="existing">Add Existing</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    name="subject" 
                    defaultValue={exam?.subject}
                    onValueChange={(value) => setSelectedSubject(value)}
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
                  <Select name="class" defaultValue={exam?.class}>
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
                  <Select name="chapter" defaultValue={exam?.chapter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter} value={chapter}>
                          {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select name="difficulty" defaultValue="medium">
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
                <Select 
                  name="question-type" 
                  defaultValue="multiple-choice"
                  onValueChange={(value) => setQuestionType(value as 'multiple-choice' | 'short-answer' | 'descriptive')}
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
                  name="question" 
                  placeholder="Enter your question here" 
                  rows={3} 
                  required
                />
              </div>
              {questionType === 'multiple-choice' && (
                <div className="space-y-2">
                  <Label>Options (for Multiple Choice)</Label>
                  <div className="space-y-2">
                    {["A", "B", "C", "D"].map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox id={`option-${option}`} name={`correct-${option}`} />
                        <Label htmlFor={`option-${option}`} className="flex-1">
                          <Input 
                            name={`option-${option}`} 
                            placeholder={`Option ${option}`} 
                            required
                          />
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Check the correct answer(s)</p>
                </div>
              )}
              {questionType === 'short-answer' && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Correct Answer</Label>
                  <Input 
                    id="answer" 
                    name="answer" 
                    placeholder="Enter the correct answer" 
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="time">Time Limit</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="time" 
                    name="time" 
                    type="number" 
                    min="5" 
                    placeholder="30" 
                    className="w-20" 
                    required
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
                    name="marks" 
                    type="number" 
                    min="1" 
                    defaultValue="1" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input 
                    id="tags" 
                    name="tags" 
                    placeholder="e.g., important, exam" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Question'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="existing">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {loadingQuestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No questions found
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredQuestions.map((question) => {
                    const isAdded = isQuestionAdded(question);
                    return (
                      <div
                        key={question._id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">{question.text}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(question.type)}`}>
                                {question.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(question.difficulty || 'Medium')}`}>
                                {question.difficulty || 'Medium'}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                                {question.points} points
                              </span>
                              {isAdded && (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Added
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddExistingQuestion(question)}
                            disabled={loading || isAdded}
                          >
                            {isAdded ? (
                              'Added'
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                        {question.options && question.options.length > 0 && (
                          <div className="text-sm">
                            <p className="font-medium">Options:</p>
                            <ul className="list-disc list-inside">
                              {question.options.map((option, index) => (
                                <li key={index}>{option}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 