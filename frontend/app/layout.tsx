import type { Metadata } from "next";
import { Outfit } from 'next/font/google';
import "./globals.css";
import React from "react";

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    title: "Predictify",
    description: "Find your next favorite song",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${outfit.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
