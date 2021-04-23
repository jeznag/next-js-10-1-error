import React, { FC } from 'react'

import { OkraIconContainer } from './styles'

type Props = {
    size?: number
    className?: string
}

export const OkraIcon: FC<Props> = ({ size = 24, className }: Props) => {
    return (
        <OkraIconContainer className={className}>
            <svg
                viewBox="0 0 137 137"
                height={size}
                width={size}
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
            >
                <path d="M 0.00 0.00 L 137.00 0.00 L 137.00 137.00 L 0.00 137.00 L 0.00 0.00 Z" fill="rgba(255,255,255,0)" />
                <path
                    d="M 71.51 1.43 C 76.13 2.23 79.78 5.83 83.46 8.53 C 98.61 19.99 113.88 31.52 129.00 43.01 C 134.65 47.23 137.35 55.10 134.84 61.80 C 128.30 82.88 121.73 104.00 115.10 125.05 C 113.12 131.47 106.66 135.88 100.03 135.92 C 79.37 135.96 58.63 135.90 37.96 135.95 C 33.00 136.07 28.68 134.32 25.24 130.75 C 22.10 127.67 21.28 123.08 19.96 119.03 C 14.25 100.74 8.58 82.45 2.83 64.17 C 1.88 60.90 0.69 57.82 1.33 54.35 C 2.12 49.42 4.51 45.49 8.54 42.54 C 25.27 29.89 41.91 17.30 58.64 4.64 C 62.30 1.80 66.92 0.45 71.51 1.43 Z"
                    fill="#232323"
                />
                <path
                    d="M 78.61 17.38 C 91.85 27.48 105.30 37.33 118.43 47.58 C 124.02 51.59 125.97 59.41 123.89 65.82 C 119.20 81.68 113.89 97.36 109.18 113.21 C 108.02 117.33 106.05 121.00 102.41 123.42 C 99.32 125.69 95.76 126.17 92.02 126.17 C 75.98 126.09 59.99 126.14 43.96 126.15 C 39.95 126.18 36.57 125.09 33.46 122.55 C 28.98 119.17 27.86 112.77 26.21 107.71 C 22.66 96.83 19.44 85.86 16.04 74.94 C 14.18 68.95 11.32 63.42 12.73 56.97 C 13.73 50.99 18.52 47.47 23.04 44.05 C 35.34 35.05 47.36 25.67 59.61 16.61 C 65.34 12.58 73.16 13.10 78.61 17.38 Z"
                    fill="#434343"
                />
                <path
                    d="M 65.36 27.35 C 69.28 25.75 73.64 26.56 77.06 28.91 C 83.25 33.03 86.19 41.40 84.58 48.54 C 82.56 55.01 75.94 60.09 70.23 63.26 C 68.15 64.72 66.86 62.91 65.16 61.85 C 60.65 58.39 55.65 53.48 54.16 47.83 C 52.57 39.71 57.45 30.22 65.36 27.35 Z"
                    fill="#ffffff"
                />
                <path
                    d="M 33.36 49.37 C 38.09 47.97 44.04 48.26 48.46 50.56 C 54.05 54.02 57.01 61.37 58.47 67.50 C 58.65 69.15 59.65 70.81 58.00 71.98 C 53.62 75.52 48.31 78.49 42.79 79.72 C 37.67 80.75 33.50 78.44 29.70 75.30 C 25.53 71.90 22.56 66.60 23.08 61.10 C 23.84 55.52 28.02 50.98 33.36 49.37 Z"
                    fill="#ffffff"
                />
                <path
                    d="M 102.52 51.68 C 109.28 53.23 114.69 58.75 114.72 65.90 C 114.03 74.94 105.72 81.87 97.00 82.61 C 89.82 82.13 82.79 76.93 77.87 71.96 C 79.45 66.07 82.05 59.77 86.35 55.34 C 90.40 51.03 97.06 50.64 102.52 51.68 Z"
                    fill="#ffffff"
                />
                <path
                    d="M 64.40 67.36 C 69.53 64.94 75.52 67.55 76.62 73.21 C 77.67 78.77 72.47 83.61 67.10 83.09 C 64.66 82.47 62.43 80.83 61.11 78.69 C 59.45 74.71 60.13 69.38 64.40 67.36 Z"
                    fill="#ffffff"
                />
                <path
                    d="M 52.34 83.25 C 55.50 83.15 59.61 82.86 62.46 84.38 C 64.80 90.46 66.74 98.23 64.65 104.62 C 62.86 109.66 57.96 113.35 53.09 115.13 C 47.43 117.16 40.65 116.10 36.85 111.15 C 31.39 104.38 33.50 93.31 39.66 87.65 C 43.12 84.38 47.77 83.64 52.34 83.25 Z"
                    fill="#ffffff"
                />
                <path
                    d="M 73.50 84.43 C 78.99 83.20 85.53 84.24 90.74 86.27 C 96.18 88.45 98.90 93.39 100.15 98.86 C 101.14 102.60 100.53 106.48 98.95 109.96 C 96.69 114.73 91.44 117.95 86.14 117.67 C 81.32 117.45 76.85 114.86 73.55 111.46 C 71.30 109.09 69.35 106.33 69.05 102.98 C 68.46 96.64 70.59 89.99 73.50 84.43 Z"
                    fill="#ffffff"
                />
            </svg>
        </OkraIconContainer>
    )
}