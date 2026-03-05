import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet-routing-machine";

interface RouteData {
    totalDistance: number;
    totalTime: number;
}

interface RoutingProps {
    waypoints: L.LatLng[];
    color?: string;
    onRouteFound?: (data: RouteData) => void;
}

export default function RoutingMachine({ waypoints, color = "#3b82f6", onRouteFound }: RoutingProps) {
    const map = useMap();

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        const routingControl = (L as any).Routing.control({
            waypoints,
            lineOptions: {
                styles: [{ color, weight: 4, opacity: 0.7 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            show: false, // Don't show the itinerary
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            showAlternatives: false,
            createMarker: () => null, // We draw our own markers
        }).addTo(map);

        routingControl.on('routesfound', function (e: any) {
            const routes = e.routes;
            const summary = routes[0].summary;
            if (onRouteFound) {
                onRouteFound({
                    totalDistance: summary.totalDistance, // in meters
                    totalTime: summary.totalTime, // in seconds
                });
            }
        });

        // This removes the text/instruction panel that Leaflet Routing Machine creates
        if (routingControl.getContainer()) {
            routingControl.getContainer().style.display = 'none';
        }

        return () => {
            try {
                if (map && routingControl) {
                    map.removeControl(routingControl);
                }
            } catch (e) {
                // ignore Leaflet typical cleanup errors
            }
        };
    }, [map, waypoints, color, onRouteFound]);

    return null;
}
