'use client'

import { Box, Drawer, DrawerContent, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import Sidebar from '@/components/Layout/Sidebar'
import MobileNav from '@/components/Layout/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const bg = useColorModeValue('gray.50', 'dark.bg')

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
