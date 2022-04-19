import { FavoriteConfig } from '@/store/modules/favorite/type';

export interface FavoriteButtonProps {
    favoriteItems: FavoriteConfig[];
    itemId: string;
    favoriteType: string;
    itemMap: any;
    scale?: string;
    readOnly?: boolean;
}
