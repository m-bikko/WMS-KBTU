'use client'

import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Heading,
    Text,
    Flex,
    Icon,
    Badge,
    Spinner,
    VStack,
    HStack
} from '@chakra-ui/react'
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import DailyInsights from '@/components/Dashboard/DailyInsights'
import TopRecommendations from '@/components/Dashboard/TopRecommendations'

interface StatsCardProps {
    title: string
    stat: string
    icon: any
    helpText?: string
    type?: 'increase' | 'decrease'
}

function StatsCard(props: StatsCardProps) {
    const { title, stat, icon, helpText, type } = props

    return (
        <Stat
            px={{ base: 2, md: 4 }}
            py={'5'}
            shadow={'xl'}
            border={'1px solid'}
            borderColor={'gray.800'}
            rounded={'lg'}
            bg="whiteAlpha.50"
            backdropFilter="blur(10px)"
        >
            <Flex justifyContent={'space-between'}>
                <Box pl={{ base: 2, md: 4 }}>
                    <StatLabel fontWeight={'medium'} isTruncated>
                        {title}
                    </StatLabel>
                    <StatNumber fontSize={'2xl'} fontWeight={'bold'}>
                        {stat}
                    </StatNumber>
                    {helpText && (
                        <StatHelpText>
                            <StatArrow type={type} />
                            {helpText}
                        </StatHelpText>
                    )}
                </Box>
                <Box
                    my={'auto'}
                    color={'gray.800'}
                    alignContent={'center'}
                >
                    <Icon as={icon} w={8} h={8} color="brand.400" />
                </Box>
            </Flex>
        </Stat>
    )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalValue: 0,
        totalItems: 0,
        pendingOrders: 0,
        lowStockItems: 0
    })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1 & 2. Total Value & Total Items (quantity across all items)
                const { data: items, error: itemsError } = await supabase
                    .from('inventory_items')
                    .select('quantity, unit_cost, min_threshold')

                if (itemsError) throw itemsError

                let value = 0
                let itemsCount = 0
                let lowStock = 0

                items?.forEach(item => {
                    value += (item.quantity * item.unit_cost)
                    itemsCount += item.quantity
                    if (item.quantity <= item.min_threshold) {
                        lowStock += 1
                    }
                })

                // 3. Pending Orders
                const { count: pendingOrders, error: ordersError } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending')

                if (ordersError) throw ordersError

                // 4. Recent Activity (Latest 5 Orders)
                const { data: recentOrders, error: recentError } = await supabase
                    .from('orders')
                    .select('id, order_number, customer_name, status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (recentError) throw recentError

                setRecentActivity(recentOrders || [])

                setStats({
                    totalValue: value,
                    totalItems: itemsCount,
                    pendingOrders: pendingOrders || 0,
                    lowStockItems: lowStock
                })
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Heading mb={8} size="lg">Dashboard Overview</Heading>

            <DailyInsights />

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
                <StatsCard
                    title={'Total Inventory Value'}
                    stat={loading ? '...' : `$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    helpText={'Live'}
                    type={'increase'}
                />
                <StatsCard
                    title={'Total Items (Qty)'}
                    stat={loading ? '...' : stats.totalItems.toLocaleString()}
                    icon={Package}
                />
                <StatsCard
                    title={'Pending Orders'}
                    stat={loading ? '...' : stats.pendingOrders.toString()}
                    icon={ShoppingCart}
                    helpText={'Needs attention'}
                    type={stats.pendingOrders > 0 ? 'increase' : undefined}
                />
                <StatsCard
                    title={'Low Stock Items'}
                    stat={loading ? '...' : stats.lowStockItems.toString()}
                    icon={AlertTriangle}
                    helpText={'Below threshold'}
                    type={stats.lowStockItems > 0 ? 'decrease' : undefined}
                />
            </SimpleGrid>

            <Box mt={8}>
                <TopRecommendations />
            </Box>

            {/* Add more dashboard content here later */}
            <Box mt={10} p={8} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="gray.800">
                <Heading size="md" mb={4}>Recent Activity</Heading>
                {loading ? (
                    <Spinner size="sm" />
                ) : recentActivity.length === 0 ? (
                    <Text color="gray.500">No recent activity to display.</Text>
                ) : (
                    <VStack align="stretch" spacing={4}>
                        {recentActivity.map((order) => (
                            <HStack key={order.id} justify="space-between" p={4} bg="blackAlpha.200" borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                                <VStack align="start" spacing={1}>
                                    <HStack>
                                        <Text fontWeight="bold">{order.order_number}</Text>
                                        <Badge colorScheme={order.status === 'pending' ? 'yellow' : order.status === 'shipped' ? 'green' : 'blue'}>
                                            {order.status}
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.400">Customer: {order.customer_name}</Text>
                                </VStack>
                                <Text fontSize="xs" color="gray.500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Box>
        </Box>
    )
}
