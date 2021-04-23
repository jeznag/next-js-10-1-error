import { Route } from 'shared/services'

type FooterRoute = {
    path: string
    name: string
    iconName: string
}

// For pages requiring auth
export const PageRoutes = {
    Home: new Route('/'),
    Signup: new Route('/signup'),
    ScanQrCode: new Route('/scan-house'),
    Fallback: new Route('/fallback'),
    ConsumerDetail: new Route('/consumer-detail/[uuid]'),
    InstallPod: new Route('/install-pod/[uuid]'),
    ReceivePayment: new Route('/receive-payment/[uuid]'),
    ReplacePod: new Route('/replace-pod/[uuid]'),
    RemovePod: new Route('/remove-pod/[uuid]'),
    UpdateInstall: new Route('/update-install/[uuid]'),
    ManageAppliances: new Route('/manage-appliances/[uuid]'),
    EditConsumerDetails: new Route('/edit-consumer-detail/[uuid]')
}

/*
* NOTE: if you add a new icon name here, you must manually import it in RouteSidebar.tsx
* The import does not happen dynamically.
*/
export const FooterRoutes: FooterRoute[] = [
    {
        path: PageRoutes.Signup.getPath(),
        name: 'new_signup',
        iconName: 'UserPlus'
    },
    {
        path: PageRoutes.Home.getPath(),
        name: 'activity',
        iconName: 'Home'
    },
    {
        path: PageRoutes.ScanQrCode.getPath(),
        name: 'scan_qr_code',
        iconName: 'Camera'
    }
]
