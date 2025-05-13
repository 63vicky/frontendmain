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
  initialTab?: "create" | "existing"
  userRole?: "teacher" | "principal" // Add userRole prop to determine permissions
}

export function QuestionDialog({
  exam,
  open,
  onOpenChange,
  onSuccess,
  existingQuestions = [],
  initialTab = "create",
  userRole = "teacher" // Default to teacher role
}: QuestionDialogProps) {
  const [loading, setLoading] = useState(false)
  // Define allowed question types as a constant to ensure consistency
  const ALLOWED_QUESTION_TYPES = ['multiple-choice', 'short-answer', 'descriptive', 'custom'] as const
  type QuestionType = typeof ALLOWED_QUESTION_TYPES[number]

  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice')
  const [customType, setCustomType] = useState("")
  const [category, setCategory] = useState("")
  const [isCustomType, setIsCustomType] = useState(false)
  const [activeTab, setActiveTab] = useState<"create" | "existing">(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [addedQuestions, setAddedQuestions] = useState<string[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])

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

  // Reset state when dialog closes or opens
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setAddedQuestions([])
      setSelectedQuestions([])
    } else {
      // Set the active tab to initialTab when the dialog opens
      setActiveTab(initialTab)
    }
  }, [open, initialTab])

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!questionsData?.data) return []
    return questionsData.data.filter(q =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [questionsData?.data, searchQuery, addedQuestions])

  // Check if a question is already added to the exam
  const isQuestionAdded = (question: Question) => {
    if (!exam || !question._id) return false;

    // Check if the question is in the existing questions array
    const isInExistingQuestions = existingQuestions.some(q => q._id === question._id);

    // Check if the question's examIds includes the current exam ID
    const isInExamIds = question.examIds && question.examIds.includes(exam._id);

    // Check if the question was added in the current session
    const isAddedInCurrentSession = addedQuestions.includes(question._id);

    return isInExistingQuestions || isInExamIds || isAddedInCurrentSession;
  }

  // Fetch dynamic data for dropdowns
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await fetch(`${API_URL}/subjects`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (subjectsResponse.ok) {
          const data = await subjectsResponse.json();
          setSubjects(data.data.map((subject: any) => subject.name));
        }

        // Fetch classes
        const classesResponse = await fetch(`${API_URL}/classes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (classesResponse.ok) {
          const data = await classesResponse.json();
          setClasses(data.data.map((cls: any) => cls.name));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dynamic data",
          variant: "destructive"
        })
      }
    };

    if (open) {
      fetchDynamicData();
    }
  }, [open, API_URL]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!exam) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      // Handle correct answer based on question type
      let correctAnswer;
      let submittedType = formData.get('question-type') as string;

      // Handle custom question type
      if (submittedType === 'custom') {
        if (!customType.trim()) {
          throw new Error('Please enter a custom question type.');
        }
        submittedType = customType.trim();
      } else {
        // Validate that the question type is one of the allowed types
        if (!ALLOWED_QUESTION_TYPES.includes(submittedType as QuestionType)) {
          throw new Error('Invalid question type. Please select a valid question type.');
        }
      }

      // Use the submitted type
      const questionType = submittedType;

      if (questionType === 'multiple-choice') {
        // For multiple choice, collect all checked options
        const options = ["A", "B", "C", "D"].map(option => ({
          option: formData.get(`option-${option}`) as string,
          isCorrect: formData.get(`correct-${option}`) === 'on'
        }));

        // Filter out empty options and get correct answers
        const validOptions = options.filter(opt => opt.option && opt.option.trim() !== "");
        correctAnswer = validOptions
          .filter(opt => opt.isCorrect)
          .map(opt => opt.option);

        console.log("Selected correct answers:", correctAnswer); // For debugging

        if (correctAnswer.length === 0) {
          throw new Error('Please select at least one correct answer');
        }
      } else {
        // For short answer, descriptive, and custom types, use the answer field
        correctAnswer = formData.get('answer');
        if (!correctAnswer) {
          throw new Error('Please provide a correct answer');
        }
      }

      // First create the question
      const questionResponse = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: formData.get('question'),
          type: questionType, // This can be a standard type or a custom type
          options: questionType === 'multiple-choice'
            ? ["A", "B", "C", "D"].map(option => formData.get(`option-${option}`)).filter(Boolean)
            : [],
          correctAnswer,
          points: parseInt(formData.get('marks') as string),
          difficulty: formData.get('difficulty'),
          time: parseInt(formData.get('time') as string),
          subject: formData.get('subject'),
          className: formData.get('class'),
          chapter: formData.get('chapter'),
          tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()) || [],
          examId: exam._id, // Ensure the question is associated with the exam
          // Include category for custom question types
          category: isCustomType ? formData.get('category') : undefined
        })
      });

      if (!questionResponse.ok) {
        const error = await questionResponse.json();
        throw new Error(error.message || 'Failed to create question');
      }

      const questionData = await questionResponse.json();

      // Then add the question to the exam
      const addToExamResponse = await fetch(`${API_URL}/questions/${questionData.data._id}/add-to-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          examId: exam._id
        })
      });

      if (!addToExamResponse.ok) {
        const error = await addToExamResponse.json();
        throw new Error(error.message || 'Failed to add question to exam');
      }

      toast({
        title: 'Success',
        description: 'Question added successfully'
      })

      // Add the new question ID to the addedQuestions state
      setAddedQuestions(prev => [...prev, questionData.data._id]);

      // Switch to the existing questions tab to show the newly created question
      setActiveTab('existing')

      // Call onSuccess to refresh the questions list but don't close the dialog
      onSuccess()

      // Refresh the questions list to update the UI
      if (questionsData) {
        refetchQuestions()
      }
    } catch (error) {
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
        throw new Error(error.message || 'Failed to add question');
      }

      toast({
        title: 'Success',
        description: 'Question added successfully'
      })

      // Add the question ID to the addedQuestions state
      setAddedQuestions(prev => [...prev, question._id]);

      // Ensure we stay on the existing questions tab
      setActiveTab('existing')

      // Call onSuccess to refresh the questions list but don't close the dialog
      onSuccess()

      // Refresh the questions list to update the UI
      if (questionsData) {
        refetchQuestions()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add question',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAddQuestions = async () => {
    if (!exam || selectedQuestions.length === 0) return

    setLoading(true)
    try {
      // Create an array of promises for each question to add
      const addPromises = selectedQuestions.map(questionId =>
        fetch(`${API_URL}/questions/${questionId}/add-to-exam`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            examId: exam._id
          })
        })
      );

      // Wait for all promises to resolve
      const responses = await Promise.all(addPromises);

      // Check if any requests failed
      const failedRequests = responses.filter(response => !response.ok).length;

      if (failedRequests > 0) {
        throw new Error(`Failed to add ${failedRequests} questions`);
      }

      toast({
        title: 'Success',
        description: `Added ${selectedQuestions.length} questions successfully`
      })

      // Add all selected questions to the addedQuestions state
      setAddedQuestions(prev => [...prev, ...selectedQuestions]);

      // Clear selection
      setSelectedQuestions([]);

      // Call onSuccess to refresh the questions list but don't close the dialog
      onSuccess()

      // Refresh the questions list to update the UI
      if (questionsData) {
        refetchQuestions()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add questions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all questions that aren't already added to the exam
      const availableQuestions = filteredQuestions
        .filter(q => !isQuestionAdded(q))
        .map(q => q._id);
      setSelectedQuestions(availableQuestions);
    } else {
      // Deselect all
      setSelectedQuestions([]);
    }
  }

  const handleToggleSelectQuestion = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
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

  // Set the active tab when the dialog opens
  useEffect(() => {
    if (open) {
      // Use the initialTab value for both teachers and principals
      setActiveTab(initialTab);

      // Clear selected questions when dialog opens
      setSelectedQuestions([]);
    }
  }, [open, initialTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Questions</DialogTitle>
          <DialogDescription>Add questions to {exam?.title}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "create" | "existing")}>
          <TabsList className="grid w-full grid-cols-2">
            {/* Show Create New tab for both teachers and principals */}
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
                
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter/Topic</Label>
                  <Input
                    id="chapter"
                    name="chapter"
                    placeholder="Enter chapter or topic"
                    defaultValue={exam?.chapter}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select name="difficulty" defaultValue="medium">
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
                  name="question-type"
                  value={isCustomType ? "custom" : questionType}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setIsCustomType(true);
                      // Keep the current type until custom type is entered
                    } else {
                      setIsCustomType(false);
                      // Validate that the value is one of the allowed types
                      if (ALLOWED_QUESTION_TYPES.includes(value as QuestionType)) {
                        setQuestionType(value as QuestionType);
                      } else {
                        // If not, default to multiple-choice and show an error
                        setQuestionType('multiple-choice');
                        toast({
                          title: "Invalid Question Type",
                          description: "The selected question type is not valid. Using Multiple Choice instead.",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="custom">Custom Type</SelectItem>
                  </SelectContent>
                </Select>

                {isCustomType && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Enter custom question type"
                      value={customType}
                      onChange={(e) => {
                        setCustomType(e.target.value);
                      }}
                    />

                    

                    
                  </div>
                )}
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
                        <Checkbox
                          id={`correct-${option}`}
                          name={`correct-${option}`}
                        />
                        <Label htmlFor={`correct-${option}`} className="flex-1">
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
              {questionType === 'descriptive' && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Correct Answer</Label>
                  <Textarea
                    id="answer"
                    name="answer"
                    placeholder="Enter the model answer for this descriptive question"
                    rows={3}
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
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Button
                  onClick={handleBulkAddQuestions}
                  disabled={loading || selectedQuestions.length === 0}
                  className="whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Selected ({selectedQuestions.length})
                    </>
                  )}
                </Button>
              </div>

              {loadingQuestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 text-muted-foreground opacity-20 mb-2 mx-auto" />
                  <p>No questions found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center p-2 border rounded-lg bg-muted/20">
                    <Checkbox
                      id="select-all"
                      checked={selectedQuestions.length > 0 &&
                        selectedQuestions.length === filteredQuestions.filter(q => !isQuestionAdded(q)).length}
                      onCheckedChange={handleToggleSelectAll}
                    />
                    <Label htmlFor="select-all" className="ml-2 cursor-pointer">
                      Select All ({filteredQuestions.filter(q => !isQuestionAdded(q)).length} available)
                    </Label>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto">
                    {filteredQuestions.map((question) => {
                      const isAdded = isQuestionAdded(question);
                      const isSelected = selectedQuestions.includes(question._id);
                      return (
                        <div
                          key={question._id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2">
                              {!isAdded && (
                                <Checkbox
                                  id={`select-${question._id}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleToggleSelectQuestion(question._id, checked as boolean)
                                  }
                                  className="mt-1"
                                />
                              )}
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
                                  <li key={index}>{typeof option === 'string' ? option : option.text}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}