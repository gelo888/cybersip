"use client";

import { useCallback, useMemo, useState } from "react";
import { Map, MapControls } from "@/components/ui/map";
import type { Territory } from "@/lib/types";
import { TerritoryGeoJsonLayer } from "./territory-geojson-layer";
import { MapLoadingProgress } from "./map-loading-progress";
import { TerritoryMapLegend } from "./territory-map-legend";

interface TerritoryMapViewProps {
    territories: Territory[];
}

export function TerritoryMapView({ territories }: TerritoryMapViewProps) {
    const [loadedCount, setLoadedCount] = useState(0);

    const sortedTerritories = useMemo(
        () => [...territories].sort((a, b) => a.level - b.level),
        [territories],
    );

    const handleLayerLoaded = useCallback(() => {
        setLoadedCount((prev) => prev + 1);
    }, []);

    return (
        <div className="relative h-[calc(100vh-220px)] min-h-[500px] rounded-lg border overflow-hidden">
            <MapLoadingProgress loaded={loadedCount} total={territories.length} />
            <TerritoryMapLegend territories={territories} />

            <Map
                center={[20, 20]}
                zoom={2}
                className="h-full w-full"
            >
                <MapControls
                    position="bottom-right"
                    showZoom
                    showFullscreen
                />
                {sortedTerritories.map((t) => (
                    <TerritoryGeoJsonLayer
                        key={t.id}
                        territory={t}
                        onLoaded={handleLayerLoaded}
                    />
                ))}
            </Map>
        </div>
    );
}
