"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import DashboardLayout from "@/components/dashboard-layout"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function AddQuestion() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [formData, setFormData] = useState({
    text: "",
    type: "multiple-choice" as "multiple-choice" | "short-answer" | "descriptive" | string,
    subject: "",
    className: "",
    chapter: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    options: ["", "", "", ""],
    correctAnswer: [] as string[],
    points: 1,
    time: 30,
    tags: [] as string[],
    category: "" // Added category field for custom question types
  })
  const [customType, setCustomType] = useState("")
  const [isCustomType, setIsCustomType] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, classesRes] = await Promise.all([
          api.questions.getSubjects(),
          api.questions.getClasses(),
        ])
        setSubjects(subjectsRes.data || [])
        setClasses(classesRes.data || [])
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch data",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [toast])

  const handleOptionChange = (index: number, value: string) => {
    const oldOption = formData.options[index]
    const newOptions = [...formData.options]
    newOptions[index] = value

    // Update correctAnswer if this option was selected
    let newCorrectAnswer = [...formData.correctAnswer]
    if (newCorrectAnswer.includes(oldOption)) {
      // Replace the old option value with the new one in correctAnswer
      newCorrectAnswer = newCorrectAnswer.map(answer =>
        answer === oldOption ? value : answer
      )
    }

    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    })
  }

  const handleCorrectAnswerChange = (index: number, checked: boolean) => {
    const option = formData.options[index]
    let newCorrectAnswer = [...formData.correctAnswer]

    if (checked) {
      // Only add if the option has content and isn't already in the array
      if (option && option.trim() !== "" && !newCorrectAnswer.includes(option)) {
        newCorrectAnswer.push(option)
      }
    } else {
      // Remove this option from correct answers
      newCorrectAnswer = newCorrectAnswer.filter(a => a !== option)
    }

    // Update the form data with the new array of correct answers
    setFormData({ ...formData, correctAnswer: newCorrectAnswer })

    console.log("Updated correct answers:", newCorrectAnswer) // For debugging
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Validate form data
      if (!formData.text) {
        throw new Error("Question text is required")
      }

      if (!formData.subject) {
        throw new Error("Subject is required")
      }

      if (formData.type === "multiple-choice") {
        // Ensure at least 2 options are provided
        const validOptions = formData.options.filter(o => o.trim() !== "")
        if (validOptions.length < 2) {
          throw new Error("Multiple choice questions must have at least 2 options")
        }

        // Ensure at least one correct answer is selected
        if (formData.correctAnswer.length === 0) {
          throw new Error("Please select at least one correct answer")
        }
      } else if (isCustomType) {
        // Validate custom type
        if (!customType.trim()) {
          throw new Error("Please enter a custom question type")
        }

        if (!formData.correctAnswer[0]) {
          throw new Error("Correct answer is required")
        }
      } else if (!formData.correctAnswer[0]) {
        throw new Error("Correct answer is required")
      }

      // Prepare data for API
      const questionData = {
        ...formData,
        // For non-multiple-choice questions, correctAnswer should be a string
        correctAnswer: formData.type === "multiple-choice"
          ? formData.correctAnswer
          : formData.correctAnswer[0] || "",
        // Filter out empty options
        options: formData.type === "multiple-choice"
          ? formData.options.filter(o => o.trim() !== "")
          : [],
        // Ensure the type is set correctly for custom types
        type: isCustomType ? customType.trim() : formData.type,
        // Only include category if it's a custom type and has a value
        category: isCustomType && formData.category ? formData.category : undefined
      }

      // Create the question
      await api.questions.create(questionData)

      toast({
        title: "Success",
        description: "Question created successfully",
      })

      // Redirect back to questions page
      router.push("/dashboard/principal/questions")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create question",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/principal/questions")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Add New Question</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Create a new question for your question bank</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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


              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value as "Easy" | "Medium" | "Hard" })}
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
                  value={isCustomType ? "custom" : formData.type}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setIsCustomType(true);
                      // Keep the current type until custom type is entered
                    } else {
                      setIsCustomType(false);
                      setFormData({
                        ...formData,
                        type: value,
                        // Reset correctAnswer when changing type
                        correctAnswer: []
                      });
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
                        if (e.target.value.trim()) {
                          setFormData({
                            ...formData,
                            type: e.target.value.trim(),
                            // Reset correctAnswer when changing type
                            correctAnswer: []
                          });
                        }
                      }}
                    />

                    <div>
                      <Label htmlFor="category">Question Category</Label>
                      <Input
                        id="category"
                        placeholder="Enter question category (e.g., Grammar, Vocabulary)"
                        value={formData.category}
                        onChange={(e) => setFormData({
                          ...formData,
                          category: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Create a new question type. Custom types will be treated like short-answer questions.
                      Adding a category helps organize questions of the same type.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter your question here"
                  rows={3}
                  required
                />
              </div>

              {formData.type === "multiple-choice" && (
                <div className="space-y-2">
                  <Label>Options (for Multiple Choice)</Label>
                  <div className="space-y-2">
                    {["A", "B", "C", "D"].map((option, index) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={`correct-${option}`}
                          checked={formData.correctAnswer.includes(formData.options[index])}
                          onCheckedChange={(checked) =>
                            handleCorrectAnswerChange(index, checked === true)
                          }
                        />
                        <Label htmlFor={`correct-${option}`} className="flex-1">
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

              {(formData.type === "short-answer" || formData.type === "descriptive" || (isCustomType && customType.trim() !== "")) && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Correct Answer</Label>
                  {formData.type === "descriptive" ? (
                    <Textarea
                      id="answer"
                      value={formData.correctAnswer[0] || ""}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: [e.target.value] })}
                      placeholder="Enter the model answer for this descriptive question"
                      rows={3}
                      required
                    />
                  ) : (
                    <Input
                      id="answer"
                      value={formData.correctAnswer[0] || ""}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: [e.target.value] })}
                      placeholder="Enter the correct answer"
                      required
                    />
                  )}
                  {isCustomType && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Custom question types use a single correct answer format.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="time">Time Limit (seconds)</Label>
                  <Input
                    id="time"
                    type="number"
                    min="5"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) || 30 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="Enter tags separated by commas (e.g., important, exam)"
                />
                <p className="text-xs text-muted-foreground">Optional: Add tags to help organize questions</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/principal/questions")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Question"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
