export const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last quarter', 'This year'] as const;

export type DateRange = (typeof DATE_RANGES)[number];