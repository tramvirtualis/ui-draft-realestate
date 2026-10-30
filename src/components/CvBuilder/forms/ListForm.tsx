import type { ReactNode } from "react";
import useSyncForm from "../../../hooks/job/useSyncForm";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { STEP_FORM_ID } from "./PersonalInfoForm";
import { wholeCardListeners } from "../dragListeners";

function SortableCard({
  id,
  title,
  onRemove,
  children,
}: {
  id: string;
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...wholeCardListeners(listeners)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`cursor-grab rounded-2xl border border-line bg-white p-4 active:cursor-grabbing ${
        isDragging ? "z-10 shadow-xl ring-2 ring-primary-200" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Kéo để sắp xếp: ${title}`}
          className="cursor-grab touch-none rounded p-1 text-muted hover:text-primary-600 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-heading">
          {title}
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Xóa: ${title}`}
          className="rounded p-1 text-muted hover:text-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface ListFormProps<T extends { id: string }> {
  schema: ZodType;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  addLabel: string;
  emptyText: string;
  itemTitle: (item: T, index: number) => string;
  // biome-ignore lint: form generic theo từng bước
  renderFields: (ctx: {
    index: number;
    prefix: string;
    form: UseFormReturn<any>;
  }) => ReactNode;
  onNext: () => void;
}

/** Form danh sách động: thêm / sửa / xóa / kéo thả sắp xếp. Mỗi bước dạng danh sách chỉ cần cấu hình. */
export default function ListForm<T extends { id: string }>({
  schema,
  items,
  onChange,
  createItem,
  addLabel,
  emptyText,
  itemTitle,
  renderFields,
  onNext,
}: ListFormProps<T>) {
  const form = useForm<{ items: T[] }>({
    resolver: zodResolver(schema as never),
    defaultValues: { items } as never,
    mode: "onChange",
  });
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items" as never,
    keyName: "_key",
  });
  useSyncForm(form, (v) => onChange((v.items ?? []).filter(Boolean) as T[]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const keys = fields.map((f) => (f as unknown as { _key: string })._key);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = keys.indexOf(String(active.id));
    const to = keys.indexOf(String(over.id));
    move(from, to);
    // đẩy thứ tự mới lên store (preview đổi theo ngay)
    onChange((form.getValues("items") ?? []) as T[]);
  };

  const current = useWatch({ control: form.control, name: "items" }) as
    | T[]
    | undefined;

  return (
    <form
      id={STEP_FORM_ID}
      noValidate
      onSubmit={form.handleSubmit(onNext)}
      className="space-y-3"
    >
      {fields.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-body">
          {emptyText}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={keys} strategy={verticalListSortingStrategy}>
          {fields.map((f, index) => (
            <SortableCard
              key={keys[index]}
              id={keys[index]}
              title={itemTitle((current?.[index] ?? f) as unknown as T, index)}
              onRemove={() => {
                remove(index);
                setTimeout(() =>
                  onChange((form.getValues("items") ?? []) as T[])
                );
              }}
            >
              {renderFields({ index, prefix: `items.${index}`, form })}
            </SortableCard>
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => append(createItem() as never)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-300 text-sm font-medium text-primary-600 transition hover:bg-primary-50"
      >
        <Plus size={16} aria-hidden /> {addLabel}
      </button>
    </form>
  );
}
