import React, { FC } from 'react'
import {
    Activity,
    Bell,
    Icon,
    Package,
    Home,
    Zap,
    Triangle,
    BookOpen,
    FileText,
    UserPlus,
    Trello,
    Sun,
    Battery,
    DollarSign,
    Camera,
    Edit,
    Tool,
    Monitor,
    Check,
    RefreshCw
} from 'react-feather'
import { Dictionary } from '@shared-types'
import { OkraIcon } from '../okra-icon/OkraIcon'

const iconComponents: Dictionary<Icon | FC> = {
    Package: Package,
    Activity: Activity,
    Zap: Zap,
    Home: Home,
    Bell: Bell,
    BookOpen: BookOpen,
    FileText: FileText,
    UserPlus: UserPlus,
    Trello: Trello,
    Sun: Sun,
    Battery: Battery,
    DollarSign: DollarSign,
    Okra: OkraIcon,
    Camera: Camera,
    Edit: Edit,
    Tool: Tool,
    Monitor: Monitor,
    Check: Check,
    RefreshCw: RefreshCw
}

type Props = {
    name: string,
    strokeWidth?: number
    size?: number
    colour?: string
}

/*
* Render react-feather icons dynamically
* Default to a simple triangle if icon is not found
*/
export const DynamicIcon = ({ name, strokeWidth = 1, size = 16, colour }: Props) => {
    const Icon: Icon = iconComponents[name] || Triangle
    const optionalProps: Dictionary<any> = {}
    if (colour !== undefined) optionalProps.color = colour
    return (
        <Icon
            className='anticon'
            strokeWidth={strokeWidth}
            size={size}
            {...optionalProps}
        />
    )
}
