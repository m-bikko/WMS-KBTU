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
    Icon
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

export default function Dashboard() {
    return (
        <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Heading mb={8} size="lg">Dashboard Overview</Heading>

            <DailyInsights />

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
                <StatsCard
                    title={'Total Inventory Value'}
                    stat={'$45,231.89'}
                    icon={TrendingUp}
                    helpText={'23.36%'}
                    type={'increase'}
                />
                <StatsCard
                    title={'Total Items'}
                    stat={'1,230'}
                    icon={Package}
                />
                <StatsCard
                    title={'Pending Orders'}
                    stat={'12'}
                    icon={ShoppingCart}
                    helpText={'5 new today'}
                    type={'increase'}
                />
                <StatsCard
                    title={'Low Stock Items'}
                    stat={'7'}
                    icon={AlertTriangle}
                    helpText={'Action needed'}
                    type={'decrease'}
                />
            </SimpleGrid>

            <Box mt={8}>
                <TopRecommendations />
            </Box>

            {/* Add more dashboard content here later */}
            <Box mt={10} p={8} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="gray.800">
                <Heading size="md" mb={4}>Recent Activity</Heading>
                <Text color="gray.500">No recent activity to display.</Text>
            </Box>
        </Box>
    )
}
