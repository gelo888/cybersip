import { useQuery } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import type {
    GeoRegion,
    GeoSubRegion,
    GeoCountry,
    CountriesByLevel,
    AdminDivision,
    GeoFeatureCollection,
} from "@/lib/types";

export function useGeoRegions() {
    return useQuery({
        queryKey: ["geo", "regions"],
        queryFn: () => get<GeoRegion[]>("/api/geo/regions"),
        staleTime: Infinity,
    });
}

export function useGeoSubRegions(regionId: string | null) {
    return useQuery({
        queryKey: ["geo", "subregions", regionId],
        queryFn: () => get<GeoSubRegion[]>(`/api/geo/regions/${regionId}/subregions`),
        enabled: !!regionId,
        staleTime: Infinity,
    });
}

export function useGeoCountries(subregionId: string | null) {
    return useQuery({
        queryKey: ["geo", "countries", subregionId],
        queryFn: () =>
            get<GeoCountry[]>(`/api/geo/subregions/${subregionId}/countries`),
        enabled: !!subregionId,
        staleTime: Infinity,
    });
}

export function useCountriesByLevel() {
    return useQuery({
        queryKey: ["geo", "countries-by-level"],
        queryFn: () => get<CountriesByLevel>("/api/geo/countries-by-level"),
        staleTime: Infinity,
    });
}

export function useAdminDivisions(gid0: string | null) {
    return useQuery({
        queryKey: ["geo", "admin-divisions", gid0],
        queryFn: () => get<AdminDivision[]>(`/api/geo/admin-divisions/${gid0}`),
        enabled: !!gid0,
        staleTime: Infinity,
    });
}

export function useAdminDivisions2(gid0: string | null, gid1: string | null) {
    return useQuery({
        queryKey: ["geo", "admin-divisions-2", gid0, gid1],
        queryFn: () =>
            get<AdminDivision[]>(`/api/geo/admin-divisions/${gid0}/${gid1}`),
        enabled: !!gid0 && !!gid1,
        staleTime: Infinity,
    });
}

export function useGeoFeatures(
    gids: string[],
    level: number,
    enabled = true,
) {
    return useQuery({
        queryKey: ["geo", "features", gids, level],
        queryFn: () =>
            post<GeoFeatureCollection>("/api/geo/features", { gids, level }),
        enabled: enabled && gids.length > 0,
        staleTime: 5 * 60 * 1000,
    });
}
