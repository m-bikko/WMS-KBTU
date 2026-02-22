'use client'

import { useState } from 'react'
import {
    Box,
    Button,
    Heading,
    Text,
    VStack,
    HStack,
    Stepper,
    Step,
    StepIndicator,
    StepStatus,
    StepIcon,
    StepNumber,
    StepTitle,
    StepDescription,
    StepSeparator,
    useSteps,
    Card,
    CardBody,
    Badge,
    Icon,
    Collapse,
    useToast
} from '@chakra-ui/react'
import { Map, Footprints, ChevronDown, ChevronUp } from 'lucide-react'

interface Item {
    sku: string
    name: string
    location: string
    quantity: number
}

interface PickPathOptimizerProps {
    items: Item[]
}

export default function PickPathOptimizer({ items }: PickPathOptimizerProps) {
    const [optimizedPath, setOptimizedPath] = useState<Item[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const toast = useToast()

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: items.length,
    })

    // Initial sort strictly by SKU for demo if not optimized
    const displayItems = optimizedPath.length > 0 ? optimizedPath : items

    const handleOptimize = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/recommendations/pick-path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    warehouse_layout: "standard" // context for AI
                })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setOptimizedPath(data.path)
            setIsOpen(true)
            toast({
                title: 'Path Optimized',
                description: 'AI has calculated the most efficient route.',
                status: 'success'
            })

        } catch (error: any) {
            toast({
                title: 'Optimization Failed',
                description: error.message,
                status: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box mt={6} p={5} borderWidth="1px" borderRadius="lg" bg="whiteAlpha.500">
            <HStack justify="space-between" mb={4}>
                <HStack>
                    <Icon as={Map} color="blue.500" />
                    <Heading size="md">Picking Route</Heading>
                </HStack>
                <Button
                    leftIcon={<Icon as={Footprints} />}
                    colorScheme="blue"
                    onClick={handleOptimize}
                    isLoading={loading}
                    size="sm"
                >
                    Optimize Path (AI)
                </Button>
            </HStack>

            {optimizedPath.length > 0 && (
                <Text fontSize="sm" color="green.600" mb={4} fontWeight="bold">
                    ⚡ Path optimized for efficiency by AI
                </Text>
            )}

            <Stepper index={activeStep} orientation="vertical" height="300px" gap="0">
                {displayItems.map((item, index) => (
                    <Step key={index}>
                        <StepIndicator>
                            <StepStatus
                                complete={<StepIcon />}
                                incomplete={<StepNumber />}
                                active={<StepNumber />}
                            />
                        </StepIndicator>

                        <Box flexShrink='0'>
                            <StepTitle>
                                {item.location} <Badge ml={2}>{item.sku}</Badge>
                            </StepTitle>
                            <StepDescription>
                                Pick {item.quantity}x {item.name}
                            </StepDescription>
                        </Box>

                        <StepSeparator />
                    </Step>
                ))}
            </Stepper>
        </Box>
    )
}
