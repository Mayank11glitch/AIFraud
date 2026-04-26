import { useEffect, useRef, useCallback } from 'react';

/**
 * Apple-style scroll reveal hook using Intersection Observer.
 * 
 * Uses a callback ref pattern so it correctly observes elements
 * that mount later (e.g., after data loading / conditional rendering).
 * 
 * Usage:
 *   const ref = useScrollReveal({ threshold: 0.15, delay: 200 });
 *   <div ref={ref} className="reveal fade-up"> ... </div>
 */
export default function useScrollReveal(options = {}) {
    const observerRef = useRef(null);
    const elementRef = useRef(null);

    const {
        threshold = 0.15,
        rootMargin = '0px 0px -60px 0px',
        delay = 0,
        once = true,
    } = options;

    // Cleanup function
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Callback ref — fires whenever the DOM element mounts/unmounts
    const callbackRef = useCallback((node) => {
        // Disconnect previous observer if any
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (!node) {
            elementRef.current = null;
            return;
        }

        elementRef.current = node;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (delay) {
                        setTimeout(() => node.classList.add('revealed'), delay);
                    } else {
                        node.classList.add('revealed');
                    }
                    if (once) observerRef.current?.unobserve(node);
                } else if (!once) {
                    node.classList.remove('revealed');
                }
            },
            { threshold, rootMargin }
        );

        observerRef.current.observe(node);
    }, [threshold, rootMargin, delay, once]);

    return callbackRef;
}

/**
 * Hook to reveal multiple children with staggered delays.
 * Uses callback ref to handle conditionally rendered containers.
 */
export function useStaggerReveal(options = {}) {
    const observerRef = useRef(null);

    const {
        threshold = 0.1,
        rootMargin = '0px 0px -40px 0px',
        staggerMs = 120,
        childSelector = '.reveal',
    } = options;

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const callbackRef = useCallback((container) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (!container) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const children = container.querySelectorAll(childSelector);
                    children.forEach((child, i) => {
                        setTimeout(() => child.classList.add('revealed'), i * staggerMs);
                    });
                    observerRef.current?.unobserve(container);
                }
            },
            { threshold, rootMargin }
        );

        observerRef.current.observe(container);
    }, [threshold, rootMargin, staggerMs, childSelector]);

    return callbackRef;
}
