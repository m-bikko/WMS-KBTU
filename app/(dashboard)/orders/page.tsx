'use client'

import {
    Box,
    Button,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useColorModeValue,
    Spinner,
    Center
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Order {
    id: string
    order_number: string
    customer_name: string
    created_at: string
    status: string
    priority: string
    items_count?: number
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (count)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            const formattedOrders = data.map(order => ({
                ...order,
                items_count: order.order_items[0]?.count || 0
            }))

            setOrders(formattedOrders)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'yellow'
            case 'picking': return 'blue'
            case 'packing': return 'purple'
            case 'shipped': return 'green'
            default: return 'gray'
        }
    }

    const getPriorityColor = (priority: string) => {
        return priority?.toLowerCase() === 'urgent' ? 'red' : 'blue'
    }

    return (
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Flex justify="space-between" align="center" mb={8}>
                <Heading size="lg">Orders</Heading>
                <Button leftIcon={<Plus size={18} />} colorScheme="brand">
                    New Order
                </Button>
            </Flex>

            <Box
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
            >
                {loading ? (
                    <Center p={10}>
                        <Spinner size="xl" />
                    </Center>
                ) : (
                    <Table variant="simple">
                        <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.100')}>
                            <Tr>
                                <Th>Order #</Th>
                                <Th>Customer</Th>
                                <Th>Date</Th>
                                <Th>Status</Th>
                                <Th>Priority</Th>
                                <Th isNumeric>Items</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {orders.map((order) => (
                                <Tr key={order.id}>
                                    <Td fontWeight="bold">{order.order_number}</Td>
                                    <Td>{order.customer_name}</Td>
                                    <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                                    <Td><Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge></Td>
                                    <Td><Badge colorScheme={getPriorityColor(order.priority)}>{order.priority}</Badge></Td>
                                    <Td isNumeric>{order.items_count}</Td>
                                    <Td>
                                        <Button as={Link} href={`/orders/${order.id}`} size="xs" variant="ghost">
                                            View
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    )
}
