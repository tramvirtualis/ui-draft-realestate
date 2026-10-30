import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import SectionNotice from "../../../components/Admin/project/general/SectionNotice";
import PdfPagePicker from "../../../components/Admin/project/floorPlan/PdfPagePicker";
import {
  SalesSheetEditor,
  SalesSheetBuildingPicker,
  SalesSheetUploadDropzone,
  SalesSheetToolbar,
  SalesSheetPinSidebar,
  SalesSheetMarkingModal,
  SalesSheetEditPinModal,
  type SheetEditorPin,
  type SheetPin,
  type MarkingSubmitData,
  PIN_SCALE,
  formatSheetPrice,
  fundLabel,
} from "../../../components/Admin/project/salesSheet";
import { usePlanSize } from "../../../components/Project/Detail/floorPlan/planCoords";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { buildingService } from "../../../services/project/buildingService";
import { salesSheetService } from "../../../services/project/salesSheetService";
import { propertyService } from "../../../services/project/propertyService";
import { zoneApiService } from "../../../services/project/projectService";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import { openPdf } from "../../../utils/pdfToImage";
import { buildAndUploadTiles } from "../../../utils/pdfTiles";
import { excelFileToSvgFile } from "../../../utils/excelToSvg";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { BuildingDto } from "../../../types/project/building.types";
import type {
  SalesSheetDetail,
  SalesSheetPinInput,
  SalesSheetSummary,
} from "../../../types/project/salesSheet.types";
import type { Property } from "../../../types/project/property.types";
import type { FundType, ZoneDto } from "../../../types/project/project.types";

const MAX_IMAGE = 50 * 1024 * 1024;
const MAX_PDF = 100 * 1024 * 1024;
const MAX_EXCEL = 20 * 1024 * 1024;
const isExcel = (file: File) => /\.(xlsx|xlsm)$/i.test(file.name);

export default function SalesSheetsManagementPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Tải danh sách dự án
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const { projectId } = useSelectedProject(projects);
  const currentProject = projects.find((p) => p.id === projectId);
  const highRise = isHighRise(currentProject?.buildingType);

  // 2. Dữ liệu của dự án đang chọn
  const [buildings, setBuildings] = useState<BuildingDto[]>([]);
  const [zones, setZones] = useState<ZoneDto[]>([]);
  const [sheets, setSheets] = useState<SalesSheetSummary[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [, setDataLoading] = useState(false);

  // 3. Tòa nhà và bảng hàng đang thao tác
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [activeSheet, setActiveSheet] = useState<SalesSheetDetail | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  // 4. Trạng thái các ghim đã đánh dấu
  const [sheetPins, setSheetPins] = useState<SheetPin[]>([]);
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [pinScale, setPinScale] = useState(PIN_SCALE.default);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // 4b. Dấu quỹ đang chọn để đánh dấu (Mặc định Quỹ độc quyền)
  const [activeFundTool, setActiveFundTool] = useState<FundType | "UNCLASSIFIED">("EXCLUSIVE");

  // 4c. Modal xác nhận đánh dấu khi nhấp vào bản vẽ
  const [markingModal, setMarkingModal] = useState<{
    x: number;
    y: number;
    fundType: FundType | null;
  } | null>(null);
  const [creatingProperty, setCreatingProperty] = useState(false);

  // 4d. Modal sửa / xóa ghim khi click vào ghim trên bản đồ
  const [editingPin, setEditingPin] = useState<SheetPin | null>(null);
  const [editingPriceBillion, setEditingPriceBillion] = useState("");

  // 5. Upload & Cắt Tiles
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, setTiling] = useState<{ done: number; total: number } | null>(null);
  const [deletingSheet, setDeletingSheet] = useState(false);

  // Kích thước bản vẽ mặt bằng bảng hàng (dùng để vẽ Leaflet)
  const size = usePlanSize(activeSheet);

  // Tải danh sách dự án lúc khởi động
  useEffect(() => {
    let active = true;
    adminProjectService
      .list()
      .then((list) => {
        if (!active) return;
        setProjects(list);
      })
      .catch((e) => toast.show(getErrorMessage(e), "error"))
      .finally(() => {
        if (active) setProjectsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [toast]);

  // Tải toàn bộ tòa nhà, phân khu, bảng hàng và căn hộ của dự án
  const loadProjectData = useCallback(
    async (pid: number) => {
      setDataLoading(true);
      try {
        const [bList, zList, sList, pList] = await Promise.all([
          buildingService.list(pid),
          zoneApiService.getByProject(pid),
          salesSheetService.getListByProject(pid),
          propertyService.list(),
        ]);
        setBuildings(bList);
        setZones(zList);
        setSheets(sList);
        setAllProperties(pList);

        // Mặc định chọn tòa đầu tiên nếu chưa chọn tòa nào
        if (bList.length > 0) {
          setSelectedBuildingId((prev) => (bList.some((b) => b.id === prev) ? prev : bList[0].id));
        } else {
          setSelectedBuildingId(null);
        }
      } catch (e) {
        toast.show(getErrorMessage(e), "error");
      } finally {
        setDataLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (projectId === null || !highRise) return;
    loadProjectData(projectId);
  }, [projectId, highRise, loadProjectData]);

  // Tòa nhà đang chọn
  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId]
  );

  // Bảng hàng tóm tắt của tòa nhà đang chọn
  const currentSheetSummary = useMemo(
    () => (selectedBuildingId ? sheets.find((s) => s.buildingId === selectedBuildingId) : null),
    [sheets, selectedBuildingId]
  );

  // Danh sách các căn hộ thuộc riêng tòa nhà đang chọn
  const buildingProperties = useMemo(() => {
    if (!selectedBuildingId) return [];
    return allProperties.filter((p) => p.buildingId === selectedBuildingId);
  }, [allProperties, selectedBuildingId]);

  // Tải chi tiết bảng hàng khi đổi tòa hoặc khi đổi bảng hàng
  useEffect(() => {
    if (!currentSheetSummary) {
      setActiveSheet(null);
      setSheetPins([]);
      setDirty(false);
      setSelectedPinId(null);
      return;
    }
    let active = true;
    setSheetLoading(true);
    salesSheetService
      .getById(currentSheetSummary.id)
      .then((detail) => {
        if (!active) return;
        setActiveSheet(detail);
        setPinScale(detail.pinScale || PIN_SCALE.default);

        // Nạp các ghim từ API
        const loadedPins: SheetPin[] = (detail.pins ?? []).map((p) => ({
          propertyId: p.propertyId,
          code: p.propertyCode || `#${p.propertyId}`,
          fundType: p.fundType ?? null,
          x: p.x,
          y: p.y,
          price: p.price,
        }));
        setSheetPins(loadedPins);
        setDirty(false);
      })
      .catch((e) => toast.show(getErrorMessage(e), "error"))
      .finally(() => {
        if (active) setSheetLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentSheetSummary, toast]);

  // Chuyển sheetPins sang mảng SheetEditorPin cho SalesSheetEditor
  const editorPins: SheetEditorPin[] = useMemo(() => {
    return sheetPins.map((p) => {
      const prop = allProperties.find((item) => item.id === p.propertyId);
      const effectivePrice = p.price ?? prop?.price ?? null;
      return {
        id: p.propertyId,
        code: p.code,
        price: effectivePrice,
        priceLabel: formatSheetPrice(effectivePrice) || p.code,
        fundType: p.fundType,
        x: p.x,
        y: p.y,
      };
    });
  }, [sheetPins, allProperties]);

  // Thao tác tạo bảng hàng cho tòa nhà
  const handleCreateSheet = async () => {
    if (!projectId || !selectedBuilding) return null;
    try {
      setDataLoading(true);
      const created = await salesSheetService.create({
        projectId,
        buildingId: selectedBuilding.id,
        zoneId: selectedBuilding.zoneId,
        code: selectedBuilding.name,
        name: `Bảng hàng ${selectedBuilding.name}`,
        status: "OPENING",
      });
      toast.show(`Đã tạo bảng hàng cho tòa ${selectedBuilding.name}`);
      await loadProjectData(projectId);
      return created;
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
      return null;
    } finally {
      setDataLoading(false);
    }
  };

  // Excel: vẽ lại sheet đầu tiên thành ảnh vector SVG (giống hệt Excel, phóng to vẫn nét) rồi tải lên như ảnh
  const handleExcelPicked = async (file: File) => {
    setUploading(true);
    let svg: File;
    try {
      svg = await excelFileToSvgFile(file);
    } catch (e) {
      toast.show(`Không đọc được file Excel: ${e instanceof Error ? e.message : getErrorMessage(e)}`, "error");
      setUploading(false);
      return;
    }
    await handleUploadFile(svg);
  };

  // Thao tác chọn file Excel / ảnh / PDF
  const handleFilePicked = (file?: File) => {
    if (!file) return;
    if (isExcel(file)) {
      if (file.size > MAX_EXCEL) {
        toast.show("File Excel tối đa 20 MB", "error");
        return;
      }
      void handleExcelPicked(file);
      return;
    }
    if (/\.xls$/i.test(file.name)) {
      toast.show("File .xls đời cũ chưa hỗ trợ, vui lòng mở bằng Excel và lưu lại dạng .xlsx", "error");
      return;
    }
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      if (file.size > MAX_PDF) {
        toast.show("File PDF tối đa 100 MB", "error");
        return;
      }
      setPdfFile(file);
      return;
    }
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) {
      toast.show("Chỉ nhận file Excel (.xlsx), ảnh (tối đa 50 MB) hoặc file PDF (tối đa 100 MB)", "error");
      return;
    }
    void handleUploadFile(file);
  };

  // Upload file lên Cloudinary
  const handleUploadFile = async (
    image: File | null,
    pdf?: { file: File; page: number }
  ) => {
    if (!selectedBuilding || !projectId) return;

    let targetSheetId = activeSheet?.id;
    // Nếu chưa tạo bảng hàng cho tòa -> Tự động tạo trước khi upload
    if (!targetSheetId) {
      const newSheet = await handleCreateSheet();
      if (!newSheet) return;
      targetSheetId = newSheet.id;
    }

    setUploading(true);
    try {
      const saved = await salesSheetService.saveImage(
        targetSheetId,
        image,
        pdf?.file,
        pdf?.page
      );
      setActiveSheet(saved);
      if (saved.pdfWarning) {
        toast.show(saved.pdfWarning, "error");
      } else {
        toast.show("Đã cập nhật bản vẽ bảng hàng");
      }
      // Nếu có PDF -> Tự động cắt lát tiles để zoom mượt mà
      if (pdf) {
        await handleTileUp(saved.id, pdf.file, pdf.page);
      }
      await loadProjectData(projectId);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setUploading(false);
    }
  };

  // Cắt ô ảnh Deep Zoom
  const handleTileUp = async (sheetId: number, file: File, page: number) => {
    setTiling({ done: 0, total: 0 });
    try {
      const doc = await openPdf(file);
      const info = await buildAndUploadTiles({
        pdf: doc,
        page,
        upload: (version, batch) =>
          salesSheetService.uploadTiles(sheetId, version, batch),
        onProgress: (done, total) => setTiling({ done, total }),
      });
      const withTiles = await salesSheetService.saveTileSet(sheetId, info);
      setActiveSheet(withTiles);
      toast.show("Đã cắt và tối ưu các ô ảnh bảng hàng");
    } catch (e) {
      toast.show(
        `Không cắt được ô ảnh, bảng hàng vẫn dùng bản PDF: ${getErrorMessage(e)}`,
        "error"
      );
    } finally {
      setTiling(null);
    }
  };

  // Kéo di chuyển vị trí ghim
  const handleMovePin = (id: number, x: number, y: number) => {
    setSheetPins((prev) =>
      prev.map((p) => (p.propertyId === id ? { ...p, x, y } : p))
    );
    setDirty(true);
  };

  // Mở dialog sửa ghim & giá bán
  const openEditingPin = (pin: SheetPin) => {
    const prop = allProperties.find((item) => item.id === pin.propertyId);
    const pPrice = pin.price ?? prop?.price ?? null;
    let priceStr = "";
    if (pPrice && pPrice > 0) {
      if (pPrice >= 1_000_000_000) {
        priceStr = (pPrice / 1_000_000_000)
          .toFixed(2)
          .replace(/\.00$/, "")
          .replace(/(\.[1-9])0$/, "$1");
      } else if (pPrice < 1000) {
        priceStr = String(pPrice);
      }
    }
    setEditingPriceBillion(priceStr);
    setEditingPin(pin);
  };

  // Nhấp vào một ghim đã có trên bản đồ
  const handleSelectPin = (id: number) => {
    setSelectedPinId(id);
    const pin = sheetPins.find((p) => p.propertyId === id);
    if (!pin) return;

    // Nếu đang cầm bút quỹ khác: Đổi ngay loại quỹ của ghim đó sang bút đang cầm!
    const toolFund = activeFundTool === "UNCLASSIFIED" ? null : activeFundTool;
    if (toolFund !== pin.fundType) {
      setSheetPins((prev) =>
        prev.map((p) => (p.propertyId === id ? { ...p, fundType: toolFund } : p))
      );
      setDirty(true);
      toast.show(`Đã đổi căn ${pin.code} sang ${fundLabel(toolFund)}`);
      return;
    }

    // Nếu bấm lại chính ghim đó: Mở dialog sửa ghim
    openEditingPin(pin);
  };

  // Gỡ / xóa một ghim
  const handleRemovePin = (propertyId: number) => {
    setSheetPins((prev) => prev.filter((p) => p.propertyId !== propertyId));
    if (selectedPinId === propertyId) setSelectedPinId(null);
    if (editingPin?.propertyId === propertyId) setEditingPin(null);
    setDirty(true);
    toast.show("Đã gỡ ghim");
  };

  // Bấm lên bản vẽ để đánh dấu căn hộ
  const handlePlaceOnMap = (x: number, y: number) => {
    setMarkingModal({
      x,
      y,
      fundType: activeFundTool === "UNCLASSIFIED" ? null : activeFundTool,
    });
  };

  // Xác nhận tạo ghim từ modal đánh dấu
  const handleConfirmMark = async (data: MarkingSubmitData) => {
    if (!markingModal || !projectId || !selectedBuilding) return;

    const numBillion = parseFloat(data.priceBillion.replace(",", "."));
    const priceVnd =
      !isNaN(numBillion) && numBillion > 0
        ? Math.round(numBillion * 1_000_000_000)
        : null;

    // NHÁNH 1: CHỌN CĂN CÓ SẴN TRONG TÒA NHÀ
    if (data.mode === "SELECT_EXISTING") {
      if (!data.propertyId) {
        toast.show("Vui lòng chọn một căn hộ có sẵn trong tòa nhà", "error");
        return;
      }

      let prop = allProperties.find((p) => p.id === data.propertyId);
      if (!prop) {
        toast.show("Không tìm thấy thông tin căn hộ đã chọn", "error");
        return;
      }

      const alreadyPinned = sheetPins.find((p) => p.propertyId === prop!.id);
      if (alreadyPinned) {
        toast.show(`Căn ${prop.propertyCode} đã được ghim trên bảng hàng này rồi`, "error");
        return;
      }

      if (priceVnd !== null && priceVnd !== prop.price) {
        setCreatingProperty(true);
        try {
          const updated = await propertyService.update(prop.id, {
            ...prop,
            price: priceVnd,
            buildingId: selectedBuilding.id,
          });
          setAllProperties((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          prop = updated;
        } catch (e) {
          toast.show(getErrorMessage(e), "error");
          setCreatingProperty(false);
          return;
        }
        setCreatingProperty(false);
      }

      const finalPrice = priceVnd ?? prop.price;
      const newPin: SheetPin = {
        propertyId: prop.id,
        code: prop.propertyCode,
        fundType: data.fundType,
        x: markingModal.x,
        y: markingModal.y,
        floor: prop.floor,
        axis: prop.axis,
        price: finalPrice,
      };

      setSheetPins((prev) => [...prev, newPin]);
      setDirty(true);
      setMarkingModal(null);
      const displayLabel = formatSheetPrice(finalPrice) || prop.propertyCode;
      toast.show(
        `Đã gán căn ${prop.propertyCode} (${displayLabel} - ${fundLabel(data.fundType)}) vào ô bảng hàng`
      );
      return;
    }

    // NHÁNH 2: TẠO CĂN MỚI
    const code = data.code.trim();
    if (!code) {
      toast.show("Vui lòng nhập mã căn hộ mới", "error");
      return;
    }

    const alreadyPinned = sheetPins.find(
      (p) => p.code.toLowerCase() === code.toLowerCase()
    );
    if (alreadyPinned) {
      toast.show(`Căn ${code} đã được ghim trên bảng hàng này rồi`, "error");
      return;
    }

    setCreatingProperty(true);
    try {
      let prop = allProperties.find(
        (p) =>
          p.propertyCode.toLowerCase() === code.toLowerCase() &&
          (p.buildingId === selectedBuilding.id || p.zoneId === selectedBuilding.zoneId)
      );

      if (!prop) {
        const parsedFloor = data.floor ? parseInt(data.floor, 10) : 1;
        const parsedArea = parseFloat(data.area.replace(",", "."));
        prop = await propertyService.create({
          zoneId: selectedBuilding.zoneId,
          buildingId: selectedBuilding.id,
          propertyCode: code,
          area: !isNaN(parsedArea) && parsedArea > 0 ? parsedArea : 50,
          price: priceVnd ?? 1,
          direction: "Đông",
          floor: isNaN(parsedFloor) ? 1 : parsedFloor,
          axis: code,
          bedrooms: 2,
          status: "available",
          type: "Căn hộ",
          constructionArea: null,
          prepaymentDiscountRate: null,
          loanPrice: null,
          pricingSheet: "",
          layoutUrl: "",
          salesPolicyEffectiveDate: "",
          salesPolicySummaryUrl: "",
          salesPolicyDetailUrl: "",
          gift: "",
          handoverStandard: "",
          propertyInventoryType: "Sơ cấp",
        });
        setAllProperties((prev) => [...prev, prop!]);
      } else {
        const needsPriceUpdate = priceVnd !== null && priceVnd !== prop.price;
        const needsBuildingAssign = !prop.buildingId;
        if (needsPriceUpdate || needsBuildingAssign) {
          const updated = await propertyService.update(prop.id, {
            ...prop,
            price: priceVnd ?? prop.price,
            buildingId: selectedBuilding.id,
          });
          setAllProperties((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          prop = updated;
        }
      }

      const finalPrice = priceVnd ?? prop.price;
      const newPin: SheetPin = {
        propertyId: prop.id,
        code: prop.propertyCode,
        fundType: data.fundType,
        x: markingModal.x,
        y: markingModal.y,
        floor: prop.floor,
        axis: prop.axis,
        price: finalPrice,
      };

      setSheetPins((prev) => [...prev, newPin]);
      setDirty(true);
      setMarkingModal(null);
      const displayLabel = formatSheetPrice(finalPrice) || code;
      toast.show(
        `Đã tạo mới và đánh dấu ô ${displayLabel} (Căn ${code} - ${fundLabel(data.fundType)})`
      );
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setCreatingProperty(false);
    }
  };

  // Cập nhật giá & loại quỹ khi sửa ghim
  const handleSaveEditingPin = async (
    propertyId: number,
    fundType: FundType | null,
    priceBillion: string
  ) => {
    const numB = parseFloat(priceBillion.replace(",", "."));
    const newPriceVnd =
      !isNaN(numB) && numB > 0 ? Math.round(numB * 1_000_000_000) : null;

    const prop = allProperties.find((x) => x.id === propertyId);
    const existingPin = sheetPins.find((p) => p.propertyId === propertyId);
    const finalPrice = newPriceVnd ?? existingPin?.price ?? null;

    setSheetPins((prev) =>
      prev.map((p) =>
        p.propertyId === propertyId
          ? { ...p, price: finalPrice, fundType }
          : p
      )
    );
    setDirty(true);

    if (prop && newPriceVnd !== null && newPriceVnd !== prop.price) {
      try {
        const updated = await propertyService.update(prop.id, {
          ...prop,
          price: newPriceVnd,
        });
        setAllProperties((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );
      } catch (e) {
        toast.show(getErrorMessage(e), "error");
      }
    }

    setEditingPin(null);
    toast.show(`Đã cập nhật căn ${existingPin?.code}`);
  };

  // Lưu toàn bộ danh sách ghim vào hệ thống
  const handleSavePins = async () => {
    if (!activeSheet) return;
    setSaving(true);
    try {
      const pinInputs: SalesSheetPinInput[] = sheetPins.map((p) => ({
        propertyId: p.propertyId,
        fundType: p.fundType,
        x: p.x,
        y: p.y,
      }));
      const updated = await salesSheetService.savePins(
        activeSheet.id,
        pinInputs,
        pinScale
      );
      setActiveSheet(updated);
      setDirty(false);
      toast.show("Đã lưu vị trí ghim bảng hàng thành công!");
      if (projectId) await loadProjectData(projectId);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  // Xóa bảng hàng của tòa
  const handleDeleteSheet = async () => {
    if (!activeSheet || !projectId) return;
    try {
      setDataLoading(true);
      await salesSheetService.delete(activeSheet.id);
      toast.show("Đã xóa bảng hàng");
      setDeletingSheet(false);
      setActiveSheet(null);
      setSheetPins([]);
      setDirty(false);
      await loadProjectData(projectId);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setDataLoading(false);
    }
  };

  // Đếm số lượng theo từng loại quỹ
  const fundCounts = useMemo(() => {
    const counts = {
      EXCLUSIVE: 0,
      HIDDEN_CROSS: 0,
      BONUS: 0,
      UNCLASSIFIED: 0,
    };
    sheetPins.forEach((p) => {
      if (p.fundType === "EXCLUSIVE") counts.EXCLUSIVE++;
      else if (p.fundType === "HIDDEN_CROSS") counts.HIDDEN_CROSS++;
      else if (p.fundType === "BONUS") counts.BONUS++;
      else counts.UNCLASSIFIED++;
    });
    return counts;
  }, [sheetPins]);

  // Danh sách căn hộ chưa ghim trong tòa (dùng gợi ý nhanh)
  const unpinnedSuggestions = useMemo(() => {
    const usedCodes = new Set(sheetPins.map((p) => p.code.toLowerCase()));
    return buildingProperties.filter(
      (p) => !usedCodes.has(p.propertyCode.toLowerCase())
    );
  }, [buildingProperties, sheetPins]);

  return (
    <div className="animate-page-in">
      <AdminPageHeader
        soft
        breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý bảng hàng" }]}
        title="Quản lý bảng hàng"
      />

      {/* Thanh chọn dự án */}
      {projectId !== null && <ProjectManageBar projectId={projectId} />}

      <div className="space-y-6 px-4 pb-12 md:px-8">
        {/* Thông báo nếu không phải dự án cao tầng */}
        {projectId && !highRise && !projectsLoading && (
          <SectionNotice
            icon={FileSpreadsheet}
            title="Dự án không có bảng hàng theo tòa"
            desc="Chức năng Bảng hàng ma trận theo từng tòa nhà chỉ áp dụng cho Dự án Cao tầng."
          />
        )}

        {/* 1. KHUNG CHỌN TÒA NHÀ QUẢN LÝ BẢNG HÀNG */}
        <SalesSheetBuildingPicker
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          sheets={sheets}
          onSelectBuilding={(id) => setSelectedBuildingId(id)}
        />

        {/* 2. NỘI DUNG BẢNG HÀNG CỦA TÒA ĐANG CHỌN */}
        {selectedBuilding && (
          <>
            {/* TRƯỜNG HỢP: TÒA CHƯA CÓ BẢN VẼ HOẶC ĐANG TẢI */}
            {sheetLoading ? (
              <div className="flex h-96 items-center justify-center rounded-2xl border border-line bg-white">
                <Loader2 size={32} className="animate-spin text-primary-600" />
              </div>
            ) : !activeSheet?.imageUrl && !activeSheet?.pdfUrl ? (
              /* KHUNG TẢI BẢN VẼ LÊN */
              <SalesSheetUploadDropzone
                buildingName={selectedBuilding.name}
                uploading={uploading}
                onUploadClick={() => fileInputRef.current?.click()}
              />
            ) : (
              /* TRƯỜNG HỢP: ĐÃ CÓ BẢN VẼ -> GIAO DIỆN ĐÁNH DẤU CÁC DẤU QUỸ VÀ LƯU VỊ TRÍ */
              <div className="space-y-4">
                {/* 3. THANH CÔNG CỤ DẤU QUỸ */}
                <SalesSheetToolbar
                  activeFundTool={activeFundTool}
                  onSelectFundTool={setActiveFundTool}
                  pinScale={pinScale}
                  onChangePinScale={(scale) => {
                    setPinScale(scale);
                    setDirty(true);
                  }}
                  uploading={uploading}
                  onChangePlanClick={() => fileInputRef.current?.click()}
                  onDeleteSheetClick={() => setDeletingSheet(true)}
                  saving={saving}
                  dirty={dirty}
                  onSavePins={handleSavePins}
                />

                {/* KHU VỰC BIÊN TẬP: TRÁI LÀ BẢN ĐỒ, PHẢI LÀ DANH SÁCH GHIM */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  {/* Cột trái: SalesSheetEditor */}
                  <div className="lg:col-span-8 xl:col-span-9">
                    {size === "error" ? (
                      <div className="flex h-[620px] items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6 text-center text-sm text-red-600">
                        Không thể đọc kích thước bản vẽ bảng hàng. Vui lòng tải lại ảnh/PDF.
                      </div>
                    ) : !size ? (
                      <div className="flex h-[620px] items-center justify-center rounded-2xl border border-line bg-white">
                        <Loader2 size={32} className="animate-spin text-primary-600" />
                      </div>
                    ) : (
                      <SalesSheetEditor
                        imageUrl={activeSheet?.imageUrl}
                        pdfUrl={activeSheet?.pdfUrl}
                        pdfPage={activeSheet?.pdfPage}
                        pdfMode={size.mode}
                        pdfDensity={size.density}
                        pdfTiles={
                          activeSheet?.tileBaseUrl
                            ? {
                                baseUrl: activeSheet.tileBaseUrl,
                                levels: activeSheet.tileLevels ?? 3,
                              }
                            : undefined
                        }
                        width={size.width}
                        height={size.height}
                        pins={editorPins}
                        activeId={selectedPinId}
                        onPlace={handlePlaceOnMap}
                        onMove={handleMovePin}
                        onSelect={handleSelectPin}
                        pinScale={pinScale}
                      />
                    )}
                  </div>

                  {/* Cột phải: Danh sách các ghim đã đánh dấu */}
                  <SalesSheetPinSidebar
                    sheetPins={sheetPins}
                    selectedPinId={selectedPinId}
                    onSelectPin={(id) => setSelectedPinId(id)}
                    onOpenEditPin={openEditingPin}
                    onChangePinFund={(id, fund) => {
                      setSheetPins((prev) =>
                        prev.map((p) => (p.propertyId === id ? { ...p, fundType: fund } : p))
                      );
                      setDirty(true);
                    }}
                    onRemovePin={handleRemovePin}
                    fundCounts={fundCounts}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input chọn file ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          handleFilePicked(e.target.files?.[0]);
          e.target.value = ""; // chọn lại đúng file vừa chọn vẫn tải lên được
        }}
      />

      {/* MODAL ĐÁNH DẤU Ô MA TRẬN BẢNG HÀNG KHI CLICK TRÊN BẢN VẼ */}
      <SalesSheetMarkingModal
        modalData={markingModal}
        buildingName={selectedBuilding?.name}
        unpinnedSuggestions={unpinnedSuggestions}
        creatingProperty={creatingProperty}
        onClose={() => setMarkingModal(null)}
        onConfirm={handleConfirmMark}
      />

      {/* MODAL SỬA GHIM KHI BẤM VÀO GHIM */}
      <SalesSheetEditPinModal
        pin={editingPin}
        initialPriceBillion={editingPriceBillion}
        onClose={() => setEditingPin(null)}
        onRemove={handleRemovePin}
        onSave={handleSaveEditingPin}
      />

      {/* MODAL CHỌN TRANG PDF (NẾU TẢI LÊN FILE PDF) */}
      {pdfFile && (
        <PdfPagePicker
          file={pdfFile}
          onConfirm={(result) => {
            setPdfFile(null);
            void handleUploadFile(null, { file: result.pdf, page: result.page });
          }}
          onClose={() => setPdfFile(null)}
        />
      )}

      {/* DIALOG XÁC NHẬN XÓA BẢNG HÀNG */}
      {deletingSheet && (
        <ConfirmDialog
          title={`Xóa bảng hàng tòa ${selectedBuilding?.name}?`}
          message="Toàn bộ bản vẽ ma trận và vị trí ghim các căn của tòa nhà này sẽ bị xóa. Dữ liệu căn hộ trong hệ thống vẫn được giữ nguyên."
          onConfirm={handleDeleteSheet}
          onClose={() => setDeletingSheet(false)}
        />
      )}
    </div>
  );
}
