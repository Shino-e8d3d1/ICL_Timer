"use client";

import { useICLSchedule } from '@/hooks/useICLSchedule';
import { Onboarding } from '@/components/Onboarding';
import { ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { isLoaded, surgeryInfo, setSurgeryInfo, resetAllData } = useICLSchedule();
  const router = useRouter();

  if (!isLoaded) return <div className="p-4">Loading...</div>;

  const handleSave = (date: string, time: string) => {
    setSurgeryInfo(date, time);
    alert('設定を保存しました');
    router.push('/');
  };

  const handleReset = () => {
    if (confirm('本当にデータをリセットしますか？\nこの操作は取り消せません。')) {
      resetAllData();
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans pb-20">
      {/* Header */}
      <header className="p-4 bg-white dark:bg-gray-800 shadow-sm flex items-center sticky top-0 z-10">
        <Link href="/" className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg ml-2">設定</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-8">
        {/* Reuse Onboarding Form */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2">
          <Onboarding
            onSave={handleSave}
            initialDate={surgeryInfo.date}
            initialTime={surgeryInfo.day0StartTime}
            isSettingsMode={true}
          />
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 px-2">データ管理</h3>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
          >
            <Trash2 size={20} />
            アプリを初期化 (リセット)
          </button>
          <p className="text-xs text-center text-gray-400">
            バージョン 1.1.0
          </p>
        </section>
      </div>
    </main>
  );
}
