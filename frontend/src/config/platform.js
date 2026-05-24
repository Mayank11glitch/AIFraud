// Platform detection for Capacitor native vs web
// Provides platform-aware utilities for mobile-specific features

import { Capacitor } from '@capacitor/core';

/**
 * Whether the app is running inside a native shell (Android/iOS)
 */
export const isNative = Capacitor.isNativePlatform();

/**
 * Current platform: 'web' | 'android' | 'ios'
 */
export const platform = Capacitor.getPlatform();

/**
 * Whether the app is running on Android
 */
export const isAndroid = platform === 'android';

/**
 * Whether the app is running on iOS
 */
export const isIOS = platform === 'ios';

/**
 * Whether the app is running in a web browser
 */
export const isWeb = platform === 'web';
