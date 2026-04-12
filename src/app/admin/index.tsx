import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, Tag, UtensilsCrossed, Layout, Plus, Search, X } from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { TableManagement } from '../../components/organisms/TableManagement';
import { SectionManagement } from '../../components/organisms/SectionManagement';
import { CategoryManagement } from '../../components/organisms/CategoryManagement';
import { MenuItemManagement } from '../../components/organisms/MenuItemManagement';
import { AdminDashboardTemplate } from '../../components/templates/AdminDashboardTemplate';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/enums';
import { Button } from '../../components/atoms/Button';
import { CategoryChips } from '../../components/molecules/CategoryChips';
import api from '../../services/api';
import type { Category } from '../../types';

type AdminTab = 'tables' | 'sections' | 'categories' | 'items';

/**
 * Admin Management Page
 * Refactored to use Atomic Design (Templates, Organisms).
 */
export function AdminPage() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<AdminTab>((location.state?.activeTab as AdminTab) || 'tables');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    
    const user = useAuthStore((s) => s.user);
    const search = useSearchStore();
    const navigate = useNavigate();
    
    const tableRef = useRef<{ handleAdd: () => void }>(null);
    const sectionRef = useRef<{ handleAdd: () => void }>(null);
    const categoryRef = useRef<{ handleAdd: () => void }>(null);
    const itemRef = useRef<{ handleAdd: () => void }>(null);

    const isFullAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;
    const isWaiter = user?.role === UserRole.WAITER;
    const canAccess = isFullAdmin || isWaiter;

    useEffect(() => {
        if (isWaiter && activeTab !== 'items') {
            setActiveTab('items');
        }
        // Close search when switching tabs
        search.closeSearch();
    }, [isWaiter, activeTab]);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab as AdminTab);
        }
    }, [location.state]);

    useEffect(() => {
        if (canAccess) {
            fetchCategories();
        }
    }, [canAccess]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get<Category[]>('/categories');
            setCategories(data);
            if (data.length > 0 && selectedCategoryId === 'all') {
                setSelectedCategoryId(data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleGlobalAdd = () => {
        if (activeTab === 'tables') tableRef.current?.handleAdd();
        if (activeTab === 'sections') sectionRef.current?.handleAdd();
        if (activeTab === 'categories') categoryRef.current?.handleAdd();
        if (activeTab === 'items') itemRef.current?.handleAdd();
    };

    const handleSelectCategory = (id: string) => {
        setSelectedCategoryId(id);
        if (activeTab === 'categories' && id !== 'all') {
            setActiveTab('items');
        }
    };

    if (!canAccess) {
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 min-h-[64px]">
            {search.isSearchVisible ? (
                <div className="flex-1 flex items-center bg-stone-50 rounded-xl px-3 animate-fade-in group focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-200 transition-all">
                    <Search size={16} className="text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                    <input
                        autoFocus
                        type="text"
                        value={search.query}
                        onChange={(e) => search.setQuery(e.target.value)}
                        placeholder="Search menu..."
                        className="w-full h-8 bg-transparent border-none text-sm focus:outline-none px-2 text-stone-900"
                    />
                    <button 
                        onClick={search.toggleSearch}
                        className="text-stone-300 hover:text-stone-600 active:scale-90 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-stone-900 active:bg-stone-100 transition-colors"
                            onClick={() => navigate('/settings')}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-semibold text-stone-900">Management</h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {activeTab === 'items' && (
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 active:bg-amber-50 active:text-amber-600 transition-all"
                                onClick={search.toggleSearch}
                            >
                                <Search size={20} />
                            </button>
                        )}
                        {isFullAdmin && (
                            <Button variant="primary" size="sm" onClick={handleGlobalAdd} className="h-9 px-3">
                                <Plus size={18} className="mr-1.5" />
                                <span className="text-xs">
                                    {activeTab === 'tables' && 'Table'}
                                    {activeTab === 'sections' && 'Section'}
                                    {activeTab === 'categories' && 'Category'}
                                    {activeTab === 'items' && 'Item'}
                                </span>
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    const availableTabs = [
        { id: 'tables', icon: LayoutGrid, label: 'Tables', restricted: true },
        { id: 'sections', icon: Layout, label: 'Sections', restricted: true },
        { id: 'categories', icon: Tag, label: 'Categories', restricted: true },
        { id: 'items', icon: UtensilsCrossed, label: 'Menu', restricted: false },
    ].filter(tab => !tab.restricted || isFullAdmin);

    const tabs = availableTabs.length > 1 ? (
        <div className="flex bg-white border-b border-stone-100 px-2">
            {availableTabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex-1 flex items-center justify-center py-4 border-b-2 transition-all ${
                        activeTab === tab.id 
                        ? 'border-amber-600 text-amber-600' 
                        : 'border-transparent text-stone-400'
                    }`}
                >
                    <span className="text-xs font-semibold uppercase tracking-wider">{tab.label}</span>
                </button>
            ))}
        </div>
    ) : null;

    return (
        <AdminDashboardTemplate header={header} tabs={tabs}>
            <div className="flex flex-col gap-4">
                {activeTab === 'items' && (
                    <CategoryChips 
                        categories={categories}
                        selectedId={selectedCategoryId}
                        onSelect={handleSelectCategory}
                        showAll={false}
                    />
                )}
                
                <div className="animate-fade-in" key={activeTab}>
                    {activeTab === 'tables' && <TableManagement ref={tableRef} />}
                    {activeTab === 'sections' && <SectionManagement ref={sectionRef} />}
                    {activeTab === 'categories' && <CategoryManagement ref={categoryRef} />}
                    {activeTab === 'items' && (
                        <MenuItemManagement 
                            ref={itemRef} 
                            selectedCategoryProp={selectedCategoryId}
                            onSelectCategoryProp={setSelectedCategoryId}
                        />
                    )}
                </div>
            </div>
        </AdminDashboardTemplate>
    );
}
