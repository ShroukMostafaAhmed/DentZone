"use client"; 

import React from 'react'
import HeaderContent from './header-content'
import ProfileInfo from './profile-info'
import ThemeSwitcher from './theme-switcher'
import { SheetMenu } from '@/components/partials/sidebar/menu/sheet-menu'
import HorizontalMenu from "./horizontal-menu"
import LocalSwitcher from './locale-switcher'
import HeaderLogo from "./header-logo"
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";

const DashCodeHeader = () => {
    const [config] = useConfig();
    const { collapsed } = config;

    return (
        <>
            <HeaderContent>
                <div className={cn(
                    "flex w-full items-center justify-between transition-all duration-300",
                   
                    collapsed ? "ltr:ml-[72px] rtl:mr-[72px]" : "ltr:ml-[248px] rtl:mr-[248px]"
                )}>
                    <div className='flex gap-3 items-center'>
                        <HeaderLogo />
                    </div>
                    
                    <div className="nav-tools flex items-center md:gap-4 gap-3">
                        <LocalSwitcher />
                        <ThemeSwitcher />
                        <ProfileInfo />
                        
                        <div className="lg:hidden">
                             <SheetMenu />
                        </div>
                    </div>
                </div>
            </HeaderContent>
            <HorizontalMenu />
        </>
    )
}

export default DashCodeHeader;