"use client";

import { useEffect, useState } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { useICLSchedule, MEDICINES } from '@/hooks/useICLSchedule';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Onboarding } from '@/components/Onboarding';
import { MedicineCard } from '@/components/MedicineCard';
import { PrecautionList } from '@/components/PrecautionList';
import { Calendar, Check, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const { isLoaded, status, setSurgeryInfo, currentMedicines, nextDropTime, markComplete, daysPostOp, resetToday } = useICLSchedule();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const isLocked = useWakeLock();

  // Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!nextDropTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = differenceInSeconds(nextDropTime, now);

      if (diff <= 0) {
        setTimeLeft('READY');

        // Trigger Notification if just reached 0
        if (diff === 0 && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('点眼の時間です', {
            body: `次は: ${currentMedicines.map(m => MEDICINES[m].name).join(', ')}`,
            requireInteraction: true,
          });
        }
      } else {
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        // Format: HH:MM:SS or MM:SS
        const timeString = h > 0
          ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
          : `${m}:${s.toString().padStart(2, '0')}`;
        setTimeLeft(timeString);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextDropTime]);

  // Loading State
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Onboarding
  if (status === 'onboarding') {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Onboarding onSave={setSurgeryInfo} />
      </main>
    );
  }

  // --- Dashboard ---

  const generateGoogleCalendarLink = () => {
    if (!nextDropTime) return '#';
    const text = `目薬: ${currentMedicines.map(id => MEDICINES[id].name).join(', ')}`;
    const dates = format(nextDropTime, "yyyyMMdd'T'HHmmss");
    const datesEnd = format(new Date(nextDropTime.getTime() + 10 * 60000), "yyyyMMdd'T'HHmmss"); // +10 mins

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${dates}/${datesEnd}&details=ICL点眼`;
  };

  const isReady = timeLeft === 'READY';
  const headerText = status === 'day0' ? '手術当日' : `術後 ${daysPostOp}日目`;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 text-gray-900 dark:text-gray-100 font-sans">

      {/* Header */}
      {/* Header */}
      <header className="p-4 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg">{headerText}</h1>
        <div className="flex items-center gap-3">
          {status === 'day1+' && (
            <button onClick={resetToday} className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              <RefreshCw size={14} /> 朝リセット
            </button>
          )}
          <a href="/settings" className="text-gray-500 hover:text-gray-800 dark:hover:text-white p-1">
            <Settings size={20} />
          </a>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* Timer Card */}
        <section className="text-center py-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">NEXT DROP IN</div>
          <div className={clsx(
            "text-5xl font-black tabular-nums tracking-tight",
            isReady ? "text-blue-600 dark:text-blue-400 animate-pulse" : "text-gray-800 dark:text-gray-100"
          )}>
            {timeLeft || '--:--'}
          </div>
          {nextDropTime && (
            <div className="text-gray-400 text-sm mt-2">
              予定: {format(nextDropTime, 'HH:mm')}
            </div>
          )}
        </section>

        {/* Action Area */}
        <div className="text-center mb-2">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-bold rounded-full">
            ▼ 次にさす目薬
          </span>
        </div>
        <section className={clsx("flex gap-2 justify-center", currentMedicines.length > 1 ? "flex-row" : "flex-col items-center")}>
          {currentMedicines.map(medId => (
            <div key={medId} className={clsx(currentMedicines.length > 1 ? "flex-1" : "w-full")}>
              <MedicineCard medicine={{ ...MEDICINES[medId], id: medId }} isLarge />
            </div>
          ))}
        </section>

        <section className="space-y-4">

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <a
              href={generateGoogleCalendarLink()}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Calendar className="mb-2 text-blue-500" />
              <span className="text-sm font-bold">通知セット</span>
              <span className="text-xs text-gray-400">Googleカレンダー</span>
            </a>

            <button
              onClick={markComplete}
              className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg active:scale-95 transition"
            >
              <Check className="mb-2" />
              <span className="text-sm font-bold">点眼完了</span>
              <span className="text-xs opacity-75">次の時間へ</span>
            </button>
          </div>
        </section>

        {/* Precautions Placeholder (To be implemented) */}
        <PrecautionList daysPostOp={daysPostOp} />

      </div >
    </main >
  );
}
