'use client'

import {
    Box,
    Button,
    Flex,
    IconButton,
    Input,
    VStack,
    Text,
    useColorModeValue,
    useDisclosure,
    SlideFade
} from '@chakra-ui/react'
import { MessageCircle, X, Send, CircuitBoard } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ChatMessage, { Message } from './ChatMessage'

export default function ChatWidget() {
    const { isOpen, onToggle } = useDisclosure()
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I can help you find items, check stock, or analyze orders. What would you like to know?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const bg = useColorModeValue('white', 'gray.800')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content }),
            })

            const data = await response.json()

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.text || "Sorry, I couldn't process that.",
                data: data.data
            }

            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, something went wrong. Please try again."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating Button */}
            <Box position="fixed" bottom="6" right="6" zIndex="tooltip">
                <IconButton
                    aria-label="Open Chat"
                    icon={isOpen ? <X /> : <CircuitBoard />}
                    colorScheme="brand"
                    size="lg"
                    isRound
                    shadow="lg"
                    onClick={onToggle}
                    fontSize="24px"
                />
            </Box>

            {/* Chat Window */}
            <SlideFade in={isOpen} offsetY="20px">
                <Box
                    position="fixed"
                    bottom="24"
                    right="6"
                    w={{ base: "calc(100vw - 48px)", md: "400px" }}
                    h="600px"
                    maxH="calc(100vh - 120px)"
                    bg={bg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    shadow="2xl"
                    zIndex="popover"
                    overflow="hidden"
                    display={isOpen ? 'block' : 'none'}
                >
                    {/* Header */}
                    <Flex
                        p={4}
                        borderBottom="1px"
                        borderColor={borderColor}
                        bg="brand.500"
                        color="white"
                        align="center"
                    >
                        <CircuitBoard size={20} />
                        <Text ml={3} fontWeight="bold">Warehouse Assistant</Text>
                    </Flex>

                    {/* Messages */}
                    <VStack
                        h="calc(100% - 130px)"
                        overflowY="auto"
                        p={4}
                        spacing={0}
                        align="stretch"
                        css={{
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-track': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': { background: 'gray.500', borderRadius: '24px' },
                        }}
                    >
                        {messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                        {isLoading && (
                            <Flex mb={4} align="center">
                                <Box p={1.5} bg="brand.500" borderRadius="full" mr={2}>
                                    <CircuitBoard size={14} color="white" />
                                </Box>
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">Thinking...</Text>
                            </Flex>
                        )}
                        <div ref={messagesEndRef} />
                    </VStack>

                    {/* Input */}
                    <Box p={4} borderTop="1px" borderColor={borderColor}>
                        <Flex>
                            <Input
                                placeholder="Ask about inventory, orders..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                mr={2}
                                disabled={isLoading}
                            />
                            <IconButton
                                aria-label="Send"
                                icon={<Send size={18} />}
                                colorScheme="brand"
                                onClick={handleSend}
                                isLoading={isLoading}
                            />
                        </Flex>
                    </Box>
                </Box>
            </SlideFade>
        </>
    )
}
