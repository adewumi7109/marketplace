import { useEffect, useState } from "react";
import { getCurrentLocation } from "@/lib/api"; // adjust path

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

export function useCurrentLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
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

          if (res) {
            setUserAddress({
              city: res.city,
              state: res.state,
              country: res.country,
              displayName: res.displayName,
            });
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch address");
        }

        setLoading(false);
      },
      (err) => {
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