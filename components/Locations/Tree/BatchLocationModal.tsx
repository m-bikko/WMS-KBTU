'use client'

import { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    HStack,
    NumberInput,
    NumberInputField,
    RadioGroup,
    Radio,
    Stack,
    Text,
    useToast,
    Divider,
    Box
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

interface BatchLocationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    parentNode: any // The parent to attach children to (null for root)
}

const LOCATION_TYPES = ['SECTION', 'FLOOR', 'ROW', 'COLUMN', 'ROOF', 'BIN', 'SHELF']

export default function BatchLocationModal({ isOpen, onClose, onSuccess, parentNode }: BatchLocationModalProps) {
    const [type, setType] = useState('SECTION')
    const [strategy, setStrategy] = useState('numeric') // 'numeric' | 'alphabetic'
    const [fromNum, setFromNum] = useState(1)
    const [toNum, setToNum] = useState(10)
    const [fromChar, setFromChar] = useState('A')
    const [toChar, setToChar] = useState('F')
    const [prefix, setPrefix] = useState('')
    const [capacity, setCapacity] = useState(0)

    const [loading, setLoading] = useState(false)
    const toast = useToast()

    // Determine default child type based on parent
    // e.g., if parent is SECTION -> default FLOOR
    const suggestChildType = (parentType: string) => {
        const types = ['SECTION', 'FLOOR', 'ROW', 'COLUMN', 'ROOF']
        const idx = types.indexOf(parentType)
        if (idx >= 0 && idx < types.length - 1) return types[idx + 1]
        return 'BIN'
    }

    const handleOpen = () => {
        if (parentNode) {
            setType(suggestChildType(parentNode.type))
        } else {
            setType('SECTION')
        }
    }

    const generateNames = () => {
        const names = []
        if (strategy === 'numeric') {
            for (let i = fromNum; i <= toNum; i++) {
                // Pad with zeros if needed? Let's keep it simple for now or pad to 2 chars
                const name = prefix + i.toString().padStart(2, '0')
                names.push(name)
            }
        } else {
            const start = fromChar.charCodeAt(0)
            const end = toChar.charCodeAt(0)
            for (let i = start; i <= end; i++) {
                const name = prefix + String.fromCharCode(i)
                names.push(name)
            }
        }
        return names
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const names = generateNames()
            if (names.length === 0) throw new Error('No names generated')
            if (names.length > 100) throw new Error('Cannot create more than 100 locations at once')

            const locations = names.map(name => ({
                parent_id: parentNode?.id || null,
                type,
                name,
                path: parentNode ? `${parentNode.path || parentNode.name}-${name}` : name, // Recursive path building
                capacity
            }))

            const { error } = await supabase
                .from('warehouse_locations')
                .insert(locations)

            if (error) throw error

            toast({ title: `Created ${names.length} locations`, status: 'success' })
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: 'Error creating locations', description: error.message, status: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const preview = generateNames().slice(0, 5).join(', ') + (generateNames().length > 5 ? '...' : '')

    return (
        <Modal isOpen={isOpen} onClose={onClose} onEsc={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Locations to {parentNode ? parentNode.name : 'Root'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel>Location Type</FormLabel>
                            <Select value={type} onChange={(e) => setType(e.target.value)}>
                                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Naming Strategy</FormLabel>
                            <RadioGroup value={strategy} onChange={setStrategy}>
                                <Stack direction="row">
                                    <Radio value="numeric">Numeric (1-10)</Radio>
                                    <Radio value="alphabetic">Alphabetic (A-Z)</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {strategy === 'numeric' ? (
                            <HStack>
                                <FormControl>
                                    <FormLabel>From</FormLabel>
                                    <NumberInput min={0} value={fromNum} onChange={(_, v) => setFromNum(v)}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>To</FormLabel>
                                    <NumberInput min={0} value={toNum} onChange={(_, v) => setToNum(v)}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </HStack>
                        ) : (
                            <HStack>
                                <FormControl>
                                    <FormLabel>From</FormLabel>
                                    <Input value={fromChar} onChange={(e) => setFromChar(e.target.value.toUpperCase().slice(0, 1))} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>To</FormLabel>
                                    <Input value={toChar} onChange={(e) => setToChar(e.target.value.toUpperCase().slice(0, 1))} />
                                </FormControl>
                            </HStack>
                        )}

                        <FormControl>
                            <FormLabel>Prefix (Optional)</FormLabel>
                            <Input placeholder="e.g. Row-" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Capacity (per location)</FormLabel>
                            <NumberInput min={0} value={capacity} onChange={(_, v) => setCapacity(v)}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>

                        <Box p={3} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" fontWeight="bold" mb={1}>Preview ({generateNames().length} items):</Text>
                            <Text fontSize="sm" color="gray.600">{preview}</Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        Create Locations
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
