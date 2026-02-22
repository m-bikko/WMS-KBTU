'use client'

import { useState, useRef } from 'react'
import {
    Box,
    Heading,
    Text,
    Flex,
    VStack,
    HStack,
    Button,
    Icon,
    useColorModeValue,
    Image,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useToast,
    Spinner,
    Card,
    CardBody,
    Divider,
    IconButton
} from '@chakra-ui/react'
import { UploadCloud, FileText, CheckCircle, XCircle, FileImage, RefreshCw, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Dummy type for extracted items
interface ExtractedItem {
    id: string
    sku: string
    name: string
    quantity: number
    unit_cost: number
    status: 'pending' | 'verified' | 'error'
    confidence: number
}

export default function ReceivingPage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [extractedData, setExtractedData] = useState<ExtractedItem[]>([])

    // Dropzone logic
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toast = useToast()

    const bg = useColorModeValue('white', 'whiteAlpha.50')
    const borderColor = useColorModeValue('gray.200', 'gray.700')
    const dropzoneBg = useColorModeValue('gray.50', 'gray.800')
    const dropzoneActiveBg = useColorModeValue('blue.50', 'blue.900')

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const processFile = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
            toast({ title: 'Invalid format', description: 'Please upload an image or PDF.', status: 'error' })
            return
        }

        setFile(selectedFile)

        // Create preview if image
        if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)
        } else {
            setPreviewUrl(null) // Reset preview for PDF for now
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0])
        }
    }

    const handleAnalyze = async () => {
        if (!file) return

        setIsProcessing(true)
        setExtractedData([]) // Clear previous

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/process-document', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze document')
            }

            // Map the API response to our ExtractedItem format
            const parsedData: ExtractedItem[] = data.items.map((item: any, index: number) => ({
                id: `extracted-${index}-${Date.now()}`,
                sku: item.sku || `SKU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                name: item.name || 'Unknown Item',
                quantity: Number(item.quantity) || 1,
                unit_cost: Number(item.unit_cost) || 0,
                status: 'pending',
                confidence: Number(item.confidence) || 0.5
            }))

            setExtractedData(parsedData)
            toast({ title: 'Document analyzed successfully', status: 'success' })

        } catch (error: any) {
            console.error("Analysis Error:", error)
            toast({ title: 'Analysis failed', description: error.message, status: 'error' })
        } finally {
            setIsProcessing(false)
        }
    }

    const clearFile = () => {
        setFile(null)
        setPreviewUrl(null)
        setExtractedData([])
    }

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (extractedData.length === 0) return
        setIsSaving(true)
        try {
            // Map to inventory_items schema
            const payload = extractedData.map(item => ({
                sku: item.sku,
                name: item.name,
                category: 'Uncategorized', // Default
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                min_threshold: 10 // Default
            }))

            const { error } = await supabase.from('inventory_items').insert(payload)
            if (error) throw error

            toast({ title: 'Saved to Inventory', description: `Successfully added ${extractedData.length} items.`, status: 'success' })
            clearFile() // Reset page
        } catch (error: any) {
            toast({ title: 'Error saving to database', description: error.message, status: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Heading size="lg" mb={2}>Receiving & Document AI</Heading>
            <Text color="gray.500" mb={8}>Upload invoices or packing slips to automatically extract inventory data.</Text>

            <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>

                {/* Left Col: Upload & Preview */}
                <VStack flex={1} spacing={6} align="stretch" w="full" maxW={{ lg: "400px" }}>

                    {!file ? (
                        <Box
                            border="2px dashed"
                            borderColor={isDragging ? 'brand.500' : borderColor}
                            bg={isDragging ? dropzoneActiveBg : dropzoneBg}
                            borderRadius="xl"
                            p={10}
                            textAlign="center"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            cursor="pointer"
                            onClick={() => fileInputRef.current?.click()}
                            transition="all 0.2s"
                        >
                            <Input
                                type="file"
                                display="none"
                                ref={fileInputRef}
                                onChange={handleFileInput}
                                accept="image/*,application/pdf"
                            />
                            <Icon as={UploadCloud} size={48} color="gray.400" mb={4} />
                            <Text fontWeight="semibold" mb={2}>Drag & drop document here</Text>
                            <Text fontSize="sm" color="gray.500">Supports JPG, PNG, PDF (Max 5MB)</Text>
                        </Box>
                    ) : (
                        <Card variant="outline">
                            <CardBody>
                                <HStack justify="space-between" mb={4}>
                                    <HStack>
                                        <Icon as={file.type.includes('pdf') ? FileText : FileImage} color="brand.500" />
                                        <Text fontWeight="medium" noOfLines={1} maxW="200px">{file.name}</Text>
                                    </HStack>
                                    <IconButton
                                        icon={<XCircle size={18} />}
                                        size="sm"
                                        variant="ghost"
                                        aria-label="clear"
                                        onClick={clearFile}
                                    />
                                </HStack>

                                {previewUrl && (
                                    <Box
                                        borderRadius="md"
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        mb={4}
                                        bg="gray.100"
                                        h="300px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Image src={previewUrl} alt="Document Preview" maxH="full" objectFit="contain" />
                                    </Box>
                                )}

                                <Button
                                    w="full"
                                    colorScheme="brand"
                                    onClick={handleAnalyze}
                                    isLoading={isProcessing}
                                    loadingText="Analyzing Document..."
                                    leftIcon={<RefreshCw size={18} />}
                                >
                                    Extract Data
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </VStack>

                {/* Right Col: Extracted Data */}
                <Box flex={2}>
                    <Card variant="outline" h="full" minH="500px">
                        <CardBody display="flex" flexDirection="column">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md">Extracted Items</Heading>
                                {extractedData.length > 0 && (
                                    <Button size="sm" colorScheme="green" leftIcon={<Save size={16} />} onClick={handleSave} isLoading={isSaving} loadingText="Saving...">
                                        Save to Inventory
                                    </Button>
                                )}
                            </Flex>

                            {extractedData.length === 0 ? (
                                <Flex flex={1} align="center" justify="center" direction="column" color="gray.400">
                                    <Icon as={FileText} size={64} mb={4} opacity={0.5} />
                                    <Text>Data will appear here after analysis.</Text>
                                </Flex>
                            ) : (
                                <Table variant="simple" size="sm">
                                    <Thead bg={dropzoneBg}>
                                        <Tr>
                                            <Th>SKU</Th>
                                            <Th>Description</Th>
                                            <Th isNumeric>Qty</Th>
                                            <Th isNumeric>Unit Price</Th>
                                            <Th>Confidence</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {extractedData.map(item => (
                                            <Tr key={item.id}>
                                                <Td fontWeight="bold">{item.sku}</Td>
                                                <Td>{item.name}</Td>
                                                <Td isNumeric>{item.quantity}</Td>
                                                <Td isNumeric>${item.unit_cost}</Td>
                                                <Td>
                                                    <Badge colorScheme={item.confidence > 0.9 ? 'green' : 'yellow'}>
                                                        {Math.round(item.confidence * 100)}%
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            )}
                        </CardBody>
                    </Card>
                </Box>

            </Flex>
        </Box>
    )
}
