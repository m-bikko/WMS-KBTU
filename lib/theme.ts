import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const colors = {
    brand: {
        50: '#e3f2fd',
        100: '#bbdefb',
        200: '#90caf9',
        300: '#64b5f6',
        400: '#42a5f5',
        500: '#2196f3', // Primary
        600: '#1e88e5',
        700: '#1976d2',
        800: '#1565c0',
        900: '#0d47a1',
    },
    accent: {
        500: '#00e676', // Success/Active
        600: '#00c853',
    },
    dark: {
        bg: '#0f172a', // Slate 900
        surface: '#1e293b', // Slate 800
        border: '#334155', // Slate 700
    },
}

const styles = {
    global: (props: any) => ({
        body: {
            bg: props.colorMode === 'dark' ? 'dark.bg' : 'gray.50',
            color: props.colorMode === 'dark' ? 'white' : 'gray.900',
        },
    }),
}

const theme = extendTheme({
    config,
    colors,
    styles,
    components: {
        Button: {
            defaultProps: {
                colorScheme: 'brand',
            },
            variants: {
                solid: (props: any) => ({
                    bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.600',
                    },
                }),
            },
        },
        Card: {
            baseStyle: (props: any) => ({
                container: {
                    bg: props.colorMode === 'dark' ? 'dark.surface' : 'white',
                    borderColor: props.colorMode === 'dark' ? 'dark.border' : 'gray.200',
                    borderWidth: '1px',
                    boxShadow: 'md',
                },
            }),
        },
    },
})

export default theme
