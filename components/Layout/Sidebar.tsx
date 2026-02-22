'use client'

import {
    Box,
    Flex,
    Icon,
    Text,
    VStack,
    useColorModeValue
} from '@chakra-ui/react'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MapPin,
    ArrowLeftRight,
    Settings,
    LogOut,
    CircuitBoard
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

interface NavItemProps {
    icon: any
    children: React.ReactNode
    href: string
}

const NavItem = ({ icon, children, href }: NavItemProps) => {
    const pathname = usePathname()
    const isActive = pathname === href
    const activeBg = useColorModeValue('brand.500', 'brand.500')
    const activeColor = 'white'
    const inactiveColor = useColorModeValue('gray.600', 'gray.400')
    const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

    return (
        <Link href={href} style={{ width: '100%' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeColor : inactiveColor}
                _hover={{
                    bg: isActive ? activeBg : hoverBg,
                    color: isActive ? activeColor : useColorModeValue('brand.600', 'white'),
                }}
                transition="all 0.2s"
            >
                <Icon
                    mr="4"
                    fontSize="16"
                    as={icon}
                />
                <Text fontWeight={isActive ? 'bold' : 'medium'}>{children}</Text>
            </Flex>
        </Link>
    )
}

export default function Sidebar() {
    const { signOut } = useAuth()
    const bg = useColorModeValue('white', 'dark.surface')
    const borderColor = useColorModeValue('gray.200', 'dark.border')

    return (
        <Box
            transition="3s ease"
            bg={bg}
            borderRight="1px"
            borderRightColor={borderColor}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            py={8}
        >
            <Flex h="20" alignItems="center" mx="8" mb={8} justifyContent="space-between">
                <Flex align="center">
                    <Box p={2} bg="brand.500" borderRadius="md" mr={3}>
                        <CircuitBoard size={20} color="white" />
                    </Box>
                    <Text fontSize="xl" fontFamily="monospace" fontWeight="bold">
                        WMS.IQ
                    </Text>
                </Flex>
            </Flex>

            <VStack spacing={2} align="stretch">
                <NavItem icon={LayoutDashboard} href="/">Dashboard</NavItem>
                <NavItem icon={Package} href="/inventory">Inventory</NavItem>
                <NavItem icon={ShoppingCart} href="/orders">Orders</NavItem>
                <NavItem icon={MapPin} href="/locations">Locations</NavItem>
                <NavItem icon={ArrowLeftRight} href="/receiving">Receiving</NavItem>
            </VStack>

            <Box pos="absolute" bottom="8" w="full">
                <VStack spacing={2} align="stretch">
                    <NavItem icon={Settings} href="/settings">Settings</NavItem>
                    <Flex
                        align="center"
                        p="4"
                        mx="4"
                        borderRadius="lg"
                        role="group"
                        cursor="pointer"
                        color="red.400"
                        _hover={{
                            bg: 'red.50',
                            color: 'red.500',
                        }}
                        onClick={signOut}
                    >
                        <Icon mr="4" fontSize="16" as={LogOut} />
                        <Text fontWeight="medium">Sign Out</Text>
                    </Flex>
                </VStack>
            </Box>
        </Box>
    )
}
