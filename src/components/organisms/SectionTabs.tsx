import { Layout } from 'lucide-react';
import type { Section } from '../../types';

interface SectionTabsProps {
    sections: Section[];
    selectedSectionId: string | null;
    onSelectSection: (id: string | null) => void;
}

/**
 * SectionTabs organism
 * Horizontal scrollable tabs for filtering tables by section.
 */
export function SectionTabs({ sections, selectedSectionId, onSelectSection }: SectionTabsProps) {
    return (
        <div className="flex bg-white items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-hide border-b border-stone-50 transition-all active:cursor-grabbing">
            {sections.map((section) => (
                <button
                    key={section._id}
                    onClick={() => onSelectSection(section._id)}
                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        selectedSectionId === section._id
                            ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-200'
                            : 'bg-stone-50 border-stone-100 text-stone-500'
                    }`}
                >
                    {section.name}
                </button>
            ))}
        </div>
    );
}
