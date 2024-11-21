import { ReactNode } from 'react';

type PageProps = {
    header?: ReactNode;
    children?: ReactNode;
    className?: string;
}
export default function Page({ header, children, className }: PageProps) {
    return (
        <main className="w-full h-screen flex flex-col gap-2 overflow-hidden">
            <div className="px-4 pt-3">
                {header}
            </div>
            <div className={`max-w-2xl px-4 pt-2 pb-6 overflow-auto flex flex-col gap-4 ${className}`}>
                {children}
            </div>
        </main>
    )
}
