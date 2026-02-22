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
    useColorModeValue
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'

export default function OrdersPage() {
    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

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
                        <Tr>
                            <Td fontWeight="bold">ORD-001</Td>
                            <Td>Acme Corp</Td>
                            <Td>Oct 24, 2023</Td>
                            <Td><Badge colorScheme="yellow">Pending</Badge></Td>
                            <Td><Badge colorScheme="blue">Normal</Badge></Td>
                            <Td isNumeric>5</Td>
                            <Td><Button as="a" href="/orders/ORD-001" size="xs" variant="ghost">View</Button></Td>
                        </Tr>
                        <Tr>
                            <Td fontWeight="bold">ORD-002</Td>
                            <Td>Global Tech</Td>
                            <Td>Oct 23, 2023</Td>
                            <Td><Badge colorScheme="green">Shipped</Badge></Td>
                            <Td><Badge colorScheme="red">High</Badge></Td>
                            <Td isNumeric>12</Td>
                            <Td><Button size="xs" variant="ghost">View</Button></Td>
                        </Tr>
                    </Tbody>
                </Table>
            </Box>
        </Box>
    )
}
