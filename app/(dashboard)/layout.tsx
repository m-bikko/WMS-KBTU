'use client'

import { Box, Drawer, DrawerContent, useColorModeValue, useDisclosure, Center, Spinner } from '@chakra-ui/react'
import Sidebar from '@/components/Layout/Sidebar'
import MobileNav from '@/components/Layout/Navbar'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const bg = useColorModeValue('gray.50', 'dark.bg')

    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading || !user) {
        return (
            <Box minH="100vh" bg={bg}>
                <Center h="100vh">
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            </Box>
        )
    }

    return (
        <Box minH="100vh" bg={bg}>
            <Sidebar />

            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
            >
                <DrawerContent>
                    <Sidebar />
                </DrawerContent>
            </Drawer>

            {/* MobileNav */}
            <MobileNav onOpen={onOpen} />

            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    )
}
