// src/types/index.ts
export type Report = {
  id: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  submittedDate: string; // ISO 8601
  imageUrl?: string;
  location?: { latitude: number; longitude: number }; // Made optional
}