"use client";

import React, {useEffect, useState} from 'react'
import { usePathname } from "@/components/navigation";
import { getMenuList, type Group, type Menu, type Submenu } from "@/lib/menus";

import IconNav from './icon-nav';
import SidebarNav from './sideabr-nav';
import { useTranslations } from 'next-intl';
import {useParams} from "next/navigation";
import {useSession} from "next-auth/react";


export function MenuTwoColumn() {
    // translate
    const t = useTranslations("Menu")
    const { data: session, status } = useSession();
    const params = useParams<{ locale: string; }>();
    const locale = params?.locale || "en";
    const pathname = usePathname();

    const [menuList, setMenuList] = useState<Group[]>([]);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                if (status === "authenticated" && session?.user?.role) {
                    const menu = getMenuList(pathname, t, session.user.role, locale);
                    setMenuList(menu);
                }
            } catch (error) {
                console.error("Error generating menu:", error);
            }
        };

        fetchMenuData();
    }, [status, session, pathname, t, locale]);

    return (
        <>
            <IconNav menuList={menuList} />
            <SidebarNav menuList={menuList} />
        </>


    );
}
