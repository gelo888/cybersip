"use client";

import { useEffect, useRef } from "react";
import { Popup } from "maplibre-gl";
import { useMap } from "@/components/ui/map";
import { useGeoFeatures } from "@/hooks/use-geo-data";
import type { Territory } from "@/lib/types";

interface TerritoryGeoJsonLayerProps {
    territory: Territory;
    onLoaded?: () => void;
}

const LEVEL_LABELS = ["Country", "State / Province", "County"] as const;

export function TerritoryGeoJsonLayer({
    territory,
    onLoaded,
}: TerritoryGeoJsonLayerProps) {
    const { map, isLoaded } = useMap();
    const addedRef = useRef(false);

    const gids = territory.children.map((c) => c.id);
    const { data: geojson } = useGeoFeatures(gids, territory.level, isLoaded);

    useEffect(() => {
        if (!map || !isLoaded || !geojson || geojson.features.length === 0) return;
        if (addedRef.current) return;

        const sourceId = `territory-${territory.id}`;
        const fillId = `territory-fill-${territory.id}`;

        if (map.getSource(sourceId)) return;

        map.addSource(sourceId, { type: "geojson", data: geojson as GeoJSON.FeatureCollection });

        const baseOpacity = territory.level === 0 ? 0.35 : territory.level === 1 ? 0.5 : 0.65;
        const hoverOpacity = Math.min(baseOpacity + 0.2, 0.9);

        map.addLayer({
            id: fillId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": territory.color,
                "fill-opacity": baseOpacity,
            },
        });

        const popup = new Popup({
            closeButton: false,
            closeOnClick: false,
            className: "territory-tooltip",
            offset: 12,
        });

        const onMouseEnter = () => {
            map.getCanvas().style.cursor = "pointer";
            map.setPaintProperty(fillId, "fill-opacity", hoverOpacity);
        };

        const onMouseMove = (e: maplibregl.MapMouseEvent) => {
            const levelLabel = LEVEL_LABELS[territory.level] ?? `Level ${territory.level}`;
            popup
                .setLngLat(e.lngLat)
                .setHTML(
                    `<strong>${territory.name}</strong><br/><span style="opacity:0.7;font-size:12px">${levelLabel}</span>`,
                )
                .addTo(map);
        };

        const onMouseLeave = () => {
            map.getCanvas().style.cursor = "";
            map.setPaintProperty(fillId, "fill-opacity", baseOpacity);
            popup.remove();
        };

        map.on("mouseenter", fillId, onMouseEnter);
        map.on("mousemove", fillId, onMouseMove);
        map.on("mouseleave", fillId, onMouseLeave);

        addedRef.current = true;
        onLoaded?.();

        const currentMap = map;
        return () => {
            try {
                currentMap.off("mouseenter", fillId, onMouseEnter);
                currentMap.off("mousemove", fillId, onMouseMove);
                currentMap.off("mouseleave", fillId, onMouseLeave);
                popup.remove();
                if (currentMap.getLayer(fillId)) currentMap.removeLayer(fillId);
                if (currentMap.getSource(sourceId)) currentMap.removeSource(sourceId);
            } catch {
                // Map may already be destroyed during unmount
            }
            addedRef.current = false;
        };
    }, [map, isLoaded, geojson, territory.id, territory.color, territory.name, territory.level, onLoaded]);

    return null;
}
