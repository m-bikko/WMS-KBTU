'use client'

import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Badge,
    Icon,
    Button,
    useColorModeValue,
    Spinner,
    Flex
} from '@chakra-ui/react'
import { Lightbulb, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Insight {
    id: string
    title: string
    content: string
    severity: 'info' | 'warning' | 'critical'
    type: 'summary' | 'anomaly' | 'trend'
    created_at: string
}

export default function DailyInsights() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    const bg = useColorModeValue('whiteAlpha.50', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    useEffect(() => {
        fetchInsights()
    }, [])

    const fetchInsights = async () => {
        try {
            const { data, error } = await supabase
                .from('daily_insights')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3) // Get latest 3

            if (error) throw error
            setInsights(data || [])
        } catch (error) {
            console.error('Error fetching insights:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateInsights = async () => {
        setGenerating(true)
        try {
            await fetch('/api/insights/generate', { method: 'POST' })
            fetchInsights() // Refresh list
        } catch (error) {
            console.error("Failed to generate:", error)
        } finally {
            setGenerating(false)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'anomaly': return AlertTriangle
            case 'trend': return TrendingUp
            default: return Lightbulb
        }
    }

    const getColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'red.400'
            case 'warning': return 'orange.400'
            default: return 'brand.400'
        }
    }

    return (
        <Box
            p={6}
            mb={8}
            bg={bg}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            backdropFilter="blur(10px)"
        >
            <Flex justify="space-between" align="center" mb={4}>
                <HStack>
                    <Icon as={Lightbulb} color="yellow.400" w={5} h={5} />
                    <Heading size="md">Daily Intelligent Insights</Heading>
                </HStack>
                <Button
                    size="sm"
                    isLoading={generating}
                    leftIcon={<RefreshCw size={14} />}
                    onClick={generateInsights}
                    variant="ghost"
                >
                    Refresh Analysis
                </Button>
            </Flex>

            {loading ? (
                <Flex justify="center" py={4}>
                    <Spinner />
                </Flex>
            ) : insights.length === 0 ? (
                <Text color="gray.500">No insights generated for today yet. Click Refresh to analyze.</Text>
            ) : (
                <VStack align="stretch" spacing={3}>
                    {insights.map(post => (
                        <Box
                            key={post.id}
                            p={4}
                            bg="blackAlpha.200"
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor={getColor(post.severity)}
                        >
                            <HStack justify="space-between" mb={1}>
                                <HStack>
                                    <Icon as={getIcon(post.type)} size={16} color={getColor(post.severity)} />
                                    <Text fontWeight="bold">{post.title}</Text>
                                </HStack>
                                <Badge colorScheme={post.severity === 'critical' ? 'red' : post.severity === 'warning' ? 'orange' : 'blue'}>
                                    {post.type.toUpperCase()}
                                </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.400">{post.content}</Text>
                        </Box>
                    ))}
                </VStack>
            )}
        </Box>
    )
}
