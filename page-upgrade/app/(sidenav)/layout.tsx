// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import SideNav from '@/app/ui/SideNav';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (

        <div className={`${inter.className} bg-radial from-yellow-50 to-white dark:from-blue-950 dark:to-black`}>
        <div className="flex h-screen w-screen">
            <SideNav />
            <div className="flex-1 overflow-auto md:ml-64 p-6">
                {children}
            </div>
        </div>
        </div>

    );
}