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
    Text
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Order {
    id: string
    order_number: string
    customer_name: string
    created_at: string
    status: string
    priority: string
    order_items: { count: number }[]
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
            // Note: fetching count of items. 
            // Supabase supports count in select, e.g. order_items(count)
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (count)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'yellow'
            case 'picking': return 'orange'
            case 'packing': return 'blue'
            case 'shipped': return 'green'
            case 'cancelled': return 'red'
            default: return 'gray'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'red'
            case 'high': return 'orange'
            case 'normal': return 'blue'
            default: return 'gray'
        }
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
                    <Flex justify="center" p={8}>
                        <Spinner />
                    </Flex>
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
                            {orders.length === 0 ? (
                                <Tr>
                                    <Td colSpan={7} textAlign="center" py={8}>
                                        <Text color="gray.500">No orders found.</Text>
                                    </Td>
                                </Tr>
                            ) : (
                                orders.map(order => (
                                    <Tr key={order.id}>
                                        <Td fontWeight="bold">{order.order_number}</Td>
                                        <Td>{order.customer_name}</Td>
                                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(order.status)}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getPriorityColor(order.priority)}>
                                                {order.priority.toUpperCase()}
                                            </Badge>
                                        </Td>
                                        <Td isNumeric>{order.order_items[0]?.count || 0}</Td>
                                        <Td><Button size="xs" variant="ghost">View</Button></Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    )
}
