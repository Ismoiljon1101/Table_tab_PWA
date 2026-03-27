import { Edit2, Trash2 } from 'lucide-react';
import type { Section } from '../../types';

interface SectionItemProps {
    section: Section;
    onEdit: (section: Section) => void;
    onDelete: (id: string) => void;
}

/**
 * SectionItem molecule
 * Displays an individual section row with edit and delete actions.
 */
export function SectionItem({ section, onEdit, onDelete }: SectionItemProps) {
    return (
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm transition-all active:scale-[0.99] active:bg-stone-50">
            <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-stone-900">{section.name}</span>
                    {section.code && (
                        <span className="px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded text-[9px] font-bold uppercase tracking-wider">
                            {section.code}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={() => onEdit(section)}
                    className="p-2.5 text-stone-400 active:text-amber-600 transition-colors rounded-lg active:bg-amber-50"
                    title="Edit Section"
                >
                    <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => onDelete(section._id)}
                    className="p-2.5 text-stone-400 active:text-red-500 transition-colors rounded-lg active:bg-red-50"
                    title="Delete Section"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
