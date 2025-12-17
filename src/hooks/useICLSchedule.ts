"use client";

import { useState, useEffect } from 'react';
import { differenceInCalendarDays, format, addHours, parseISO, isSameDay } from 'date-fns';
import { MedicineType, ScheduleStatus, SurgeryInfo } from '@/types';

const STORAGE_KEY = 'icl-eye-care-data';

interface StoredData {
    surgeryInfo: SurgeryInfo;
    lastDropTime: string | null; // ISO string
    nextRotationIndex: number; // 0, 1, 2
}

const INITIAL_DATA: StoredData = {
    surgeryInfo: { date: null, day0StartTime: null },
    lastDropTime: null,
    nextRotationIndex: 0,
};

export const MEDICINES: Record<MedicineType, { name: string; color: string; description: string }> = {
    DEX: { name: 'DEX 0.1%', color: 'bg-yellow-700', description: '炎症を抑える (茶色)' },
    Moxi: { name: 'モキシフロキサシン', color: 'bg-pink-600', description: '感染症予防 (ピンク)' },
    Diclo: { name: 'ジクロフェナクNa', color: 'bg-blue-600', description: '炎症・痛みを抑える (青)' },
};

export const ROTATION_ORDER: MedicineType[] = ['DEX', 'Moxi', 'Diclo'];

export function useICLSchedule() {
    const [data, setData] = useState<StoredData>(INITIAL_DATA);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse schedule data', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    }, [data, isLoaded]);

    const surgeryDate = data.surgeryInfo.date ? parseISO(data.surgeryInfo.date) : null;
    const today = new Date();

    // Calculate Status
    let status: ScheduleStatus = 'onboarding';
    let daysPostOp = -1;

    if (surgeryDate) {
        daysPostOp = differenceInCalendarDays(today, surgeryDate);
        if (daysPostOp === 0) status = 'day0';
        else if (daysPostOp > 0) status = 'day1+';
        else status = 'onboarding'; // Future date? Treat as onboarding or pre-op (not scoped yet)
    }

    // Next Drop Calculation
    let nextDropTime: Date | null = null;
    let currentMedicines: MedicineType[] = [];

    if (status === 'day0' && data.surgeryInfo.day0StartTime) {
        // Day 0 Logic: 3 drops every hour
        currentMedicines = ['DEX', 'Moxi', 'Diclo'];

        // Parse Start Time (HH:mm)
        const [startH, startM] = data.surgeryInfo.day0StartTime.split(':').map(Number);
        const startDate = new Date(surgeryDate!);
        startDate.setHours(startH, startM, 0, 0);

        if (!data.lastDropTime) {
            // Not started yet
            nextDropTime = startDate;
        } else {
            // 1 hour after last drop
            nextDropTime = addHours(parseISO(data.lastDropTime), 1);
        }

    } else if (status === 'day1+') {
        // Day 1+ Logic: Rotation
        // Check if we need to reset rotation for a new day
        // "Reset Rule: Morning starts with DEX"
        // We detect "Start of Day" by checking if lastDropTime was yesterday.

        const lastDrop = data.lastDropTime ? parseISO(data.lastDropTime) : null;
        const isNewDay = !lastDrop || !isSameDay(lastDrop, today);

        let currentIndex = data.nextRotationIndex;

        if (isNewDay) {
            currentIndex = 0; // Force DEX
        }

        currentMedicines = [ROTATION_ORDER[currentIndex]];

        if (isNewDay) {
            // User hasn't dropped today. "Next drop" is "Now" (or when they wake up).
            // We can display "Ready" or set a canonical time like 8:00 AM if we want to be strict.
            // For practical use: "Ready to Start Day"
            nextDropTime = new Date(); // As soon as possible
        } else {
            // 1 hour after last drop
            nextDropTime = addHours(lastDrop!, 1);
        }
    }

    // Actions
    const setSurgeryInfo = (date: string, time: string) => {
        setData(prev => ({
            ...prev,
            surgeryInfo: { date, day0StartTime: time },
            lastDropTime: null, // Reset progress on date change
            nextRotationIndex: 0
        }));
    };

    const markComplete = () => {
        const now = new Date();

        // Determine next index for Day 1+
        let nextIndex = data.nextRotationIndex;
        if (status === 'day1+') {
            nextIndex = (data.nextRotationIndex + 1) % 3;

            // Special Logic: If it was the first drop of the day (reset triggered in render), 
            // we must ensure we proceed from 0 -> 1.
            const lastDrop = data.lastDropTime ? parseISO(data.lastDropTime) : null;
            const isNewDay = !lastDrop || !isSameDay(lastDrop, now);
            if (isNewDay) {
                // We just did index 0 (DEX)
                // Next should be 1 (Moxi)
                nextIndex = 1;
            }
        }

        setData(prev => ({
            ...prev,
            lastDropTime: now.toISOString(),
            nextRotationIndex: nextIndex
        }));
    };

    const resetToday = () => {
        setData(prev => ({
            ...prev,
            // Keep lastDropTime but maybe set a flag? 
            // actually user wants to "Start Day". 
            // If they force reset, we just set nextRotationIndex to 0.
            nextRotationIndex: 0
        }));
    }

    return {
        isLoaded,
        status,
        daysPostOp,
        nextDropTime,
        currentMedicines,
        markComplete,
        setSurgeryInfo,
        resetToday
    };
}
