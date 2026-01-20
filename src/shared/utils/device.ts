/**
 * Device detection utilities
 */

export function isMobileUA(): boolean {
  if (typeof globalThis === 'undefined' || !('navigator' in globalThis)) {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(ua);
}

export function isIOS(): boolean {
  if (typeof globalThis === 'undefined' || !('navigator' in globalThis)) {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof globalThis === 'undefined' || !('navigator' in globalThis)) {
    return false;
  }

  return /android/i.test(navigator.userAgent);
}
