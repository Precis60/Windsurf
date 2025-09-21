import React, { useEffect, useRef, useState } from 'react';

// Simple Google Maps JS API loader
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      resolve(window.google);
      return;
    }

    // If a loader is in progress, reuse it
    if (window.__googleMapsLoadingPromise) {
      window.__googleMapsLoadingPromise.then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en-AU&region=AU`;
    script.async = true;
    script.defer = true;

    window.__googleMapsLoadingPromise = new Promise((res, rej) => {
      script.onload = () => res(window.google);
      script.onerror = () => rej(new Error('Failed to load Google Maps JS API'));
    });

    document.head.appendChild(script);

    window.__googleMapsLoadingPromise.then(resolve).catch(reject);
  });
}

/**
 * AddressAutocomplete
 * - Wraps Google Places Autocomplete, restricted to Australian addresses
 * - Props:
 *   - label?: string
 *   - value: string
 *   - onChange: (value: string, payload?: { placeId?: string, lat?: number, lng?: number, components?: any }) => void
 *   - placeholder?: string
 *   - required?: boolean
 */
export default function AddressAutocomplete({ label = 'Address/Location', value, onChange, placeholder = 'Start typing an address…', required = false, showTip = true }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [ready, setReady] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let isMounted = true;
    if (!apiKey) {
      // No key; leave as plain input
      return () => { isMounted = false; };
    }

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (!isMounted || !inputRef.current) return;
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'au' },
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          const formatted = place.formatted_address || '';
          const lat = place.geometry?.location?.lat?.();
          const lng = place.geometry?.location?.lng?.();
          const payload = {
            placeId: place.place_id,
            lat: typeof lat === 'function' ? lat() : lat,
            lng: typeof lng === 'function' ? lng() : lng,
            components: place.address_components
          };
          onChange(formatted, payload);
        });
        setReady(true);
      })
      .catch((err) => {
        console.error('Google Maps load error:', err);
        setReady(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, onChange]);

  return (
    <div>
      {label && <label style={{ display: 'block', fontWeight: 600, color: '#22314a', margin: '0.25rem 0' }}>{label}</label>}
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="calendar-input"
        required={required}
        aria-invalid={required && !value ? 'true' : 'false'}
      />
      {!apiKey && showTip && (
        <div style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Tip: Add VITE_GOOGLE_MAPS_API_KEY to enable Australian address autocomplete.
        </div>
      )}
    </div>
  );
}
