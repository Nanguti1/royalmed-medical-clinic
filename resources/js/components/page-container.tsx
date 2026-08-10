import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types';

type Props = {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
};

export function PageContainer({ title, breadcrumbs = [], children }: Props) {
    return (
        <>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {children}
            </div>
        </>
    );
}
