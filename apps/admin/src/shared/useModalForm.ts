import { useEffect, useRef, useState } from "react";

// 모달이 열릴 때 폼을 시드하고 첫 입력에 자동 포커스한다.
// makeSeed는 매 렌더 새 클로저이므로 열림(open) 시점에만 호출한다.
export const useModalForm = <T>(open: boolean, makeSeed: () => T) => {
  const [form, setForm] = useState<T>(makeSeed);
  const focusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(makeSeed());
    const timer = setTimeout(() => focusRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  return { form, setForm, focusRef };
};
