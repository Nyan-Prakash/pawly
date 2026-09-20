import { useEffect, useRef, useState } from 'react';
import type { NetInfoState } from '@react-native-community/netinfo';

type NetInfoModule = typeof import('@react-native-community/netinfo').default;

// NetInfo throws on import when its native module is missing, which is the
// case in a dev client built before the package was added. This hook is
// mounted in the tab layout, so that must not take the app down: until the
// next native build the device just counts as online.
let NetInfo: NetInfoModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NetInfo = (require('@react-native-community/netinfo') as { default: NetInfoModule }).default;
} catch {
  NetInfo = null;
}

/** A drop has to last this long before the UI reacts, so a blip never flashes. */
const OFFLINE_DEBOUNCE_MS = 1500;

/**
 * `isConnected` and `isInternetReachable` are null while NetInfo is still
 * checking. Unknown counts as online: a false "You're offline" is worse than
 * a late one.
 */
function looksOffline(state: NetInfoState): boolean {
  return state.isConnected === false || state.isInternetReachable === false;
}

/**
 * True once the device has been without a connection for ~1.5 s. Coming back
 * online clears it straight away.
 */
export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!NetInfo) return;

    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!looksOffline(state)) {
        clear();
        setOffline(false);
        return;
      }
      // Already counting down (or already offline): let the first timer run.
      if (timer.current) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        setOffline(true);
      }, OFFLINE_DEBOUNCE_MS);
    });

    return () => {
      clear();
      unsubscribe();
    };
  }, []);

  return offline;
}
