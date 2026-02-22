'use client'

import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    useColorModeValue,
    Flex,
    Select
} from '@chakra-ui/react'
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

// Mock Data for demonstration
const orderData = [
    { name: 'Mon', orders: 12 },
    { name: 'Tue', orders: 19 },
    { name: 'Wed', orders: 15 },
    { name: 'Thu', orders: 25 },
    { name: 'Fri', orders: 22 },
    { name: 'Sat', orders: 10 },
    { name: 'Sun', orders: 8 },
]

const categoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'HomeGoods', value: 30 },
    { name: 'Apparel', value: 55 },
    { name: 'Automotive', value: 20 },
]

export default function InsightsPage() {
    const bg = useColorModeValue('white', 'dark.surface')
    const borderColor = useColorModeValue('gray.200', 'dark.border')

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
                        Based on the order trends, picking efficiency drops by 15% on Thursdays.
                        Consider adding an extra shift or pre-batching orders on Wednesday evenings.
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
