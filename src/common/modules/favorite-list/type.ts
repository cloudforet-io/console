import { FavoriteItem } from '@/store/modules/favorite/type';

export interface FavoriteListProps {
    items: FavoriteItem[];
    loading?: boolean;
    beforeRoute?: (item: FavoriteItem, event: MouseEvent) => Promise<void>|void;
}
