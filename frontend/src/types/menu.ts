export interface MenuItem {
    id: string;
    title?: string;
    icon?: React.ComponentType;
    href?: string;
    navlabel?: boolean;
    subheader?: string;
}

export type UserRole = 'admin' | 'leader' | 'user';