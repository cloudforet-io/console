import { FavoriteItem } from '@/store/modules/favorite/type';

export interface FavoriteListProps {
    items: FavoriteItem[];
    loading?: boolean;
}
