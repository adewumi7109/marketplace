import { useEffect, useState } from "react";
import { getCurrentLocation, saveDetectedLocation } from "@/lib/api";

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UserAddress {
  city: string;
  state: string;
  country: string;
  displayName: string;
}

const LOCATION_CAPTURE_KEY = "marketplace_location_capture_done";

export function useCurrentLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    if (typeof window !== "undefined" && window.sessionStorage.getItem(LOCATION_CAPTURE_KEY)) {
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ latitude: lat, longitude: lng });

        try {
          const res = await getCurrentLocation(lat, lng);

          if (res?.city && res.state) {
            void saveDetectedLocation({
              city: res.city,
              state: res.state,
              country: res.country || "Nigeria",
              latitude: lat,
              longitude: lng,
            }).catch(() => undefined);

            window.sessionStorage.setItem(LOCATION_CAPTURE_KEY, "1");

            setUserAddress({
              city: res.city,
              state: res.state,
              country: res.country,
              displayName: res.displayName,
            });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch address");
        }

        setLoading(false);
      },
      (err) => {
        window.sessionStorage.setItem(LOCATION_CAPTURE_KEY, "1");
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    userAddress,
    loading,
    error,
    refresh: getLocation,
  };
}
