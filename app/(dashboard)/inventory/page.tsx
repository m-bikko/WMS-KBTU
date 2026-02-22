'use client'

import { useState, useEffect } from 'react'
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
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Spinner,
    Center
} from '@chakra-ui/react'
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ReorderRecommendations from '@/components/Recommendations/ReorderRecommendations'
import InventoryModal from '@/components/Inventory/InventoryModal'

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    const toast = useToast()
    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('inventory_items')
                .select('*')
                .order('created_at', { ascending: false })

            if (itemsError) throw itemsError

            // Fetch Locations (for the dropdown)
            const { data: locData, error: locError } = await supabase
                .from('warehouse_locations')
                .select('*')
                .order('path')

            if (locError) throw locError

            setItems(itemsData || [])
            setLocations(locData || [])
        } catch (error: any) {
            toast({ title: 'Error loading inventory', description: error.message, status: 'error' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const { error } = await supabase.from('inventory_items').delete().eq('id', id)
            if (error) throw error
            toast({ title: 'Item deleted', status: 'success' })
            fetchData()
        } catch (error: any) {
            toast({ title: 'Error deleting item', description: error.message, status: 'error' })
        }
    }

    const openAddModal = () => {
        setSelectedItem(null)
        setIsModalOpen(true)
    }

    const openEditModal = (item: any) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">Inventory</Heading>
                <Button leftIcon={<Plus size={18} />} colorScheme="brand" onClick={openAddModal}>
                    Add Item
                </Button>
            </Flex>

            <ReorderRecommendations />

            <Box h={8} />

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
                    <Center p={10}><Spinner /></Center>
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
                                    <Td colSpan={7} textAlign="center" py={10}>
                                        No items found. Add one to get started.
                                    </Td>
                                </Tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <Tr key={item.id}>
                                        <Td fontWeight="bold">{item.sku}</Td>
                                        <Td>{item.name}</Td>
                                        <Td>{item.category}</Td>
                                        <Td isNumeric>{item.quantity}</Td>
                                        <Td isNumeric>${item.unit_cost}</Td>
                                        <Td>
                                            <Badge colorScheme={item.quantity <= item.min_threshold ? 'red' : 'green'}>
                                                {item.quantity <= item.min_threshold ? 'Low Stock' : 'In Stock'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton as={IconButton} icon={<MoreVertical size={16} />} variant="ghost" size="sm" aria-label="Actions" />
                                                <MenuList>
                                                    <MenuItem icon={<Edit2 size={16} />} onClick={() => openEditModal(item)}>Edit</MenuItem>
                                                    <MenuItem icon={<Trash2 size={16} />} color="red.500" onClick={() => handleDelete(item.id)}>Delete</MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                )}
            </Box>

            <InventoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                initialData={selectedItem}
                locations={locations}
            />
        </Box>
    )
}
