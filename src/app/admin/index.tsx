import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, Tag, UtensilsCrossed, Layout, Plus } from 'lucide-react';
import { TableManagement } from '../../components/organisms/TableManagement';
import { SectionManagement } from '../../components/organisms/SectionManagement';
import { CategoryManagement } from '../../components/organisms/CategoryManagement';
import { MenuItemManagement } from '../../components/organisms/MenuItemManagement';
import { AdminDashboardTemplate } from '../../components/templates/AdminDashboardTemplate';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/enums';
import { Button } from '../../components/atoms/Button';

type AdminTab = 'tables' | 'sections' | 'categories' | 'items';

/**
 * Admin Management Page
 * Refactored to use Atomic Design (Templates, Organisms).
 */
export function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('tables');
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    
    // Refs to trigger add modals in children
    const tableRef = useRef<{ handleAdd: () => void }>(null);
    const sectionRef = useRef<{ handleAdd: () => void }>(null);
    const categoryRef = useRef<{ handleAdd: () => void }>(null);
    const itemRef = useRef<{ handleAdd: () => void }>(null);

    const isAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

    const handleGlobalAdd = () => {
        if (activeTab === 'tables') tableRef.current?.handleAdd();
        if (activeTab === 'sections') sectionRef.current?.handleAdd();
        if (activeTab === 'categories') categoryRef.current?.handleAdd();
        if (activeTab === 'items') itemRef.current?.handleAdd();
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60dvh] p-6 text-center">
                <p className="text-stone-500 mb-4">You do not have permission to access this page.</p>
                <button 
                    className="text-amber-600 font-semibold"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const header = (
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-stone-900 active:bg-stone-100 transition-colors"
                    onClick={() => navigate('/settings')}
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold text-stone-900">Management</h2>
            </div>
            
            <Button variant="primary" size="sm" onClick={handleGlobalAdd} className="h-9 px-3">
                <Plus size={18} className="mr-1.5" />
                <span className="text-xs">
                    {activeTab === 'tables' && 'Table'}
                    {activeTab === 'sections' && 'Section'}
                    {activeTab === 'categories' && 'Category'}
                    {activeTab === 'items' && 'Item'}
                </span>
            </Button>
        </div>
    );

    const tabs = (
        <div className="flex bg-white border-b border-stone-100 px-2">
            {[
                { id: 'tables', icon: LayoutGrid, label: 'Tables' },
                { id: 'sections', icon: Layout, label: 'Sections' },
                { id: 'categories', icon: Tag, label: 'Categories' },
                { id: 'items', icon: UtensilsCrossed, label: 'Menu Items' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition-all ${
                        activeTab === tab.id 
                        ? 'border-amber-600 text-amber-600' 
                        : 'border-transparent text-stone-400'
                    }`}
                >
                    <tab.icon size={20} />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                </button>
            ))}
        </div>
    );

    return (
        <AdminDashboardTemplate header={header} tabs={tabs}>
            <div className="animate-fade-in" key={activeTab}>
                {activeTab === 'tables' && <TableManagement ref={tableRef} />}
                {activeTab === 'sections' && <SectionManagement ref={sectionRef} />}
                {activeTab === 'categories' && <CategoryManagement ref={categoryRef} />}
                {activeTab === 'items' && <MenuItemManagement ref={itemRef} />}
            </div>
        </AdminDashboardTemplate>
    );
}
