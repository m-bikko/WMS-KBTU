'use client'

import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Icon,
    Spinner,
    Badge,
    useColorModeValue
} from '@chakra-ui/react'
import { Lightbulb, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function TopRecommendations() {
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const { data } = await supabase
                    .from('reorder_recommendations')
                    .select('*, inventory_items(name)')
                    .eq('status', 'pending')
                    .order('confidence_score', { ascending: false })
                    .limit(3)

                if (data) setRecommendations(data)
            } finally {
                setLoading(false)
            }
        }
        fetchRecs()
    }, [])

    if (!loading && recommendations.length === 0) return null

    return (
        <Box
            bg={bg}
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            mb={8}
        >
            <HStack justify="space-between" mb={4}>
                <HStack>
                    <Icon as={Lightbulb} color="purple.500" />
                    <Heading size="md">AI Recommendations</Heading>
                </HStack>
                <Button
                    as={Link}
                    href="/inventory"
                    size="sm"
                    variant="ghost"
                    rightIcon={<ArrowRight size={16} />}
                >
                    View All
                </Button>
            </HStack>

            {loading ? (
                <Spinner size="sm" />
            ) : (
                <VStack align="stretch" spacing={3}>
                    {recommendations.map((rec) => (
                        <HStack key={rec.id} justify="space-between" p={3} bg="whiteAlpha.200" borderRadius="md">
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">{rec.inventory_items?.name}</Text>
                                <Text fontSize="xs" color="gray.500">{rec.reasoning.substring(0, 60)}...</Text>
                            </VStack>
                            <Badge colorScheme="purple">Order +{rec.recommended_quantity}</Badge>
                        </HStack>
                    ))}
                </VStack>
            )}
        </Box>
    )
}
