export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


export async function fetchAssignments(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments`);
    if (!res.ok) {
      throw new Error(`Failed to fetch assignments: ${res.statusText}`);
    }
    const result: ApiResponse<any[]> = await res.json();
    return result.success ? result.data || [] : [];
  } catch {
    return [];
  }
}


export async function fetchAssignmentDetails(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch assignment details: ${res.statusText}`);
    }
    const result: ApiResponse<any> = await res.json();
    return result.success ? result.data || null : null;
  } catch {
    return null;
  }
}


export async function createAssignment(formData: FormData): Promise<{ success: boolean; assignmentId?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "Failed to create assignment" };
    }

    return {
      success: true,
      assignmentId: data.assignmentId,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error occurred while creating assignment" };
  }
}


export async function downloadPDF(assignmentId: string, title: string, withAnswerKey: boolean = false, keptQuestionNumbers?: number[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/results/${assignmentId}/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ withAnswerKey, keptQuestionNumbers }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate PDF: ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const keySuffix = withAnswerKey ? "_with_answers" : "";
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}${keySuffix}_assessment.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  } catch {
    return false;
  }
}


export async function deleteAssignment(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Failed to delete assignment: ${res.statusText}`);
    }
    const result: ApiResponse = await res.json();
    return result.success;
  } catch {
    return false;
  }
}


export async function regenerateAssignment(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/regenerate`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error(`Failed to regenerate assignment: ${res.statusText}`);
    }
    const result: ApiResponse = await res.json();
    return result.success;
  } catch {
    return false;
  }
}

