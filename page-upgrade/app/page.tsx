"use client";

import { useState } from "react";
import { KeyIcon, UserIcon} from "@heroicons/react/24/outline";
import {ArrowRightIcon} from "@heroicons/react/20/solid";
import {Button} from "@/app/ui/button";


export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        setError(""); // Clear previous errors

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = `/dashboard`;
        } else {
            setError("Credenciales Inválidas. Intente nuevamente.");
        }
    }



    return (

        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-dvw max-w-sm transform transition-all duration-300 ">
                <h1 className="text-2xl font-bold text-black mb-4">Login</h1>
                {error &&
                <p className="text-sm text-red-600 mb-6">
                    {error}
                </p>
                }
                <div className="w-full">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="peer block w-full rounded-md border text-gray-900 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 "
                            />
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />

                        </div>
                        <div className="relative mb-6">
                            <input
                                type="password"
                                placeholder="Constraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="peer block w-full rounded-md border text-gray-900 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                            />
                            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>

                        <Button className="mt-1 w-full">
                            Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}