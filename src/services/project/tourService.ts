import { authHttp, publicHttp } from "../../api/http";
import type { TourDto, TourHotspotDto, TourHotspotInput, TourSceneDto, TourSceneInput, TourValidation } from "../../types/project/tour.types";

// Ảnh panorama lớn (tới 40MB) cần nhiều thời gian tải lên hơn mặc định
const PANORAMA_UPLOAD = { timeout: 180000 };

const toForm = (fields: Record<string, string | number | boolean | null | undefined>, file?: File | null) => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
  });
  if (file) form.append("image", file);
  return form;
};

// ----- Khách: chỉ tour đã xuất bản -----
async function getPublished(projectId: number): Promise<TourDto[]> {
  return (await publicHttp.get<TourDto[]>("/tours", { params: { projectId } })) ?? [];
}

async function getPublishedTour(id: number): Promise<TourDto> {
  return publicHttp.get<TourDto>(`/tours/${id}`);
}

// ----- Admin -----
async function list(projectId: number): Promise<TourDto[]> {
  return (await authHttp.get<TourDto[]>("/admin/tours", { params: { projectId } })) ?? [];
}

async function get(id: number): Promise<TourDto> {
  return authHttp.get<TourDto>(`/admin/tours/${id}`);
}

async function create(projectId: number, title: string, description: string): Promise<TourDto> {
  return authHttp.post<TourDto>("/admin/tours", { projectId, title, description });
}

async function update(id: number, input: { title: string; description: string | null; entrySceneId?: number | null }): Promise<TourDto> {
  return authHttp.put<TourDto>(`/admin/tours/${id}`, input);
}

async function remove(id: number): Promise<void> {
  await authHttp.delete(`/admin/tours/${id}`);
}

async function validate(id: number): Promise<TourValidation> {
  return authHttp.get<TourValidation>(`/admin/tours/${id}/validate`);
}

async function publish(id: number): Promise<TourDto> {
  return authHttp.put<TourDto>(`/admin/tours/${id}/publish`);
}

async function unpublish(id: number): Promise<TourDto> {
  return authHttp.put<TourDto>(`/admin/tours/${id}/unpublish`);
}

async function addScene(tourId: number, input: TourSceneInput, image: File): Promise<TourSceneDto> {
  return authHttp.post<TourSceneDto>(`/admin/tours/${tourId}/scenes`, toForm({ ...input }, image), PANORAMA_UPLOAD);
}

async function updateScene(sceneId: number, input: TourSceneInput, image?: File | null): Promise<TourSceneDto> {
  return authHttp.put<TourSceneDto>(`/admin/tour-scenes/${sceneId}`, toForm({ ...input }, image), PANORAMA_UPLOAD);
}

async function removeScene(sceneId: number): Promise<void> {
  await authHttp.delete(`/admin/tour-scenes/${sceneId}`);
}

async function reorderScenes(tourId: number, sceneIds: number[]): Promise<void> {
  await authHttp.put(`/admin/tours/${tourId}/scenes/order`, sceneIds);
}

async function addHotspot(sceneId: number, input: TourHotspotInput, image?: File | null): Promise<TourHotspotDto> {
  return authHttp.post<TourHotspotDto>(`/admin/tour-scenes/${sceneId}/hotspots`, toForm({ ...input }, image));
}

async function updateHotspot(id: number, input: TourHotspotInput, image?: File | null): Promise<TourHotspotDto> {
  return authHttp.put<TourHotspotDto>(`/admin/tour-hotspots/${id}`, toForm({ ...input }, image));
}

async function removeHotspot(id: number): Promise<void> {
  await authHttp.delete(`/admin/tour-hotspots/${id}`);
}

export const tourService = { getPublished, getPublishedTour };
export const adminTourService = {
  list, get, create, update, remove, validate, publish, unpublish,
  addScene, updateScene, removeScene, reorderScenes, addHotspot, updateHotspot, removeHotspot,
};
