import { create } from 'zustand';

interface SearchState {
    query: string;
    isSearchVisible: boolean;
    setQuery: (query: string) => void;
    toggleSearch: () => void;
    closeSearch: () => void;
}

/**
 * Global search store to share state between AppShell header and MenuPage.
 */
export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    isSearchVisible: false,
    setQuery: (query) => set({ query }),
    toggleSearch: () => set((state) => ({ 
        isSearchVisible: !state.isSearchVisible,
        query: state.isSearchVisible ? '' : state.query // Clear query when closing
    })),
    closeSearch: () => set({ isSearchVisible: false, query: '' }),
}));
