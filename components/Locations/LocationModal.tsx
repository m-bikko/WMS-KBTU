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

interface LocationItem {
    id?: string
    zone: string
    aisle: string
    shelf: string
    bin: string
    capacity: number
    current_utilization?: number
}

interface LocationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialData?: LocationItem
}

const ZONES = ['A', 'B', 'C', 'D', 'E', 'F']

export default function LocationModal({ isOpen, onClose, onSuccess, initialData }: LocationModalProps) {
    const [formData, setFormData] = useState<LocationItem>({
        zone: 'A',
        aisle: '',
        shelf: '',
        bin: '',
        capacity: 100
    })
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            // Reset form for "Add" mode
            setFormData({
                zone: 'A',
                aisle: '',
                shelf: '',
                bin: '',
                capacity: 100
            })
        }
    }, [initialData, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNumberChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Prepare payload
            const payload = {
                zone: formData.zone,
                aisle: formData.aisle,
                shelf: formData.shelf,
                bin: formData.bin,
                capacity: Number(formData.capacity)
            }

            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from('inventory_locations')
                    .update(payload)
                    .eq('id', initialData.id)
                if (error) throw error
                toast({ title: 'Location updated successfully', status: 'success' })
            } else {
                // Create
                const { error } = await supabase
                    .from('inventory_locations')
                    .insert([payload])
                if (error) throw error
                toast({ title: 'Location created successfully', status: 'success' })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: 'Error saving location', description: error.message, status: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{initialData ? 'Edit Location' : 'Add New Location'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Zone</FormLabel>
                            <Select name="zone" value={formData.zone} onChange={handleChange}>
                                {ZONES.map(z => <option key={z} value={z}>Zone {z}</option>)}
                            </Select>
                        </FormControl>

                        <SimpleGrid columns={3} spacing={4} w="full">
                            <FormControl isRequired>
                                <FormLabel>Aisle</FormLabel>
                                <Input name="aisle" value={formData.aisle} onChange={handleChange} placeholder="01" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Shelf</FormLabel>
                                <Input name="shelf" value={formData.shelf} onChange={handleChange} placeholder="A" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Bin</FormLabel>
                                <Input name="bin" value={formData.bin} onChange={handleChange} placeholder="01" />
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isRequired>
                            <FormLabel>Capacity (Units)</FormLabel>
                            <NumberInput min={0} value={formData.capacity} onChange={(v) => handleNumberChange('capacity', v)}>
                                <NumberInputField />
                                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                            </NumberInput>
                        </FormControl>
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
