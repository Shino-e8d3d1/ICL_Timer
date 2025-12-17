import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';

type PrecautionStatus = 'ok' | 'ng' | 'caution';

interface PrecautionItem {
    label: string;
    status: PrecautionStatus;
    note?: string;
}

export function getPrecautions(daysPostOp: number): PrecautionItem[] {
    // Logic based on the provided chart
    // Periods: Day 0, Day 1-3, Day 4-6, Day 7+

    const isDay0 = daysPostOp === 0;
    const isDay1to3 = daysPostOp >= 1 && daysPostOp <= 3;
    const isDay4to6 = daysPostOp >= 4 && daysPostOp <= 6;
    const isWeek1Plus = daysPostOp >= 7;

    const items: PrecautionItem[] = [
        {
            label: '保護用眼帯 (就寝時)',
            status: isWeek1Plus ? 'ok' : 'ng', // "Start + 1 week required" -> so until day 6 NG (must wear), day 7 OK (remove)?
            // Actually status means "Is it restricted?" or "Activity Status"?
            // Let's use status for "Can I stop wearing it?" -> NG means "Must wear". 
            // Or better: Status of the Activity "Sleeping without Patch".
            // Let's rephrase: Status of "Living Normalcy".
            // Or simply: output the instruction directly.
            // Let's use: Status = OK (Allowed), NG (Forbidden), Caution (Conditional).
            // Item: "Sleeping without Patch" -> NG until week 1.
        },
        // Let's change approach: List Items and their current instruction.
    ];

    // Helper
    const s = (ok: boolean, caution: boolean, ng: boolean): PrecautionStatus =>
        ok ? 'ok' : caution ? 'caution' : 'ng';

    return [
        {
            label: '保護用眼帯 (就寝時)',
            status: isWeek1Plus ? 'ok' : 'ng', // NG = "Restriction exists" (Must wear)
            note: isWeek1Plus ? '不要' : '就寝時は必ず装着してください (1週間)'
        },
        {
            label: '洗顔・洗髪',
            status: isDay0 || isDay1to3 ? 'ng' : 'ok', // Day 1-3 is NG for self-wash
            note: isDay0 ? '不可 (美容室も不可)' : (isDay1to3 ? '不可 (顔は濡れタオル・美容室での洗髪は可)' : '可 (目に水が入らないように)')
        },
        {
            label: 'お風呂 (入浴)',
            status: isWeek1Plus ? 'ok' : (isDay4to6 ? 'caution' : 'ng'),
            note: isDay0 || isDay1to3 ? '不可 (首から下のシャワーのみ可)' : (isDay4to6 ? '短時間の入浴可' : '通常通り可')
        },
        {
            label: 'メイク',
            status: isWeek1Plus ? 'ok' : (isDay0 ? 'ng' : 'caution'),
            note: isDay0 ? '不可' : (isWeek1Plus ? '全メイク可' : '目の周り以外は可 (アイメイク不可)')
        },
        {
            label: 'アルコール・タバコ',
            status: isWeek1Plus ? 'ok' : 'ng',
            note: isWeek1Plus ? '許可' : '不可'
        },
        {
            label: '運動',
            status: isWeek1Plus ? 'caution' : 'ng',
            note: isWeek1Plus ? '軽い運動は可 (激しいものは1ヶ月後)' : '不可'
        },
        {
            label: '仕事 (PC/事務)',
            status: isDay0 ? 'ng' : 'ok',
            note: isDay0 ? '不可' : '翌日からデスクワーク可 (疲れない程度に)'
        },
    ];
}

export function PrecautionList({ daysPostOp }: { daysPostOp: number }) {
    const items = getPrecautions(daysPostOp);

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Info size={20} />
                生活の注意事項
            </h3>
            <div className="grid gap-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.note}</div>
                        </div>
                        <div className="ml-2">
                            <StatusIcon status={item.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: PrecautionStatus }) {
    if (status === 'ok') return <CheckCircle className="text-green-500" size={20} />;
    if (status === 'ng') return <XCircle className="text-red-500" size={20} />;
    return <AlertTriangle className="text-yellow-500" size={20} />;
}
