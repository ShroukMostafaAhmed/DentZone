"use client";

import React, {useEffect, useRef, useState} from 'react'
import {Ellipsis, Loader2, LogOut} from "lucide-react";
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import {getMenuList, Group} from "@/lib/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'
import { getLangDir } from 'rtl-detect';
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import {getSession, useSession} from "next-auth/react";
import Cookies from "js-cookie";

export function MenuClassic({ }) {
    const { data: session, status } = useSession();
    // translate
    const t = useTranslations("Menu");
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');
    const isDesktop = useMediaQuery('(min-width: 1280px)');
    const locale = params?.locale || "en";

    const [config, setConfig] = useConfig();
    const collapsed = config.collapsed;
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;

    const scrollableNodeRef = useRef<HTMLDivElement>(null);
    const [menuList, setMenuList] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [scroll, setScroll] = useState(false);
    const roleFromCookie = Cookies.get('userRole');

    // Generate menu list after authentication
    useEffect(() => {
        if (!roleFromCookie) return;

        setLoading(true);
        const menu = getMenuList(pathname, t, roleFromCookie, locale);
        setMenuList(menu);
        setLoading(false);
    }, [pathname, t, locale, roleFromCookie]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current?.addEventListener("scroll", handleScroll);

        return () => {
            scrollableNodeRef.current?.removeEventListener("scroll", handleScroll);
        };
    }, [scrollableNodeRef]);

    useEffect(() => {
        const node = scrollableNodeRef.current;
        if (!node) return;

        const handleScroll = () => setScroll(node.scrollTop > 0);
        node.addEventListener("scroll", handleScroll);
        return () => node.removeEventListener("scroll", handleScroll);
    }, []);

    // Show loading state while authentication is in progress or role data is loading

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="text-blue-500 animate-spin w-6 h-6" />
            </div>
        );
    }

    // Show specific message if authenticated but no role is present
    if (roleFromCookie !== undefined && !roleFromCookie) {
        return (
            <div className="flex flex-col h-full">
                {isDesktop && (
                    <div className="flex items-center justify-between px-4 py-4">
                        <Logo />
                    </div>
                )}
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">User role not available. Please try logging in again.</p>
                </div>
            </div>
        );
    }

    // Show empty menu if there are no menu items after authentication
    if (menuList.length === 0) {
        return (
            <div className="flex flex-col h-full">
                {isDesktop && (
                    <div className="flex items-center justify-between px-4 py-4">
                        <Logo />
                    </div>
                )}
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">No menu items available for your role</p>
                </div>
            </div>
        );
    }



    return (
        <>
            {isDesktop && (
                <div className="flex items-center justify-between px-4 py-4">
                    <Logo />
                    {/*<SidebarHoverToggle />*/}
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:block!" dir={direction} ref={scrollableNodeRef}>
                {isDesktop && (
                    <div className={cn('space-y-3', {
                        'px-4': !collapsed || hovered,
                        'text-center': collapsed || !hovered
                    })}>
                    </div>
                )}

                <nav className="mt-8 h-full w-full">
                    <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                        {menuList?.map(({ groupLabel, menus }, index) => (
                            <li className={cn("w-full", groupLabel ? "" : "")} key={index}>
                                {(groupLabel && (!collapsed || hovered)) ? (
                                    <MenuLabel label={groupLabel} />
                                ) : (collapsed && !hovered && groupLabel) ? (
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger className="w-full">
                                                <div className="w-full flex justify-center items-center">
                                                    <Ellipsis className="h-5 w-5 text-default-700" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{groupLabel}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : null}

                                {menus.map(
                                    ({ href, label, icon, active, id, submenus }, index) =>
                                        submenus.length === 0 ? (
                                            <div className="w-full mb-2 last:mb-0" key={index}>
                                                <TooltipProvider disableHoverableContent>
                                                    <Tooltip delayDuration={100}>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <MenuItem label={label} icon={icon} href={href} active={active} id={id} collapsed={collapsed} />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {collapsed && (
                                                            <TooltipContent side="right">
                                                                {label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ) : (
                                            <div className="w-full mb-2" key={index}>
                                                <CollapseMenuButton
                                                    icon={icon}
                                                    label={label}
                                                    active={active}
                                                    submenus={submenus}
                                                    collapsed={collapsed}
                                                    id={id}
                                                />
                                            </div>
                                        )
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
}