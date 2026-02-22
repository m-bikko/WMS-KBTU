'use client'

import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
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
import { Plus, Search, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface InventoryItem {
    id: string
    sku: string
    name: string
    category: string
    min_threshold: number
    unit_cost: number
    inventory_stock: { quantity: number }[]
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    useEffect(() => {
        fetchInventory()
    }, [])

    const fetchInventory = async () => {
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .select(`
          *,
          inventory_stock (quantity)
        `)

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error('Error fetching inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const calculateTotalStock = (stock: { quantity: number }[]) => {
        return stock.reduce((acc, curr) => acc + curr.quantity, 0)
    }

    return (
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Flex justify="space-between" align="center" mb={8}>
                <Heading size="lg">Inventory</Heading>
                <Button leftIcon={<Plus size={18} />} colorScheme="brand">
                    Add Item
                </Button>
            </Flex>

            <Flex mb={6} gap={4}>
                <InputGroup maxW="md">
                    <InputLeftElement pointerEvents="none">
                        <Search color="gray.300" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search by SKU or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                <Button leftIcon={<Filter size={18} />} variant="outline">
                    Filters
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
                                <Th>SKU</Th>
                                <Th>Name</Th>
                                <Th>Category</Th>
                                <Th isNumeric>Stock</Th>
                                <Th isNumeric>Unit Cost</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredItems.length === 0 ? (
                                <Tr>
                                    <Td colSpan={7} textAlign="center" py={8}>
                                        <Text color="gray.500">No items found.</Text>
                                    </Td>
                                </Tr>
                            ) : (
                                filteredItems.map(item => {
                                    const totalStock = calculateTotalStock(item.inventory_stock)
                                    const isLowStock = totalStock < item.min_threshold

                                    return (
                                        <Tr key={item.id}>
                                            <Td fontWeight="bold">{item.sku}</Td>
                                            <Td>{item.name}</Td>
                                            <Td>{item.category}</Td>
                                            <Td isNumeric>{totalStock}</Td>
                                            <Td isNumeric>${item.unit_cost}</Td>
                                            <Td>
                                                <Badge colorScheme={isLowStock ? 'red' : 'green'}>
                                                    {isLowStock ? 'Low Stock' : 'In Stock'}
                                                </Badge>
                                            </Td>
                                            <Td><Button size="xs" variant="ghost">Edit</Button></Td>
                                        </Tr>
                                    )
                                })
                            )}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    )
}
