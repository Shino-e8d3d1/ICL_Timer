import { useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface OnboardingProps {
    onSave: (date: string, time: string) => void;
    initialDate?: string | null;
    initialTime?: string | null;
    isSettingsMode?: boolean;
}

export function Onboarding({ onSave, initialDate, initialTime, isSettingsMode = false }: OnboardingProps) {
    const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(initialTime || '10:00');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(date, time);
    };

    return (
        <div className={clsx("flex flex-col items-center justify-center p-6 text-center", isSettingsMode ? "min-h-0" : "min-h-[50vh]")}>
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                {isSettingsMode ? '設定変更' : '初期設定'}
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
                {isSettingsMode ? '手術日や開始時間を修正できます。' : '手術日と、当日の点眼開始時間を入力してください。'}
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        手術日
                    </label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        点眼開始時間 (当日)
                    </label>
                    <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        ※ 看護師さんから指示された時間を入力
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95"
                >
                    {isSettingsMode ? '設定を保存' : 'スタート'}
                </button>
            </form>
        </div>
    );
}
