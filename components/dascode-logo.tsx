import React from 'react'
import Image from 'next/image'

type IconProps = React.HTMLAttributes<SVGElement>

const DashCodeLogo = (props: IconProps) => {
    return (
        <>
            <Image 
                src="/LOGO.png" 
                alt="logo" 
                width={50} 
                height={50} 
                className="xl:w-24 w-16" 
            />
        </>
    )
}

export default DashCodeLogo