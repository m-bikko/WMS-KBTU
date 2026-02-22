'use client'

import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    Badge,
    Grid,
    GridItem,
    VStack,
    HStack,
    Divider,
    useColorModeValue,
    Icon
} from '@chakra-ui/react'
import { ArrowLeft, Printer, Package, User, Calendar, Truck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import PickPathOptimizer from '@/components/Recommendations/PickPathOptimizer'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Spinner, Center } from '@chakra-ui/react'

// No longer using MOCK_ORDER

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!params.id) return
        fetchOrderDetails(params.id as string)
    }, [params.id])

    const fetchOrderDetails = async (id: string) => {
        try {
            // 1. Fetch Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single()

            if (orderError) throw orderError

            // 2. Fetch Order Items with Inventory and Location details
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select(`
                    quantity_ordered,
                    inventory_items (
                        sku,
                        name,
                        inventory_stock (
                            quantity,
                            warehouse_locations (
                                path,
                                name
                            )
                        )
                    )
                `)
                .eq('order_id', id)

            if (itemsError) throw itemsError

            // Format items
            const formattedItems = itemsData.map((item: any) => {
                const inventory = item.inventory_items
                const stock = inventory.inventory_stock?.[0]
                const location = stock?.warehouse_locations?.path || stock?.warehouse_locations?.name || 'Unassigned'

                return {
                    sku: inventory.sku,
                    name: inventory.name,
                    quantity: item.quantity_ordered,
                    location: location
                }
            })

            setOrder({
                id: orderData.id,
                order_number: orderData.order_number,
                customer: {
                    name: orderData.customer_name,
                    email: `contact@${orderData.customer_name.replace(/\s+/g, '').toLowerCase()}.com`,
                    address: 'Saved in CRM (Mock Address)'
                },
                status: orderData.status,
                priority: orderData.priority,
                createdAt: new Date(orderData.created_at).toLocaleDateString(),
                items: formattedItems
            })
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" />
            </Center>
        )
    }

    if (!order) {
        return <Box p={10}>Order not found.</Box>
    }

    return (
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Button
                onClick={() => router.back()}
                leftIcon={<ArrowLeft size={16} />}
                variant="ghost"
                mb={4}
            >
                Back to Orders
            </Button>

            <Flex justify="space-between" align="center" mb={6}>
                <HStack>
                    <Heading size="lg">Order {order.order_number}</Heading>
                    <Badge colorScheme={order.status === 'pending' ? 'yellow' : order.status === 'shipped' ? 'green' : 'blue'} fontSize="0.9em">{order.status}</Badge>
                </HStack>
                <Button leftIcon={<Printer size={16} />} variant="outline">
                    Print Packing Slip
                </Button>
            </Flex>

            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                <GridItem>
                    {/* Order Items */}
                    <Box
                        bg={bg}
                        p={6}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={borderColor}
                        mb={6}
                    >
                        <Heading size="md" mb={4}>Order Items</Heading>
                        <VStack align="stretch" spacing={0} divider={<Divider />}>
                            {order.items.map((item: any) => (
                                <Flex key={item.sku} justify="space-between" py={3}>
                                    <HStack>
                                        <Box p={2} bg="gray.100" borderRadius="md">
                                            <Package size={20} color="#4A5568" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold">{item.name}</Text>
                                            <Text fontSize="sm" color="gray.500">{item.sku}</Text>
                                        </Box>
                                    </HStack>
                                    <VStack align="end" spacing={0}>
                                        <Text fontWeight="bold">Qty: {item.quantity}</Text>
                                        <Badge variant="outline">{item.location}</Badge>
                                    </VStack>
                                </Flex>
                            ))}
                        </VStack>
                    </Box>

                    {/* AI Pick Path Optimization */}
                    <PickPathOptimizer items={order.items} />

                </GridItem>

                <GridItem>
                    {/* Customer Info */}
                    <Box
                        bg={bg}
                        p={6}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={borderColor}
                    >
                        <Heading size="md" mb={4}>Customer Details</Heading>

                        <VStack align="start" spacing={4}>
                            <HStack align="start">
                                <Icon as={User} mt={1} color="gray.500" />
                                <Box>
                                    <Text fontWeight="bold">{order.customer.name}</Text>
                                    <Text fontSize="sm" color="gray.500">{order.customer.email}</Text>
                                </Box>
                            </HStack>

                            <HStack align="start">
                                <Icon as={Truck} mt={1} color="gray.500" />
                                <Box>
                                    <Text fontWeight="bold">Shipping Address</Text>
                                    <Text fontSize="sm" color="gray.500">{order.customer.address}</Text>
                                </Box>
                            </HStack>

                            <HStack align="start">
                                <Icon as={Calendar} mt={1} color="gray.500" />
                                <Box>
                                    <Text fontWeight="bold">Order Date</Text>
                                    <Text fontSize="sm" color="gray.500">{order.createdAt}</Text>
                                </Box>
                            </HStack>
                        </VStack>
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    )
}
