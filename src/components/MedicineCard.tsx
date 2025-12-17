import clsx from 'clsx';
import { Medicine } from '@/types';

interface MedicineCardProps {
    medicine: Medicine;
    isLarge?: boolean;
}

export function MedicineCard({ medicine, isLarge = false }: MedicineCardProps) {
    return (
        <div className={clsx(
            "relative flex flex-col items-center p-2 rounded-xl border transition-all",
            isLarge ? "bg-white dark:bg-gray-800 shadow-md border-gray-100 dark:border-gray-700 w-full py-4" : "bg-gray-50 dark:bg-gray-900 border-transparent w-20"
        )}>
            {/* Bottle Visualization */}
            <div className={clsx(
                "rounded-full flex items-center justify-center shadow-inner mb-1.5 transition-colors duration-500",
                medicine.color,
                isLarge ? "w-12 h-12" : "w-8 h-8"
            )}>
                <span className="text-white font-bold text-opacity-90 text-sm">
                    {medicine.id}
                </span>
            </div>

            <h3 className={clsx(
                "font-bold text-center text-gray-900 dark:text-gray-100 leading-tight",
                isLarge ? "text-sm mb-0.5" : "text-[10px]"
            )}>
                {medicine.name}
            </h3>

            {isLarge && (
                <p className="text-gray-500 dark:text-gray-400 text-xs text-center px-1">
                    {medicine.description}
                </p>
            )}
        </div>
    );
}
