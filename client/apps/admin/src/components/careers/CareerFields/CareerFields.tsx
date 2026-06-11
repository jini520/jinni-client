import { forwardRef } from "react";
import { FormRow, FormField } from "@/components/common";

export interface CareerFieldsValue {
  company: string;
  department?: string;
  startDate: string;
  endDate?: string;
  position?: string;
}

export const CareerFields = forwardRef<
  HTMLInputElement,
  {
    value: CareerFieldsValue;
    onChange: (patch: Partial<CareerFieldsValue>) => void;
  }
>(({ value, onChange }, companyRef) => (
  <>
    <FormRow>
      <FormField label="회사명" required>
        <input
          ref={companyRef}
          type="text"
          value={value.company}
          onChange={(e) => onChange({ company: e.target.value })}
          placeholder="회사명 입력"
          required
        />
      </FormField>
      <FormField label="부서">
        <input
          type="text"
          value={value.department ?? ""}
          onChange={(e) => onChange({ department: e.target.value })}
          placeholder="부서명 입력"
        />
      </FormField>
    </FormRow>

    <FormRow>
      <FormField label="시작일" required>
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          required
        />
      </FormField>
      <FormField label="종료일 (비워두면 현재)">
        <input
          type="date"
          value={value.endDate ?? ""}
          onChange={(e) => onChange({ endDate: e.target.value })}
        />
      </FormField>
    </FormRow>

    <FormField label="직책">
      <input
        type="text"
        value={value.position ?? ""}
        onChange={(e) => onChange({ position: e.target.value })}
        placeholder="직책 입력"
      />
    </FormField>
  </>
));

CareerFields.displayName = "CareerFields";
