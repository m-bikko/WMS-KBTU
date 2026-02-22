'use client'

import {
    Box,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Text,
    Badge,
    useColorModeValue,
    Flex
} from '@chakra-ui/react'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Alert {
    id: string
    message: string
    severity: 'info' | 'warning' | 'critical'
    items: any
    created_at: string
    is_read: boolean
}

export default function AlertNotifications() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchAlerts()

        // Subscribe to new alerts
        const subscription = supabase
            .channel('alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'generated_alerts' }, payload => {
                setAlerts(prev => [payload.new as Alert, ...prev])
                setUnreadCount(prev => prev + 1)
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchAlerts = async () => {
        const { data } = await supabase
            .from('generated_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setAlerts(data)
            setUnreadCount(data.filter((a: Alert) => !a.is_read).length)
        }
    }

    const handleOpen = async () => {
        // Mark all as read (simplified)
        if (unreadCount > 0) {
            await supabase.from('generated_alerts').update({ is_read: true }).eq('is_read', false)
            setUnreadCount(0)
        }
    }

    return (
        <Menu onOpen={handleOpen}>
            <MenuButton
                as={IconButton}
                icon={
                    <Box position="relative">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <Badge
                                position="absolute"
                                top="-2px"
                                right="-2px"
                                colorScheme="red"
                                borderRadius="full"
                                boxSize="4"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="xs"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </Box>
                }
                variant="ghost"
                rounded="full"
                aria-label="Notifications"
            />
            <MenuList maxW="350px" maxH="400px" overflowY="auto">
                <Box px={3} py={2} borderBottomWidth="1px">
                    <Text fontWeight="bold">Notifications</Text>
                </Box>
                {alerts.length === 0 ? (
                    <MenuItem>
                        <Text color="gray.500" fontSize="sm">No notifications</Text>
                    </MenuItem>
                ) : (
                    alerts.map(alert => (
                        <MenuItem key={alert.id} borderBottomWidth="1px">
                            <Flex direction="column">
                                <Flex align="center" mb={1}>
                                    <Badge
                                        colorScheme={alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'orange' : 'blue'}
                                        mr={2}
                                        fontSize="xs"
                                    >
                                        {alert.severity.toUpperCase()}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500">
                                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Flex>
                                <Text fontSize="sm" noOfLines={2}>{alert.message}</Text>
                            </Flex>
                        </MenuItem>
                    ))
                )}
            </MenuList>
        </Menu>
    )
}
