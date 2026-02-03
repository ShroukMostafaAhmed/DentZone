import React from 'react'
import Image from 'next/image'

type IconProps = React.HTMLAttributes<SVGElement>
const DashCodeLogo = (props: IconProps) => {
    return (
        <>
            <Image src="/LOGO.png" alt="logo" width={75} height={75} className="xl:w-40 w-26" />
        </>
    )
}

export default DashCodeLogo