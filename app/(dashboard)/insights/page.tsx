'use client'

import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    useColorModeValue,
    Flex,
    Select,
    Spinner,
    Center
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts'

export default function InsightsPage() {
    const bg = useColorModeValue('white', 'dark.surface')
    const borderColor = useColorModeValue('gray.200', 'dark.border')

    const [orderData, setOrderData] = useState<any[]>([])
    const [categoryData, setCategoryData] = useState<any[]>([])
    const [aiSuggestion, setAiSuggestion] = useState<string>('Analyzing your warehouse patterns...')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInsightsData()
    }, [])

    const fetchInsightsData = async () => {
        try {
            // 1. Fetch Order Volume (Group by Day for last 7 days)
            const { data: orders } = await supabase
                .from('orders')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

            // Default 7 days map
            const daysMap: Record<string, number> = {}
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                daysMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0
            }

            orders?.forEach(order => {
                const day = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' })
                if (daysMap[day] !== undefined) {
                    daysMap[day] += 1
                }
            })

            const formattedOrders = Object.keys(daysMap).map(key => ({
                name: key,
                orders: daysMap[key]
            }))
            setOrderData(formattedOrders)

            // 2. Fetch Category Distribution
            const { data: items } = await supabase
                .from('inventory_items')
                .select('category, quantity')

            const catMap: Record<string, number> = {}
            items?.forEach(item => {
                catMap[item.category] = (catMap[item.category] || 0) + item.quantity
            })

            const formattedCats = Object.keys(catMap).map(key => ({
                name: key,
                value: catMap[key]
            }))
            setCategoryData(formattedCats)

            // 3. Fetch latest AI Insight
            const { data: insight } = await supabase
                .from('daily_insights')
                .select('content')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (insight) {
                setAiSuggestion(insight.content)
            } else {
                setAiSuggestion('No recent AI suggestions. Generate them from the overview dashboard.')
            }

        } catch (error) {
            console.error('Error fetching insights data', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" />
            </Center>
        )
    }

    return (
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Heading mb={2}>Trend Analysis</Heading>
            <Text mb={8} color="gray.500">AI-powered analysis of warehouse performance.</Text>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                {/* Order Volume Trend */}
                <Box p={6} bg={bg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                    <Flex justify="space-between" align="center" mb={6}>
                        <Heading size="md">Weekly Order Volume</Heading>
                        <Select w="150px" size="sm" defaultValue="7days">
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </Select>
                    </Flex>
                    <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orderData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="orders" stroke="#2196f3" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                {/* Inventory Distribution */}
                <Box p={6} bg={bg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                    <Heading size="md" mb={6}>Stock by Category</Heading>
                    <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#00e676" name="Items Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>
            </SimpleGrid>

            {/* AI Recommendation Section */}
            <Box mt={8} p={6} bg="brand.900" borderRadius="lg" position="relative" overflow="hidden">
                <Box position="relative" zIndex={1}>
                    <Heading size="md" color="white" mb={2}>🤖 AI Suggestion</Heading>
                    <Text color="whiteAlpha.900">
                        {aiSuggestion}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
