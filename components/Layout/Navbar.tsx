'use client'

import {
    IconButton,
    Avatar,
    Box,
    Flex,
    HStack,
    VStack,
    useColorModeValue,
    Text,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
} from '@chakra-ui/react'
import { Menu as MenuIcon, ChevronDown, CircuitBoard } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import AlertNotifications from './AlertNotifications'

interface MobileNavProps {
    onOpen: () => void
}

export default function MobileNav({ onOpen }: MobileNavProps) {
    const { user, signOut } = useAuth()
    const bg = useColorModeValue('white', 'dark.surface')
    const borderColor = useColorModeValue('gray.200', 'dark.border')

    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={bg}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
        >
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<MenuIcon />}
            />

            <Flex display={{ base: 'flex', md: 'none' }} alignItems="center">
                <Box p={1.5} bg="brand.500" borderRadius="md" mr={2}>
                    <CircuitBoard size={18} color="white" />
                </Box>
                <Text fontSize="lg" fontFamily="monospace" fontWeight="bold">
                    WMS.IQ
                </Text>
            </Flex>

            <HStack spacing={{ base: '0', md: '6' }}>
                <AlertNotifications />
                <Flex alignItems={'center'}>
                    <Menu>
                        <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                            <HStack>
                                <Avatar
                                    size={'sm'}
                                    bg="brand.500"
                                    name={user?.email || 'User'}
                                />
                                <VStack
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="flex-start"
                                    spacing="1px"
                                    ml="2"
                                >
                                    <Text fontSize="sm">{user?.email}</Text>
                                    <Text fontSize="xs" color="gray.600">
                                        Warehouse Manager
                                    </Text>
                                </VStack>
                                <Box display={{ base: 'none', md: 'flex' }}>
                                    <ChevronDown size={16} />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg={bg}
                            borderColor={borderColor}
                        >
                            <MenuItem>Profile</MenuItem>
                            <MenuItem>Settings</MenuItem>
                            <MenuDivider />
                            <MenuItem onClick={signOut} color="red.400">Sign out</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    )
}
