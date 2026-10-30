import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export default function useSyncForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  onChange: (values: T) => void
) {
  const ref = useRef(onChange);
  useEffect(() => {
    ref.current = onChange;
  });
  useEffect(() => {
    const sub = form.watch((values) => ref.current(values as T));
    return () => sub.unsubscribe();
  }, [form]);
}
