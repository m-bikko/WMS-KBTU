'use client'

import { useState } from 'react'
import { Box, Flex, Heading, Text, Button, useDisclosure, VStack, Card, CardBody, Badge, HStack, IconButton } from '@chakra-ui/react'
import { Plus, Trash2 } from 'lucide-react'
import TreeSidebar from '@/components/Locations/Tree/TreeSidebar'
import BatchLocationModal from '@/components/Locations/Tree/BatchLocationModal'
import { supabase } from '@/lib/supabase'

export default function LocationsPage() {
    const [selectedNode, setSelectedNode] = useState<any>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Modal
    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleSelectNode = (node: any) => {
        setSelectedNode(node)
        // If node is null (Root selected), we might pop modal immediately or show root view?
        // Let's show a "Root" details pane.
        if (node === null) {
            // User likely clicked "+" next to Hierarchy
            onOpen()
        }
    }

    const handleDelete = async () => {
        if (!selectedNode) return
        if (!confirm(`Are you sure you want to delete ${selectedNode.name} and ALL its children?`)) return

        try {
            await supabase.from('warehouse_locations').delete().eq('id', selectedNode.id)
            setRefreshTrigger(p => p + 1)
            setSelectedNode(null)
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    return (
        <Box maxW="full" h="calc(100vh - 80px)" overflow="hidden">


            <Flex h="full">
                {/* Left Sidebar */}
                <TreeSidebar
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNode?.id}
                    refreshTrigger={refreshTrigger}
                />

                {/* Main Content */}
                <Box flex={1} p={6} overflowY="auto">
                    <Heading size="lg" mb={6}>Warehouse Hierarchy</Heading>

                    {!selectedNode ? (
                        <Box textAlign="center" py={20}>
                            <Text color="gray.500" fontSize="lg">Select a location from the tree to view details.</Text>
                            <Button mt={4} leftIcon={<Plus />} colorScheme="brand" onClick={onOpen}>
                                Add Root Section
                            </Button>
                        </Box>
                    ) : (
                        <VStack align="stretch" spacing={6}>
                            <Card>
                                <CardBody>
                                    <Flex justify="space-between" align="start">
                                        <VStack align="start" spacing={1}>
                                            <Badge colorScheme="purple">{selectedNode.type}</Badge>
                                            <Heading size="lg">{selectedNode.name}</Heading>
                                            <Text color="gray.500" fontSize="sm">Full Path: {selectedNode.path || selectedNode.name}</Text>
                                        </VStack>
                                        <HStack>
                                            <IconButton
                                                icon={<Trash2 size={18} />}
                                                colorScheme="red"
                                                variant="ghost"
                                                aria-label="Delete"
                                                onClick={handleDelete}
                                            />
                                            <Button leftIcon={<Plus size={18} />} colorScheme="brand" onClick={onOpen}>
                                                Add Child
                                            </Button>
                                        </HStack>
                                    </Flex>

                                    <HStack mt={6} spacing={8}>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">Capacity</Text>
                                            <Text fontSize="2xl" fontWeight="bold">{selectedNode.capacity || '-'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">Utilization</Text>
                                            <Text fontSize="2xl" fontWeight="bold">{selectedNode.current_utilization || 0}%</Text>
                                        </Box>
                                    </HStack>
                                </CardBody>
                            </Card>

                            <Box>
                                <Heading size="md" mb={4}>Sub-locations</Heading>
                                <Text color="gray.500">
                                    (Grid view of children would go here - for now navigate via tree)
                                </Text>
                            </Box>
                        </VStack>
                    )}
                </Box>
            </Flex>

            <BatchLocationModal
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={() => setRefreshTrigger(p => p + 1)}
                parentNode={selectedNode}
            />
        </Box>
    )
}
