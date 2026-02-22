'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    VStack,
    SimpleGrid,
    useToast
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

interface InventoryItem {
    id?: string
    sku: string
    name: string
    description?: string
    category: string
    quantity: number
    unit_cost: number
    location_id?: string
    min_threshold: number
    max_threshold?: number
}

interface InventoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialData?: InventoryItem
    locations: any[]
}

const CATEGORIES = ['Electronics', 'Automotive', 'Apparel', 'Home & Garden', 'Toys', 'Other']

export default function InventoryModal({ isOpen, onClose, onSuccess, initialData, locations }: InventoryModalProps) {
    const [formData, setFormData] = useState<InventoryItem>({
        sku: '',
        name: '',
        description: '',
        category: 'Electronics',
        quantity: 0,
        unit_cost: 0,
        location_id: '',
        min_threshold: 10,
        max_threshold: 100
    })
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            // Reset form for "Add" mode
            setFormData({
                sku: '',
                name: '',
                description: '',
                category: 'Electronics',
                quantity: 0,
                unit_cost: 0,
                location_id: '',
                min_threshold: 10,
                max_threshold: 100
            })
        }
    }, [initialData, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNumberChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Prepare payload
            const payload = {
                sku: formData.sku,
                name: formData.name,
                description: formData.description,
                category: formData.category,
                quantity: Number(formData.quantity),
                unit_cost: Number(formData.unit_cost),
                location_id: formData.location_id || null, // Ensure null if empty
                min_threshold: Number(formData.min_threshold),
                max_threshold: formData.max_threshold ? Number(formData.max_threshold) : null
            }

            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from('inventory_items')
                    .update(payload)
                    .eq('id', initialData.id)
                if (error) throw error
                toast({ title: 'Item updated successfully', status: 'success' })
            } else {
                // Create
                const { error } = await supabase
                    .from('inventory_items')
                    .insert([payload])
                if (error) throw error
                toast({ title: 'Item created successfully', status: 'success' })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: 'Error saving item', description: error.message, status: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{initialData ? 'Edit Item' : 'Add New Item'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <SimpleGrid columns={2} spacing={4} w="full">
                            <FormControl isRequired>
                                <FormLabel>SKU</FormLabel>
                                <Input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU-123" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Name</FormLabel>
                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Item Name" />
                            </FormControl>
                        </SimpleGrid>

                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Input name="description" value={formData.description} onChange={handleChange} />
                        </FormControl>

                        <SimpleGrid columns={2} spacing={4} w="full">
                            <FormControl>
                                <FormLabel>Category</FormLabel>
                                <Select name="category" value={formData.category} onChange={handleChange}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Location</FormLabel>
                                <Select name="location_id" value={formData.location_id} onChange={handleChange} placeholder="Select Location">
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.path || loc.name} ({loc.current_utilization}%)
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={3} spacing={4} w="full">
                            <FormControl isRequired>
                                <FormLabel>Quantity</FormLabel>
                                <NumberInput min={0} value={formData.quantity} onChange={(v) => handleNumberChange('quantity', v)}>
                                    <NumberInputField />
                                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Cost ($)</FormLabel>
                                <NumberInput min={0} precision={2} value={formData.unit_cost} onChange={(v) => handleNumberChange('unit_cost', v)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Min Stock</FormLabel>
                                <NumberInput min={0} value={formData.min_threshold} onChange={(v) => handleNumberChange('min_threshold', v)}>
                                    <NumberInputField />
                                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </SimpleGrid>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
