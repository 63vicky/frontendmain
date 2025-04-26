import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { teacherApi } from '@/lib/api'
import { Teacher } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface TeacherSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TeacherSelect({ value, onChange, className }: TeacherSelectProps) {
  const [open, setOpen] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true)
        const data = await teacherApi.getAllTeachers()
        // Filter only active teachers
        const activeTeachers = data.filter(teacher => teacher.status === 'active')
        setTeachers(activeTeachers)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load teachers",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadTeachers()
  }, [toast])

  const selectedTeacher = teachers.find(teacher => teacher._id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={loading}
        >
          {loading ? (
            "Loading teachers..."
          ) : selectedTeacher ? (
            selectedTeacher.name
          ) : (
            "Select class teacher..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search teacher..." />
          <CommandEmpty>No teacher found.</CommandEmpty>
          <CommandGroup>
            {teachers.map((teacher) => (
              <CommandItem
                key={teacher._id}
                value={teacher._id}
                onSelect={() => {
                  onChange(teacher._id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === teacher._id ? "opacity-100" : "opacity-0"
                  )}
                />
                {teacher.name} ({teacher.subject})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 