import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Phone,
  Navigation,
  Locate,
  Copy,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

// Add Leaflet type declarations
declare global {
  interface Window {
    L: any; // You can replace 'any' with proper Leaflet types if needed
  }
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  lat: number;
  lng: number;
}

const PharmacyFinder = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null
  );
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);

          if (leafletMapRef.current) {
            leafletMapRef.current.setView([userPos.lat, userPos.lng], 15);

            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
            } else {
              userMarkerRef.current = window.L.circle(
                [userPos.lat, userPos.lng],
                {
                  color: "#4285F4",
                  fillColor: "#4285F4",
                  fillOpacity: 0.7,
                  radius: 10,
                }
              ).addTo(leafletMapRef.current);
            }
          }

          searchNearbyPharmacies(userPos);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location Error",
            description: `Unable to get location: ${error.message}`,
            variant: "destructive",
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle search by address
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Location",
        description: "Please enter a location or use current location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const location = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };

          setUserLocation(location);

          if (leafletMapRef.current) {
            leafletMapRef.current.setView([location.lat, location.lng], 15);

            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([location.lat, location.lng]);
            } else {
              userMarkerRef.current = window.L.circle(
                [location.lat, location.lng],
                {
                  color: "#4285F4",
                  fillColor: "#4285F4",
                  fillOpacity: 0.7,
                  radius: 10,
                }
              ).addTo(leafletMapRef.current);
            }
          }

          searchNearbyPharmacies(location);
        } else {
          toast({
            title: "Location Not Found",
            description:
              "Could not find that location. Please try a different address.",
            variant: "destructive",
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Geocoding error:", error);
        toast({
          title: "Search Error",
          description: "Error finding location. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      });
  };

  // Search for nearby pharmacies
  const searchNearbyPharmacies = (location: { lat: number; lng: number }) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    const radius = 3000; // 3km radius
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="pharmacy"](around:${radius},${location.lat},${location.lng});
        way["amenity"="pharmacy"](around:${radius},${location.lat},${location.lng});
        relation["amenity"="pharmacy"](around:${radius},${location.lat},${location.lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      overpassQuery
    )}`;

    fetch(overpassUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.elements && data.elements.length > 0) {
          const pharmacyNodes = data.elements.filter(
            (element: any) =>
              element.tags && element.tags.amenity === "pharmacy"
          );

          if (pharmacyNodes.length === 0) {
            setPharmacies([]);
            setLoading(false);
            return;
          }

          const processedPharmacies: Pharmacy[] = pharmacyNodes
            .map((node: any, index: number) => {
              const lat = node.lat || (node.center ? node.center.lat : 0);
              const lng = node.lon || (node.center ? node.center.lon : 0);
              const distance = calculateDistance(
                location.lat,
                location.lng,
                lat,
                lng
              );

              return {
                id: `pharmacy-${node.id || index}`,
                name: node.tags.name || "Pharmacy",
                address: node.tags["addr:street"]
                  ? `${node.tags["addr:housenumber"] || ""} ${
                      node.tags["addr:street"]
                    }, ${node.tags["addr:city"] || ""}`
                  : "Address unavailable",
                phone:
                  node.tags.phone ||
                  node.tags["contact:phone"] ||
                  "Phone unavailable",
                distance: `${distance.toFixed(1)} km`,
                lat,
                lng,
              };
            })
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
            .slice(0, 3);

          setPharmacies(processedPharmacies);

          if (leafletMapRef.current) {
            processedPharmacies.forEach((pharmacy, index) => {
              const pharmacyIcon = window.L.divIcon({
                html: `<div style="background-color:#e74c3c;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;">${
                  index + 1
                }</div>`,
                className: "pharmacy-marker",
              });

              const marker = window.L.marker([pharmacy.lat, pharmacy.lng], {
                icon: pharmacyIcon,
              }).addTo(leafletMapRef.current).bindPopup(`
                  <div>
                    <h3 style="font-weight:bold;margin-bottom:5px;">${pharmacy.name}</h3>
                    <p style="margin:0 0 5px;">${pharmacy.address}</p>
                    <p style="margin:0 0 5px;">${pharmacy.phone}</p>
                    <p style="margin:0;">${pharmacy.distance}</p>
                  </div>
                `);

              markersRef.current.push(marker);
            });
          }

          toast({
            title: "Pharmacies Found",
            description: `Found ${processedPharmacies.length} pharmacies near you`,
          });
        } else {
          setPharmacies([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Overpass API error:", error);
        toast({
          title: "Search Error",
          description: "Error finding pharmacies. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      });
  };

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Handle calling pharmacy
  const handleCall = (pharmacy: Pharmacy) => {
    if (!pharmacy.phone || pharmacy.phone === "Phone unavailable") {
      toast({
        title: "Phone Unavailable",
        description: "No phone number available for this pharmacy",
        variant: "destructive",
      });
      return;
    }

    setSelectedPharmacy(pharmacy);
    setIsCallDialogOpen(true);
  };

  // Get directions to pharmacy
  const handleGetDirections = (pharmacy: Pharmacy) => {
    if (!userLocation) return;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pharmacy.lat},${pharmacy.lng}&travelmode=driving`;

    if (
      navigator.platform.indexOf("iPhone") !== -1 ||
      navigator.platform.indexOf("iPad") !== -1 ||
      navigator.platform.indexOf("iPod") !== -1
    ) {
      window.open(
        `maps://maps.apple.com/?daddr=${pharmacy.lat},${pharmacy.lng}&saddr=${userLocation.lat},${userLocation.lng}`
      );
    } else if (/Android/.test(navigator.userAgent)) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pharmacy.lat},${pharmacy.lng}`
      );
    } else {
      window.open(googleMapsUrl);
    }

    toast({
      title: "Opening Maps",
      description: `Getting directions to ${pharmacy.name}`,
    });
  };

  // Initiate phone call
  const initiateCall = () => {
    if (!selectedPharmacy) return;

    const formattedPhone = selectedPharmacy.phone.replace(/[^0-9+]/g, "");
    window.location.href = `tel:${formattedPhone}`;

    toast({
      title: "Calling Pharmacy",
      description: `Calling ${selectedPharmacy.name}`,
    });

    setIsCallDialogOpen(false);
  };

  // Copy phone number to clipboard
  const copyPhoneNumber = () => {
    if (!selectedPharmacy) return;

    const formattedPhone = selectedPharmacy.phone.replace(/[^0-9+]/g, "");
    navigator.clipboard.writeText(formattedPhone);

    toast({
      title: "Number Copied",
      description: "Phone number copied to clipboard",
    });
  };

  // Share pharmacy information
  const sharePharmacy = () => {
    if (!selectedPharmacy) return;

    const shareText = `${selectedPharmacy.name}
Address: ${selectedPharmacy.address}
Phone: ${selectedPharmacy.phone}
Location: https://www.google.com/maps/search/?api=1&query=${selectedPharmacy.lat},${selectedPharmacy.lng}`;

    if (navigator.share) {
      navigator
        .share({
          title: selectedPharmacy.name,
          text: shareText,
        })
        .then(() => {
          toast({
            title: "Information Shared",
            description: "Pharmacy information shared successfully",
          });
        })
        .catch((error) => {
          console.error("Share error:", error);
          navigator.clipboard.writeText(shareText);
          toast({
            title: "Information Copied",
            description: "Pharmacy information copied to clipboard",
          });
        });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Information Copied",
        description: "Pharmacy information copied to clipboard",
      });
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      document.body.appendChild(script);

      const linkTag = document.createElement("link");
      linkTag.rel = "stylesheet";
      linkTag.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(linkTag);

      script.onload = () => {
        if (mapRef.current && !leafletMapRef.current) {
          const map = window.L.map(mapRef.current).setView([51.505, -0.09], 13);

          window.L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }
          ).addTo(map);

          leafletMapRef.current = map;
        }
      };

      return () => {
        document.body.removeChild(script);
        document.head.removeChild(linkTag);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:pl-72 md:pr-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Find Nearby Pharmacies
            </h1>
          </div>

          {/* Search Section */}
          <div className="grid gap-4 md:grid-cols-[1fr,auto]">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Enter your address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="shrink-0"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
            <Button
              onClick={getUserLocation}
              variant="outline"
              disabled={loading}
              className="shrink-0"
            >
              <Locate className="h-4 w-4 mr-2" />
              Use My Location
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map Container */}
            <div className="order-2 lg:order-1 lg:sticky lg:top-6">
              <div
                ref={mapRef}
                className="w-full h-[400px] rounded-lg overflow-hidden border bg-muted"
              />
            </div>

            {/* Pharmacy List */}
            <div className="order-1 lg:order-2">
              <div className="space-y-4">
                {pharmacies.map((pharmacy, index) => (
                  <Card key={pharmacy.id}>
                    <CardHeader className="p-4 bg-muted/50">
                      <CardTitle className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-lg font-semibold truncate">
                            {pharmacy.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {pharmacy.distance} away
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pharmacy.address}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="truncate">{pharmacy.phone}</span>
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleCall(pharmacy)}
                            disabled={pharmacy.phone === "Phone unavailable"}
                            className="h-10"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            onClick={() => handleGetDirections(pharmacy)}
                            className="h-10"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {userLocation && pharmacies.length === 0 && !loading && (
                  <div className="rounded-lg p-8 text-center border bg-background">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      No pharmacies found in this area
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try searching in a different location
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {selectedPharmacy?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-center font-semibold break-words">
                {selectedPharmacy?.phone}
              </p>
              <p className="text-center text-muted-foreground text-sm break-words">
                {selectedPharmacy?.address}
              </p>
            </div>
            <div className="grid gap-3 mt-6">
              <Button
                onClick={initiateCall}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <Button
                onClick={copyPhoneNumber}
                variant="outline"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Number
              </Button>
              <Button
                onClick={sharePharmacy}
                variant="outline"
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Pharmacy
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyFinder;
