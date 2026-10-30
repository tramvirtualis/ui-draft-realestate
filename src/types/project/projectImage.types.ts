// Bám đúng ERD Project_Images: id, project_id, image_url, created_at
export interface ProjectImage {
  id: number;
  projectId: number;
  imageUrl: string;
  createdAt: string; // ISO
}
