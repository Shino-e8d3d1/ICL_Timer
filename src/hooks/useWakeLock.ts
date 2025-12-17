"use client";

import { useEffect, useState } from 'react';

export function useWakeLock() {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        let wakeLock: WakeLockSentinel | null = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    setIsLocked(true);

                    wakeLock.addEventListener('release', () => {
                        setIsLocked(false);
                    });
                }
            } catch (err) {
                console.error(`${err}`, err);
            }
        };

        requestWakeLock();

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) wakeLock.release();
        };
    }, []);

    return isLocked;
}
