'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { ImageInfo } from '@/adapters/catalogAdapter'

interface ProductSwiperProps {
  images: ImageInfo[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

export default function ProductSwiper({ images, currentIndex, onIndexChange }: ProductSwiperProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 text-xs">
        无可用图片
      </div>
    )
  }

  return (
    <div className="w-full aspect-square bg-zinc-50 rounded-2xl overflow-hidden shadow-inner relative">
      <Swiper
        modules={[Pagination]}
        pagination={{ type: 'fraction' }}
        spaceBetween={0}
        slidesPerView={1}
        initialSlide={currentIndex}
        onSlideChange={(swiper) => onIndexChange(swiper.activeIndex)}
        className="w-full h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute top-4 right-4 bg-zinc-950/75 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border border-white/10 shadow z-10 pointer-events-none">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
