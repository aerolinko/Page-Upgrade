'use client'
import { useState } from 'react';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    CogIcon,
    DocumentTextIcon,
    ArrowRightEndOnRectangleIcon, BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {redirect, usePathname} from 'next/navigation';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Manejo de Inventario', href: '/manejo_de_inventario', icon: BuildingStorefrontIcon },
    { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function SideNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    async function logOut(event: { preventDefault: () => void; }) {
        event.preventDefault();


        const response = await fetch("/api/logout", {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        });

        if (response.ok) {
            console.log("logout successful");
            redirect("/");
        } else {
            if(response.status === 401) {
                redirect("/");
            }
        }
    }


    return (
        <>
            {/* Mobile menu button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-100 dark:bg-gray-800"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                ) : (
                    <Bars3Icon className="h-6 w-6" />
                )}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 shadow-lg transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
                <div className="mt-13 md:mt-0 flex flex-col h-full p-4">
                    <div className="flex items-center md:mb-8 mb-5 p-2">
                        <h1 className="text-xl font-bold">Hielo Tía Ana</h1>
                    </div>
                    <nav className="flex-1">
                        <ul className="space-y-2">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center p-3 rounded-lg ${
                                            pathname === item.href
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5 mr-3" />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="mb-15 md:mb-0">
                        <button onClick={logOut} className="flex items-center w-full p-3 rounded-lg  hover:bg-red-500 dark:hover:bg-red-900">
                            <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-3" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black opacity-45 z-30 "
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}