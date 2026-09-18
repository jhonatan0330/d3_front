import { FuseNavigationItem } from 'app/layout/domain/layout.types';

export interface Navigation
{
    compact: FuseNavigationItem[];
    default: FuseNavigationItem[];
    futuristic: FuseNavigationItem[];
    horizontal: FuseNavigationItem[];
}
