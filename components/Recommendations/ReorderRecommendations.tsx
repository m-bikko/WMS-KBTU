'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Heading,
    Text,
    VStack,
    HStack,
    Badge,
    Card,
    CardBody,
    Spinner,
    useToast,
    Icon,
    useColorModeValue
} from '@chakra-ui/react'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ReorderRecommendations() {
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)
    const toast = useToast()

    // Color mode values
    const cardBg = useColorModeValue('blue.50', 'whiteAlpha.100')
    const cardBorder = useColorModeValue('blue.100', 'whiteAlpha.200')
    const textColor = useColorModeValue('gray.600', 'gray.400')
    const headingColor = useColorModeValue('gray.800', 'white')

    const fetchRecommendations = async () => {
        setLoading(true)
        try {
            // First, try to generate new ones
            await fetch('/api/recommendations/reorder', { method: 'POST' })

            // Then fetch from DB
            const { data, error } = await supabase
                .from('reorder_recommendations')
                .select(`
          *,
          inventory_items (sku, name)
        `)
                .order('created_at', { ascending: false })
                .eq('status', 'pending')

            if (error) throw error
            setRecommendations(data || [])
            setHasFetched(true)
        } catch (error: any) {
            toast({
                title: 'Error fetching recommendations',
                description: error.message,
                status: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box mt={8}>
            <HStack justify="space-between" mb={4}>
                <Heading size="md">Smart Reorder Suggestions</Heading>
                <Button
                    leftIcon={<Icon as={RefreshCw} />}
                    onClick={fetchRecommendations}
                    isLoading={loading}
                    size="sm"
                >
                    Refresh Analysis
                </Button>
            </HStack>

            <VStack align="stretch" spacing={4}>
                {loading ? (
                    <Spinner />
                ) : !hasFetched ? (
                    <Text color="gray.500">Run analysis to generate reorder suggestions.</Text>
                ) : recommendations.length === 0 ? (
                    <Text color="gray.500">No reorder recommendations at this time.</Text>
                ) : (
                    recommendations.map((rec) => (
                        <Card key={rec.id} variant="outline" borderColor={cardBorder} bg={cardBg}>
                            <CardBody>
                                <HStack justify="space-between">
                                    <VStack align="start" spacing={1}>
                                        <HStack>
                                            <Heading size="sm" color={headingColor}>{rec.inventory_items?.name}</Heading>
                                            <Badge colorScheme="purple">Confidence: {rec.confidence_score}%</Badge>
                                        </HStack>
                                        <Text fontSize="sm" color={textColor}>SKU: {rec.inventory_items?.sku}</Text>
                                        <Text fontSize="sm" mt={2} color={textColor}>
                                            <strong>Strategy:</strong> {rec.reasoning}
                                        </Text>
                                    </VStack>

                                    <VStack align="end">
                                        <Heading size="lg" color="blue.400">
                                            +{rec.recommended_quantity}
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500">Recommended Order</Text>
                                        <HStack mt={2}>
                                            <Button size="xs" colorScheme="green" leftIcon={<Icon as={CheckCircle} />}> Accept</Button>
                                            <Button size="xs" colorScheme="red" variant="ghost" leftIcon={<Icon as={XCircle} />}> Dismiss</Button>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))
                )}
            </VStack>
        </Box>
    )
}
