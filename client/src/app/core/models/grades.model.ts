export interface GradeRecordDto {
  id: string;
  studentProfileId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  score?: number;
  letterGrade?: string;
  maxScore?: number;
  assessmentType?: string;
  notes?: string;
  recordedDate: string;
}

export interface CreateGradeRecordRequest {
  studentProfileId: string;
  subjectId: string;
  semesterId: string;
  score?: number;
  letterGrade?: string;
  maxScore?: number;
  assessmentType?: string;
  notes?: string;
}

export interface BehaviorFeedbackDto {
  id: string;
  studentProfileId: string;
  studentName: string;
  category: string;
  description?: string;
  rating?: number;
  recordedDate: string;
}

export interface CreateBehaviorFeedbackRequest {
  studentProfileId: string;
  semesterId: string;
  category: string;
  description?: string;
  rating?: number;
}
