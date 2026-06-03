'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'

interface SwiperImage {
  url: string
  alt?: string
}

interface ProductSwiperProps {
  images: SwiperImage[]
  onSwiper: (swiper: SwiperType) => void
}

export default function ProductSwiper({ images, onSwiper }: ProductSwiperProps) {
  return (
    <div className="w-full aspect-square bg-gray-100 relative">
      <Swiper
        modules={[Pagination]}
        pagination={{ type: 'fraction' }}
        spaceBetween={0}
        slidesPerView={1}
        onSwiper={onSwiper}
        className="w-full h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img.url}
              alt={img.alt ?? ''}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
