// ISO 날짜(YYYY-MM-DD)를 "YY.MM."로 축약
export const formatYYMM = (date?: string): string =>
  date ? `${date.slice(2, 7).replace("-", ".")}.` : "";

// 기간 표시: "{시작} ~ {종료|현재}" (시작 없으면 "-")
export const formatPeriod = (startDate?: string, endDate?: string): string => {
  if (!startDate) return "-";
  const end = endDate ? formatYYMM(endDate) : "현재";
  return `${formatYYMM(startDate)} ~ ${end}`;
};
