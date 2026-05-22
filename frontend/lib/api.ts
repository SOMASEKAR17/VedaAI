export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Fetch all assignments from the backend
 */
export async function fetchAssignments(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments`);
    if (!res.ok) {
      throw new Error(`Failed to fetch assignments: ${res.statusText}`);
    }
    const result: ApiResponse<any[]> = await res.json();
    return result.success ? result.data || [] : [];
  } catch (error) {
    console.error("Error in fetchAssignments:", error);
    return [];
  }
}

/**
 * Fetch a single assignment's full details (with generation results if completed)
 */
export async function fetchAssignmentDetails(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch assignment details: ${res.statusText}`);
    }
    const result: ApiResponse<any> = await res.json();
    return result.success ? result.data || null : null;
  } catch (error) {
    console.error(`Error in fetchAssignmentDetails for ID ${id}:`, error);
    return null;
  }
}

/**
 * Submit a new assignment (multipart form-data)
 */
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
    console.error("Error in createAssignment API:", error);
    return { success: false, error: error.message || "Network error occurred while creating assignment" };
  }
}

/**
 * Request PDF generation and download it directly in browser
 */
export async function downloadPDF(assignmentId: string, title: string, withAnswerKey: boolean = false): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/results/${assignmentId}/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ withAnswerKey }),
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
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return false;
  }
}

/**
 * Delete an assignment from the database
 */
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
  } catch (error) {
    console.error(`Error in deleteAssignment for ID ${id}:`, error);
    return false;
  }
}

/**
 * Request questions regeneration for an assignment
 */
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
  } catch (error) {
    console.error(`Error in regenerateAssignment for ID ${id}:`, error);
    return false;
  }
}

