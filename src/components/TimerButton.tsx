"use client";

import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Clock } from 'lucide-react';

type OSType = 'android' | 'windows' | 'ios' | 'other' | null;

interface TimerButtonProps {
    nextDropTime: Date | null;
    medicines: string[];
}

export function TimerButton({ nextDropTime, medicines }: TimerButtonProps) {
    const [os, setOs] = useState<OSType>(null);

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) {
            setOs('android');
        } else if (/windows/.test(userAgent)) {
            setOs('windows');
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            setOs('ios');
        } else {
            setOs('other');
        }
    }, []);

    if (!nextDropTime || (os !== 'android' && os !== 'windows')) {
        return null;
    }

    const getTimerLink = () => {
        const now = new Date();
        const seconds = Math.max(0, differenceInSeconds(nextDropTime, now));
        const message = `目薬: ${medicines.join(', ')}`;

        if (os === 'android') {
            // Android Intent to set a timer
            // Note: S.message might not be supported by all clock apps, but standard EXTRA_MESSAGE is common.
            // i.length is the duration in seconds.
            return `intent:#Intent;action=android.intent.action.SET_TIMER;i.length=${seconds};S.android.intent.extra.MESSAGE=${encodeURIComponent(message)};B.SKIP_UI=true;end`;
        }

        if (os === 'windows') {
            // Opens the Alarms & Clock app
            return 'ms-clock:timer';
        }

        return '#';
    };

    return (
        <a
            href={getTimerLink()}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
            <Clock className="mb-2 text-orange-500" />
            <span className="text-sm font-bold">タイマー</span>
            <span className="text-xs text-gray-400">
                {os === 'android' ? '自動セット' : 'アプリを開く'}
            </span>
        </a>
    );
}
