'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    VStack,
    Text,
    HStack,
    Icon,
    Collapse,
    Button,
    IconButton,
    useColorModeValue,
    Spinner
} from '@chakra-ui/react'
import { ChevronRight, ChevronDown, Folder, Box as BoxIcon, MapPin, Grid, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TreeNode {
    id: string
    name: string
    type: string
    children?: TreeNode[]
    isExpanded?: boolean
}

interface TreeSidebarProps {
    onSelectNode: (node: any) => void
    selectedNodeId?: string
    refreshTrigger?: number
}

const TreeNodeItem = ({ node, level, onSelect, selectedId, onExpand }: any) => {
    const isSelected = node.id === selectedId
    const hasChildren = node.children && node.children.length > 0
    const [expanded, setExpanded] = useState(false)

    // Auto-expand if child selected (simplified logic)

    const handleToggle = (e: any) => {
        e.stopPropagation()
        setExpanded(!expanded)
        if (!expanded && onExpand) onExpand(node)
    }

    const handleClick = () => {
        onSelect(node)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'SECTION': return MapPin
            case 'FLOOR': return Grid
            case 'ROW': return Folder
            default: return BoxIcon
        }
    }

    const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.200')
    const selectedBg = useColorModeValue('blue.50', 'blue.900')
    const selectedColor = useColorModeValue('blue.600', 'blue.200')

    return (
        <Box w="full">
            <HStack
                py={1.5}
                pl={`${level * 16 + 8}px`}
                pr={2}
                cursor="pointer"
                bg={isSelected ? selectedBg : 'transparent'}
                color={isSelected ? selectedColor : 'inherit'}
                _hover={{ bg: isSelected ? selectedBg : hoverBg }}
                onClick={handleClick}
                borderRadius="md"
                transition="all 0.2s"
            >
                <IconButton
                    icon={expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    size="xs"
                    variant="ghost"
                    aria-label="Toggle"
                    onClick={handleToggle}
                    visibility={hasChildren ? 'visible' : 'hidden'} // Or always visible to allow loading?
                    opacity={0.5}
                />

                <Icon as={getIcon(node.type)} size={16} color={isSelected ? selectedColor : 'gray.500'} />

                <Text fontSize="sm" fontWeight={isSelected ? 'semibold' : 'normal'} noOfLines={1}>
                    {node.name} <Text as="span" fontSize="xs" color="gray.500">({node.type})</Text>
                </Text>
            </HStack>

            <Collapse in={expanded} animateOpacity>
                {node.children?.map((child: any) => (
                    <TreeNodeItem
                        key={child.id}
                        node={child}
                        level={level + 1}
                        onSelect={onSelect}
                        selectedId={selectedId}
                        onExpand={onExpand}
                    />
                ))}
            </Collapse>
        </Box>
    )
}

export default function TreeSidebar({ onSelectNode, selectedNodeId, refreshTrigger }: TreeSidebarProps) {
    const [treeData, setTreeData] = useState<TreeNode[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTree = async () => {
        setLoading(true)
        try {
            // Fetch all locations for now (optimize later for lazy loading if needed)
            const { data, error } = await supabase
                .from('warehouse_locations')
                .select('*')
                .order('name') // Alphabetic sort

            if (error) throw error

            // Build tree
            const buildTree = (parentId: string | null): TreeNode[] => {
                return (data || [])
                    .filter((item: any) => item.parent_id === parentId)
                    .map((item: any) => ({
                        ...item,
                        children: buildTree(item.id)
                    }))
            }

            const rootNodes = buildTree(null)
            setTreeData(rootNodes)
        } catch (error) {
            console.error('Error fetching tree:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTree()
    }, [refreshTrigger])

    const borderColor = useColorModeValue('gray.200', 'gray.700')

    return (
        <Box
            w="300px"
            h="calc(100vh - 100px)"
            borderRight="1px solid"
            borderColor={borderColor}
            overflowY="auto"
            pr={2}
        >
            <HStack mb={4} px={2} justify="space-between">
                <Text fontWeight="bold" color="gray.500" fontSize="sm">HIERARCHY</Text>
                <IconButton
                    icon={<Plus size={16} />}
                    size="xs"
                    aria-label="Add Root"
                    onClick={() => onSelectNode(null)} // Select null to prompt adding root
                />
            </HStack>

            {loading ? (
                <Box p={4} textAlign="center"><Spinner size="sm" /></Box>
            ) : treeData.length === 0 ? (
                <Text p={4} fontSize="sm" color="gray.500" textAlign="center">
                    No locations found. Click + to add.
                </Text>
            ) : (
                <VStack spacing={0} align="stretch">
                    {treeData.map(node => (
                        <TreeNodeItem
                            key={node.id}
                            node={node}
                            level={0}
                            onSelect={onSelectNode}
                            selectedId={selectedNodeId}
                        />
                    ))}
                </VStack>
            )}
        </Box>
    )
}
