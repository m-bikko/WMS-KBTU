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
    Spinner
} from '@chakra-ui/react'
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
        totalItems: 0,
        totalValue: 0,
        pendingOrders: 0,
        lowStockItems: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMetrics()
    }, [])

    const fetchMetrics = async () => {
        try {
            // 1. Total Items
            const { count: itemsCount } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true })

            // 2. Pending Orders
            const { count: pendingCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')

            // 3. Low Stock & Total Value (Requires fetching data to calculate client side, usually nice to have a view for this)
            // For now, fetch all items stock and cost
            const { data: stockData } = await supabase
                .from('inventory_items')
                .select('min_threshold, unit_cost, inventory_stock(quantity)')

            let lowStock = 0
            let value = 0

            stockData?.forEach(item => {
                const totalStock = item.inventory_stock.reduce((acc: number, curr: any) => acc + curr.quantity, 0)

                if (totalStock < item.min_threshold) {
                    lowStock++
                }

                value += totalStock * item.unit_cost
            })

            setMetrics({
                totalItems: itemsCount || 0,
                totalValue: value,
                pendingOrders: pendingCount || 0,
                lowStockItems: lowStock
            })

        } catch (error) {
            console.error('Error fetching metrics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Flex justify="center" align="center" h="50vh">
                <Spinner size="xl" color="brand.500" />
            </Flex>
        )
    }

    return (
        <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Heading mb={8} size="lg">Dashboard Overview</Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
                <StatsCard
                    title={'Total Inventory Value'}
                    stat={`$${metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    helpText={'Real-time'}
                    type={'increase'}
                />
                <StatsCard
                    title={'Total Items'}
                    stat={metrics.totalItems.toString()}
                    icon={Package}
                />
                <StatsCard
                    title={'Pending Orders'}
                    stat={metrics.pendingOrders.toString()}
                    icon={ShoppingCart}
                    helpText={'Needs attention'}
                    type={'increase'}
                />
                <StatsCard
                    title={'Low Stock Items'}
                    stat={metrics.lowStockItems.toString()}
                    icon={AlertTriangle}
                    helpText={metrics.lowStockItems > 0 ? 'Restock needed' : 'All good'}
                    type={'decrease'}
                />
            </SimpleGrid>

            {/* Add more dashboard content here later */}
            <Box mt={10} p={8} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="gray.800">
                <Heading size="md" mb={4}>Recent Activity</Heading>
                <Text color="gray.500">Live activity feed coming in Phase 3.</Text>
            </Box>
        </Box>
    )
}
