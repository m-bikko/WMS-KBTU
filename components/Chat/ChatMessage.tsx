'use client'

import { Box, Flex, Text, useColorModeValue, Avatar, Code } from '@chakra-ui/react'
import { CircuitBoard, User } from 'lucide-react'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    data?: any // Table or Chart data
}

interface ChatMessageProps {
    message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user'
    const bg = useColorModeValue(isUser ? 'brand.500' : 'gray.100', isUser ? 'brand.500' : 'whiteAlpha.200')
    const color = isUser ? 'white' : useColorModeValue('gray.800', 'white')

    return (
        <Flex w="full" justify={isUser ? 'flex-end' : 'flex-start'} mb={4}>
            {!isUser && (
                <Box mr={2} mt={1}>
                    <Box p={1.5} bg="brand.500" borderRadius="full">
                        <CircuitBoard size={14} color="white" />
                    </Box>
                </Box>
            )}

            <Box maxW="80%">
                <Box
                    bg={bg}
                    color={color}
                    px={4}
                    py={2}
                    borderRadius="lg"
                    borderBottomRightRadius={isUser ? 0 : 'lg'}
                    borderBottomLeftRadius={!isUser ? 0 : 'lg'}
                >
                    <Text fontSize="sm" whiteSpace="pre-wrap">{message.content}</Text>
                </Box>

                {/* Render data visualization if present (placeholder for now) */}
                {message.data && (
                    <Box mt={2} p={2} bg="blackAlpha.200" borderRadius="md">
                        <Code fontSize="xs">{JSON.stringify(message.data).slice(0, 100)}...</Code>
                    </Box>
                )}
            </Box>

            {isUser && (
                <Avatar size="xs" ml={2} mt={1} />
            )}
        </Flex>
    )
}
