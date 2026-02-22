import { Provider } from '@/components/ui/provider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import ChatWidget from '@/components/Chat/ChatWidget'

export const metadata = {
    title: 'WarehouseIQ',
    description: 'AI-Powered Warehouse Management System',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Provider>
                    <AuthProvider>
                        {children}
                        <ChatWidget />
                    </AuthProvider>
                </Provider>
            </body>
        </html>
    )
}
