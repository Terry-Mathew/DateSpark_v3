import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#FFB800',
					foreground: '#1A1A1A'
				},
				secondary: {
					DEFAULT: '#E94E77',
					foreground: '#FFFFFF'
				},
				accent: {
					DEFAULT: '#6B4DE6',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#F4F4F5',
					foreground: '#71717A'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontSize: {
				'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'title': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'subtitle': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'lead': ['1.25rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
			},
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fadeIn': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'slideUp': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.85',
						transform: 'scale(1.05)'
					}
				},
				'bounce': {
					'0%, 100%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(-15px)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'shimmer': {
					'100%': {
						transform: 'translateX(100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fadeIn': 'fadeIn 0.5s ease-out forwards',
				'slideUp': 'slideUp 0.5s ease-out forwards',
				'fade-in': 'fade-in 1s ease-out forwards',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce': 'bounce 2s infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'shimmer': 'shimmer 2s infinite'
			},
			spacing: {
				'section': '40px',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
