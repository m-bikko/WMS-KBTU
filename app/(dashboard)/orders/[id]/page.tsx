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

// Mock Data for Order Details
const MOCK_ORDER = {
    id: 'ORD-001',
    customer: {
        name: 'Acme Corp',
        email: 'logistics@acme.com',
        address: '123 Industrial Way, Sector 7'
    },
    status: 'Pending',
    priority: 'Normal',
    createdAt: 'Oct 24, 2023',
    items: [
        { sku: 'SKU-001', name: 'Wireless Controller', quantity: 5, location: 'Zone C - Aisle 3 - Shelf 2' },
        { sku: 'SKU-005', name: 'HDMI Cable 6ft', quantity: 10, location: 'Zone A - Aisle 1 - Shelf 5' },
        { sku: 'SKU-012', name: 'Power Adapter', quantity: 2, location: 'Zone B - Aisle 4 - Shelf 1' },
        { sku: 'SKU-008', name: 'USB-C Hub', quantity: 3, location: 'Zone A - Aisle 12 - Shelf 3' },
        { sku: 'SKU-022', name: 'Monitor Stand', quantity: 1, location: 'Zone D - Aisle 1 - Shelf 1' },
    ]
}

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    // In a real app, fetch order by params.id
    const order = MOCK_ORDER

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
                    <Heading size="lg">Order #{order.id}</Heading>
                    <Badge colorScheme="yellow" fontSize="0.9em">{order.status}</Badge>
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
                            {order.items.map((item) => (
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
