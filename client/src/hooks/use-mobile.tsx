import * as React from "react"
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useNativeMobile() {
  const [isNative, setIsNative] = React.useState(false);
  const [platform, setPlatform] = React.useState<string>('web');

  React.useEffect(() => {
    const checkPlatform = () => {
      const native = Capacitor.isNativePlatform();
      const currentPlatform = Capacitor.getPlatform();
      
      setIsNative(native);
      setPlatform(currentPlatform);

      // Configure status bar for mobile
      if (native) {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#1e90ff' }).catch(() => {});
        
        // Hide splash screen after app loads
        SplashScreen.hide().catch(() => {});
      }
    };

    checkPlatform();
  }, []);

  return {
    isNative,
    platform,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web'
  };
}

export function useMobileOptimized() {
  const { isNative } = useNativeMobile();
  
  React.useEffect(() => {
    if (isNative) {
      // Disable context menu on long press for mobile
      const preventContext = (e: Event) => e.preventDefault();
      document.addEventListener('contextmenu', preventContext);
      
      // Prevent double-tap zoom
      let lastTouchEnd = 0;
      const preventDoubleTouch = (e: TouchEvent) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };
      
      document.addEventListener('touchend', preventDoubleTouch, false);
      
      return () => {
        document.removeEventListener('contextmenu', preventContext);
        document.removeEventListener('touchend', preventDoubleTouch);
      };
    }
  }, [isNative]);

  return { isNative };
}
