import { FavoriteItem } from '@/store/modules/favorite/type';

export interface FavoriteButtonProps {
    favoriteItems: FavoriteItem[];
    itemId: string;
    favoriteType: string;
    itemMap: any;
    scale?: string;
    readOnly?: boolean;
}
