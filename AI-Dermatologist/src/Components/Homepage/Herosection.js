import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import styles from './Herosection.module.css';
// Import all carousel images
import home1 from '../../assets/home1.jpeg';
import home2 from '../../assets/home2.jpeg';
import home3 from '../../assets/home3.jpeg';
import home4 from '../../assets/home4.jpeg';
import home5 from '../../assets/home5.jpeg';

const carouselImages = [
    { src: home1, alt: "AI Powered Dermatology Analysis" },
    { src: home2, alt: "AI Powered Dermatology Analysis" },
    { src: home3, alt: "AI Powered Dermatology Analysis" },
    { src: home4, alt: "AI Powered Dermatology Analysis" },
    { src: home5, alt: "AI Powered Dermatology Analysis" }
];

const Herosection = React.memo(() => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(1); // Start at 1 because we duplicate first image at start
    const carouselRef = useRef(null);

    // Memoize duplicated images array to prevent recreation on every render
    const duplicatedImages = useMemo(() => [
        carouselImages[carouselImages.length - 1], // Last image
        ...carouselImages,
        carouselImages[0] // First image
    ], []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => prevIndex + 1);
        }, 2000); // Change image every 2 seconds

        return () => clearInterval(interval);
    }, []);

    // Handle seamless loop when reaching the end
    useEffect(() => {
        const handleTransitionEnd = () => {
            // If we've reached the duplicate first image (last position)
            if (currentImageIndex >= duplicatedImages.length - 1) {
                // Instantly reset to real first image without transition
                if (carouselRef.current) {
                    carouselRef.current.style.transition = 'none';
                    setCurrentImageIndex(1);
                    // Force reflow and re-enable transition
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            if (carouselRef.current) {
                                carouselRef.current.style.transition = '';
                            }
                        });
                    });
                }
            }
        };

        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener('transitionend', handleTransitionEnd);
            return () => {
                carousel.removeEventListener('transitionend', handleTransitionEnd);
            };
        }
    }, [currentImageIndex, duplicatedImages.length]);

    const handleGetStarted = useCallback(() => {
        navigate('/Firstscreen');
    }, [navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.leftContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgeIcon}>🎓</span>
                        <span>Final Year Project</span>
                    </div>
                    <h1 className={styles.headline}>
                        AI Powered <span className={styles.gradientText}>Dermatology</span> Analysis
                    </h1>
                    <p className={styles.description}>
                        Comprehensive healthcare platform combining AI-powered skin analysis with traditional dermatology services. Find doctors, book appointments, chat with specialists, and get instant AI assistance - all in one place.
                    </p>
                    <button className={styles.getStartedButton} onClick={handleGetStarted}>
                        Get Started
                    </button>
                </div>
                <div className={styles.rightContent}>
                    <div className={styles.imageContainer}>
                        <div 
                            ref={carouselRef}
                            className={styles.carouselWrapper}
                            style={{ 
                                transform: `translateX(-${currentImageIndex * 100}%)`
                            }}
                        >
                            {duplicatedImages.map((image, index) => (
                                <img 
                                    key={index}
                                    src={image.src} 
                                    alt={image.alt} 
                                    className={styles.aiAnalysisImage}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Herosection.displayName = 'Herosection';

export default Herosection;
