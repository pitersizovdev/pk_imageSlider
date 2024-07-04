import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import s from "./imageslider.module.scss";

// Types for props
interface ImageSliderProps {
  children: ReactNode;
  autoplay?: number;
  dots?: boolean;
  arrows?: boolean;
  swipeDesktop?: boolean;
  swipeMobile?: boolean;
  draggable?: boolean;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  children,
  autoplay,
  dots = true,
  arrows = true,
  swipeDesktop = true,
  swipeMobile = true,
  draggable = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(1); // Start from 1 because of prepended slide
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const slidesWrapperRef = useRef<HTMLDivElement | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const startX = useRef<number | null>(null);
  const diffXRef = useRef<number>(0);
  const totalSlides = React.Children.count(children);

  const slides = React.Children.toArray(children);
  const clonedSlides = [slides[totalSlides - 1], ...slides, slides[0]]; // Cloning last to first and first to last

  const handleTransitionEnd = useCallback(() => {
    setIsAnimating(false);
    if (currentIndex === 0) {
      setCurrentIndex(totalSlides); // Jump to the actual last slide
      slidesWrapperRef.current!.style.transition = "none";
      slidesWrapperRef.current!.style.transform = `translateX(-${
        totalSlides * 100
      }%)`;
    } else if (currentIndex === totalSlides + 1) {
      setCurrentIndex(1); // Jump to the actual first slide
      slidesWrapperRef.current!.style.transition = "none";
      slidesWrapperRef.current!.style.transform = `translateX(-100%)`;
    }
  }, [currentIndex, totalSlides]);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  }, [isAnimating]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
    },
    [isAnimating]
  );

  const handleDragStart = useCallback(
    (_e: React.MouseEvent | React.TouchEvent) => {
      const clientX = "touches" in _e ? _e.touches[0].clientX : _e.clientX;
      startX.current = clientX;
      diffXRef.current = 0;
      if (draggable) {
        slidesWrapperRef.current!.style.transition = "none";
      }
    },
    [draggable]
  );

  const handleDragMove = useCallback(
    (_e: React.MouseEvent | React.TouchEvent) => {
      if (startX.current === null) return;
      const clientX = "touches" in _e ? _e.touches[0].clientX : _e.clientX;
      const diffX = clientX - startX.current;
      diffXRef.current = diffX;
      if (draggable) {
        const translateX =
          -currentIndex * 100 +
          (diffX / slidesWrapperRef.current!.clientWidth) * 100;
        slidesWrapperRef.current!.style.transform = `translateX(${translateX}%)`;
      }
    },
    [currentIndex, draggable]
  );

  const handleDragEnd = useCallback(
    (_e: React.MouseEvent | React.TouchEvent) => {
      if (startX.current === null) return;
      const threshold = slidesWrapperRef.current!.clientWidth / 4;
      if (draggable && Math.abs(diffXRef.current) > threshold) {
        if (diffXRef.current < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      } else if (!draggable) {
        // Standard swipe logic without inertia
        if (diffXRef.current < -threshold) {
          nextSlide();
        } else if (diffXRef.current > threshold) {
          prevSlide();
        }
      } else {
        setIsAnimating(true);
        slidesWrapperRef.current!.style.transition =
          "transform 0.5s ease-in-out";
        slidesWrapperRef.current!.style.transform = `translateX(-${
          currentIndex * 100
        }%)`;
      }
      startX.current = null;
      diffXRef.current = 0;
    },
    [currentIndex, nextSlide, prevSlide, draggable]
  );

  useEffect(() => {
    const transition = isAnimating ? "transform 0.5s ease-in-out" : "none";
    slidesWrapperRef.current!.style.transition = transition;
    slidesWrapperRef.current!.style.transform = `translateX(-${
      currentIndex * 100
    }%)`;
  }, [currentIndex, isAnimating]);

  useEffect(() => {
    if (autoplay) {
      autoPlayRef.current = setInterval(nextSlide, autoplay);
      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoplay, nextSlide]);

  return (
    <div className={s.ImageSliderContainer}>
      <div
        className={s.ImageSliderTrack}
        ref={slidesWrapperRef}
        onMouseDown={swipeDesktop ? handleDragStart : undefined}
        onMouseMove={swipeDesktop ? handleDragMove : undefined}
        onMouseUp={swipeDesktop ? handleDragEnd : undefined}
        onMouseLeave={swipeDesktop ? handleDragEnd : undefined}
        onTouchStart={swipeMobile ? handleDragStart : undefined}
        onTouchMove={swipeMobile ? handleDragMove : undefined}
        onTouchEnd={swipeMobile ? handleDragEnd : undefined}
        onTransitionEnd={handleTransitionEnd}
      >
        {clonedSlides.map((slide, index) => (
          <div className={s.ImageSliderSlide} key={index}>
            {slide}
          </div>
        ))}
      </div>
      {arrows && (
        <>
          <button
            className={`${s.ImageSliderArrow} ${s.ImageSliderArrowLeft}`}
            onClick={prevSlide}
          >
            ‹
          </button>
          <button
            className={`${s.ImageSliderArrow} ${s.ImageSliderArrowRight}`}
            onClick={nextSlide}
          >
            ›
          </button>
        </>
      )}
      {dots && (
        <div className={s.ImageSliderBullets}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${s.ImageSliderBullet} ${
                currentIndex === index + 1 ? s.ImageSliderBulletActive : ""
              }`}
              onClick={() => goToSlide(index + 1)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};
