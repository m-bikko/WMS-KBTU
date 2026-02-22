'use client'

import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    FormControl,
    FormLabel,
    Flex
} from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, CircuitBoard } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast({
                title: 'Welcome back!',
                description: "You've successfully logged in.",
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            router.push('/')
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Flex
            h="100vh"
            align="center"
            justify="center"
            bgGradient="linear(to-br, gray.900, brand.900)"
            color="white"
        >
            <Container maxW="md">
                <Box
                    p={8}
                    borderRadius="xl"
                    bg="whiteAlpha.100"
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    boxShadow="xl"
                >
                    <Stack spacing={6} as="form" onSubmit={handleLogin}>
                        <Flex align="center" justify="center" direction="column" mb={4}>
                            <Box p={3} bg="brand.500" borderRadius="full" mb={4}>
                                <CircuitBoard size={32} color="white" />
                            </Box>
                            <Heading size="lg" fontWeight="bold">WarehouseIQ</Heading>
                            <Text color="gray.400" fontSize="sm">AI-Powered Warehouse Intelligence</Text>
                        </Flex>

                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Mail size={18} color="#A0AEC0" />
                                </InputLeftElement>
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    bg="blackAlpha.300"
                                    border="none"
                                    _focus={{ bg: 'blackAlpha.400', ring: 2, ringColor: 'brand.500' }}
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Lock size={18} color="#A0AEC0" />
                                </InputLeftElement>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    bg="blackAlpha.300"
                                    border="none"
                                    _focus={{ bg: 'blackAlpha.400', ring: 2, ringColor: 'brand.500' }}
                                />
                            </InputGroup>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="brand"
                            size="lg"
                            fontSize="md"
                            isLoading={loading}
                            loadingText="Signing in..."
                            w="full"
                            mt={4}
                        >
                            Sign In
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Flex>
    )
}
