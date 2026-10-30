import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { sectionTitle } from "./cvHelpers";
import { wholeCardListeners } from "./dragListeners";
import { useCvBuilder } from "./cvBuilderContext";
import type { CvSectionKey } from "../../types/job/cv.types";

function SortableRow({ id, label }: { id: string; label: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      {...wholeCardListeners(listeners)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex cursor-grab touch-none select-none items-center gap-2 rounded-lg bg-white px-2 py-2 text-sm active:cursor-grabbing ${
        isDragging ? "shadow-lg ring-1 ring-primary-200" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Kéo để sắp xếp: ${label}`}
        className="cursor-grab touch-none text-muted hover:text-primary-600"
      >
        <GripVertical size={15} />
      </button>
      {label}
    </li>
  );
}

/** Kéo thả để đổi thứ tự hiển thị các section trên CV */
export default function SectionOrderList() {
  const data = useCvBuilder((s) => s.data);
  const order = useCvBuilder((s) => s.style.sectionOrder);
  const setStyle = useCvBuilder((s) => s.setStyle);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setStyle({
      sectionOrder: arrayMove(
        order,
        order.indexOf(active.id as CvSectionKey),
        order.indexOf(over.id as CvSectionKey)
      ),
    });
  };

  return (
    <div className="mt-4 rounded-2xl bg-primary-50/60 p-3">
      <p className="mb-2 text-xs text-body">
        Kéo thả để đổi thứ tự hiển thị các mục trên CV.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {order.map((k) => (
              <SortableRow key={k} id={k} label={sectionTitle(k, data)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
