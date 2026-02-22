'use client'

import { Box, SimpleGrid, Heading, Text, Flex, useColorModeValue, Progress, Tooltip, Badge } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface ZoneData {
    zone: string
    utilization: number
    capacity: number
    locations: any[]
}

interface WarehouseMapProps {
    data: ZoneData[]
    loading: boolean
}

const MotionBox = motion(Box)

export default function WarehouseMap({ data, loading }: WarehouseMapProps) {
    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    if (loading) return <Text>Loading Map...</Text>

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {data.map((zone) => (
                <Box
                    key={zone.zone}
                    p={6}
                    bg={bg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    position="relative"
                    overflow="hidden"
                >
                    <Flex justify="space-between" mb={4}>
                        <Heading size="md">Zone {zone.zone}</Heading>
                        <Text color="gray.500">Utilization: {zone.utilization}%</Text>
                    </Flex>

                    <Progress
                        value={zone.utilization}
                        colorScheme={zone.utilization > 90 ? 'red' : zone.utilization > 70 ? 'yellow' : 'green'}
                        borderRadius="full"
                        mb={6}
                    />

                    <SimpleGrid columns={4} spacing={2}>
                        {zone.locations.map((loc, i) => {
                            // Calculate color based on individual location utilization
                            const util = (loc.current_utilization / loc.capacity) * 100
                            const color = util > 90 ? 'red.500' : util > 50 ? 'yellow.400' : 'green.400'
                            const bgOpacity = util === 0 ? 0.3 : 0.8 // Dim if empty

                            return (
                                <Tooltip
                                    key={loc.id}
                                    label={`Aisle ${loc.aisle}, Shelf ${loc.shelf}, Bin ${loc.bin} (${util.toFixed(0)}%)`}
                                    hasArrow
                                >
                                    <MotionBox
                                        h="12"
                                        bg={util === 0 ? 'gray.600' : color} // Gray if empty, color scale if used
                                        opacity={bgOpacity}
                                        borderRadius="md"
                                        cursor="pointer"
                                        whileHover={{ scale: 1.05 }}
                                        layoutId={loc.id}
                                    />
                                </Tooltip>
                            )
                        })}
                    </SimpleGrid>
                </Box>
            ))}
        </SimpleGrid>
    )
}
