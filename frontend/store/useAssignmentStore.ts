import { create } from "zustand";
import { fetchAssignments } from "@/lib/api";

export interface QuestionTypeRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export type Difficulty = "easy" | "medium" | "hard" | "mixed";

interface AssignmentState {
  title: string;
  subject: string;
  gradeLevel: string;
  difficulty: Difficulty;
  file: File | null;
  fileName: string | null;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  additionalInfo: string;

  errors: Record<string, string>;
  isSubmittedOnce: boolean;

  assignments: any[];

  setTitle: (title: string) => void;
  setSubject: (subject: string) => void;
  setGradeLevel: (gradeLevel: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setFile: (file: File | null) => void;
  setFileName: (name: string | null) => void;
  setDueDate: (date: string) => void;
  setAssignments: (assignments: any[]) => void;

  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, type: string) => void;
  incrementQuestionCount: (id: string) => void;
  decrementQuestionCount: (id: string) => void;
  incrementQuestionMarks: (id: string) => void;
  decrementQuestionMarks: (id: string) => void;
  setAdditionalInfo: (text: string) => void;

  validateForm: () => boolean;
  resetForm: () => void;
  loadAssignments: () => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  title: "",
  subject: "",
  gradeLevel: "",
  difficulty: "medium",
  file: null,
  fileName: null,
  dueDate: "",
  questionTypes: [],
  additionalInfo: "",
  errors: {},
  isSubmittedOnce: false,
  assignments: [],

  setTitle: (title) => {
    set({ title });
    if (get().isSubmittedOnce) get().validateForm();
  },

  setSubject: (subject) => {
    set({ subject });
    if (get().isSubmittedOnce) get().validateForm();
  },

  setGradeLevel: (gradeLevel) => {
    set({ gradeLevel });
    if (get().isSubmittedOnce) get().validateForm();
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
  },

  setFile: (file) => {
    set({ file, fileName: file ? file.name : null });
  },

  setFileName: (fileName) => {
    set({ fileName });
  },

  setDueDate: (dueDate) => {
    set({ dueDate });
    if (get().isSubmittedOnce) get().validateForm();
  },

  setAssignments: (assignments) => {
    set({ assignments });
  },

  addQuestionType: () => {
    const newId = String(Date.now());
    const currentTypes = get().questionTypes;
    const newRow = {
      id: newId,
      type: "Multiple Choice Questions",
      count: 5,
      marks: 1,
    };
    set({ questionTypes: [...currentTypes, newRow] });
    if (get().isSubmittedOnce) get().validateForm();
  },

  removeQuestionType: (id) => {
    const filtered = get().questionTypes.filter((row) => row.id !== id);
    set({ questionTypes: filtered });
    if (get().isSubmittedOnce) get().validateForm();
  },

  updateQuestionType: (id, type) => {
    const updated = get().questionTypes.map((row) =>
      row.id === id ? { ...row, type } : row
    );
    set({ questionTypes: updated });
    if (get().isSubmittedOnce) get().validateForm();
  },

  incrementQuestionCount: (id) => {
    const updated = get().questionTypes.map((row) =>
      row.id === id ? { ...row, count: row.count + 1 } : row
    );
    set({ questionTypes: updated });
    if (get().isSubmittedOnce) get().validateForm();
  },

  decrementQuestionCount: (id) => {
    const updated = get().questionTypes.map((row) =>
      row.id === id ? { ...row, count: Math.max(0, row.count - 1) } : row
    );
    set({ questionTypes: updated });
    if (get().isSubmittedOnce) get().validateForm();
  },

  incrementQuestionMarks: (id) => {
    const updated = get().questionTypes.map((row) =>
      row.id === id ? { ...row, marks: row.marks + 1 } : row
    );
    set({ questionTypes: updated });
    if (get().isSubmittedOnce) get().validateForm();
  },

  decrementQuestionMarks: (id) => {
    const updated = get().questionTypes.map((row) =>
      row.id === id ? { ...row, marks: Math.max(0, row.marks - 1) } : row
    );
    set({ questionTypes: updated });
    if (get().isSubmittedOnce) get().validateForm();
  },

  setAdditionalInfo: (text) => set({ additionalInfo: text }),

  validateForm: () => {
    set({ isSubmittedOnce: true });
    const { title, subject, gradeLevel, dueDate, questionTypes } = get();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Assignment title is required";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!gradeLevel.trim()) {
      newErrors.gradeLevel = "Grade level is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selectedDate.getTime()) || selectedDate <= today) {
        newErrors.dueDate = "Due date must be a valid future date";
      }
    }

    if (questionTypes.length === 0) {
      newErrors.questionTypes = "Please add at least one question type configuration";
    } else {
      questionTypes.forEach((row) => {
        if (row.count <= 0) {
          newErrors[`count_${row.id}`] = "Number of questions must be greater than 0";
        }
        if (row.marks <= 0) {
          newErrors[`marks_${row.id}`] = "Marks per question must be greater than 0";
        }
      });
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  resetForm: () => {
    set({
      title: "",
      subject: "",
      gradeLevel: "",
      difficulty: "medium",
      file: null,
      fileName: null,
      dueDate: "",
      questionTypes: [],
      additionalInfo: "",
      errors: {},
      isSubmittedOnce: false,
    });
  },

  loadAssignments: async () => {
    const list = await fetchAssignments();
    set({ assignments: list });
  },
}));
