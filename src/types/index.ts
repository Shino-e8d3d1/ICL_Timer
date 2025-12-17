export type MedicineType = 'DEX' | 'Moxi' | 'Diclo';

export interface Medicine {
    id: MedicineType;
    name: string;
    description: string;
    color: string; // Tailwind class component or hex
}

export type SurgeryInfo = {
    date: string | null; // IPv4 ISO string 'YYYY-MM-DD'
    day0StartTime: string | null; // 'HH:mm'
};

export type ScheduleStatus = 'onboarding' | 'day0' | 'day1+' | 'complete';

export interface DailyLog {
    date: string; // 'YYYY-MM-DD'
    history: Array<{
        time: string; // ISO
        medicines: MedicineType[];
    }>;
    nextRotationIndex: number; // 0: DEX, 1: Moxi, 2: Diclo
}
