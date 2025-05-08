"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ExamStats {
  id: string;
  title: string;
  subject: string;
  class: string;
  classId?: string; // Add classId to store the actual class ID
  teacher: string;
  students: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  status: string;
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
}

interface OverallStats {
  totalExams: number;
  activeExams: number;
  completedExams: number;
  averageScore: number;
}

interface ClassFilter {
  id: string;
  name: string;
}

interface Filters {
  classes: ClassFilter[];
  subjects: string[];
}

export default function ExamAnalytics() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [examStats, setExamStats] = useState<ExamStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalExams: 0,
    activeExams: 0,
    completedExams: 0,
    averageScore: 0
  });
  const [filters, setFilters] = useState<Filters>({
    classes: [],
    subjects: []
  });
  const [allFilters, setAllFilters] = useState<Filters>({
    classes: [],
    subjects: []
  });

  // Fetch all filter options on initial load
  useEffect(() => {
    fetchAllFilterOptions();
  }, []);

  // Fetch filtered data when filters change
  useEffect(() => {
    fetchExamAnalytics();
  }, [selectedClass, selectedSubject]);

  // Fetch all filter options (classes and subjects)
  const fetchAllFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/exam-analytics?class=all&subject=all`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exam analytics');
      }

      const data = await response.json();
      setExamStats(data.exams);
      setOverallStats(data.stats);
      setFilters(data.filters);
      setAllFilters(data.filters); // Save all filter options
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch filter options",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam analytics with selected filters
  const fetchExamAnalytics = async () => {
    // Skip if this is the initial load (fetchAllFilterOptions will handle it)
    if (allFilters.classes.length === 0 && selectedClass === 'all' && selectedSubject === 'all') {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/exam-analytics?class=${selectedClass}&subject=${selectedSubject}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exam analytics');
      }

      const data = await response.json();
      setExamStats(data.exams);
      setOverallStats(data.stats);

      // The backend now always returns the complete list of filter options
      // that have associated exams, so we can just use them directly
      setFilters(data.filters);

      // If this is the first load with filters, also update allFilters
      if (allFilters.classes.length === 0) {
        setAllFilters(data.filters);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exam analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected class and subject
  const filteredData = examStats.filter((exam) => {
    // For class filtering, we need to handle both the case where the backend has already filtered
    // and the case where we need to filter on the frontend
    const classMatch = selectedClass === "all" ||
      // If the backend didn't filter properly, we might need to filter by display name
      exam.classId === selectedClass;

    const subjectMatch = selectedSubject === "all" || exam.subject === selectedSubject;
    return classMatch && subjectMatch;
  });

  // Group data by status
  const activeExams = filteredData.filter((exam) =>
    exam.status === "active" || exam.status === "scheduled"
  );
  const completedExams = filteredData.filter((exam) =>
    exam.status === "completed"
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-1/2">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="w-full sm:w-1/2">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Analytics</CardTitle>
        <CardDescription>Analyze exam performance across classes and subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/2">
            <Label htmlFor="class-filter">Filter by Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-filter">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {/* Show classes from filters (backend now always returns all relevant classes) */}
                {filters.classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/2">
            <Label htmlFor="subject-filter">Filter by Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject-filter">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {/* Show subjects from filters (backend now always returns all relevant subjects) */}
                {filters.subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Exams</TabsTrigger>
            <TabsTrigger value="completed">Completed Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalExams}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.activeExams}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.completedExams}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.averageScore}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Recent Exams</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.slice(0, 5).map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.subject}</TableCell>
                      <TableCell>{exam.class}</TableCell>
                      <TableCell>{exam.teacher}</TableCell>
                      <TableCell>{exam.students}</TableCell>
                      <TableCell>{exam.avgScore}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={exam.status === "active" ? "default" : "secondary"}
                          className={
                            exam.status === "active"
                              ? "bg-green-500"
                              : exam.status === "scheduled"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                          }
                        >
                          {exam.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="active" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>{exam.class}</TableCell>
                    <TableCell>{exam.teacher}</TableCell>
                    <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={exam.status === "active" ? "default" : "secondary"}
                        className={
                          exam.status === "active"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }
                      >
                        {exam.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="completed" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Highest</TableHead>
                  <TableHead>Lowest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>{exam.class}</TableCell>
                    <TableCell>{exam.teacher}</TableCell>
                    <TableCell>{exam.students}</TableCell>
                    <TableCell>{exam.avgScore}%</TableCell>
                    <TableCell>{exam.highestScore}%</TableCell>
                    <TableCell>{exam.lowestScore}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
