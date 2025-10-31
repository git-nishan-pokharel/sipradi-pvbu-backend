// libs/map/map.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface MapboxResponse {
  type: string;
  query: string[];
  features: Array<{
    id: string;
    type: string;
    place_type: string[];
    relevance: number;
    properties: Record<string, unknown>;
    text: string;
    place_name: string;
    bbox: number[];
    center: number[];
    geometry: {
      type: string;
      coordinates: number[];
    };
    context: Array<{
      id: string;
      text: string;
    }>;
  }>;
  attribution: string;
}

export interface DistanceAndBearingResponse {
  distance: number; // Distance in meters
  duration: number; // Duration in seconds
  bearing: number; // Bearing in degrees
  direction: string; // Compass direction (N, NE, E, SE, S, SW, W, NW)
}

export interface RouteResponse {
  total_distance: number;
  total_duration: number;
  route: number[][];
  legs: {
    distance: number;
    duration: number;
  }[];
  coordinates: number[][];
}

export interface Leg {
  weight_typical: number;
  duration_typical: number;
  weight: number;
  duration: number;
  distance: number;
  summary: string;
}

export interface Waypoint {
  distance: number;
  name: string;
  location: number[];
}

@Injectable()
export class MapService {
  constructor(private readonly configService: ConfigService) {}
  static readonly SOC_FACTOR = 0.91; //MARK: factor to calculate SOC based on distance

  async searchPlaces(searchQuery: string): Promise<MapboxResponse> {
    try {
      const mapboxApiUrl = `${this.configService.get<string>('MAPBOX_API_URL')}/geocoding/v5/mapbox.places/${searchQuery.trim()}.json`;

      const mapboxAccessToken = this.configService.get<string>(
        'MAPBOX_ACCESS_TOKEN',
      );

      const response = await axios.get(mapboxApiUrl, {
        params: {
          country: 'np',
          limit: 12,
          types: 'place,address,region,district,locality,neighborhood,poi',
          language: 'en',
          access_token: mapboxAccessToken,
        },
      });

      return response.data;
    } catch (error) {
      Logger.error(error);
      throw new Error('Could not fetch map data');
    }
  }

  async calculateDistanceDurationAndBearing(
    origin: [number, number], // [longitude, latitude]
    destination: [number, number], // [longitude, latitude]
  ): Promise<DistanceAndBearingResponse> {
    try {
      // Calculate the bearing between origin and destination
      const originBearing = this.getBearing(origin, destination);

      // For now, we will use a mock response for distance and duration
      // In a real application, you would call an API to get this data
      // For example, you could use Mapbox Directions API or OSRM API to get
      // the actual distance and duration between the two points.
      // Here we are just returning a mock response.
      const responseData = {
        distance: 8700, // Distance in meters
        duration: 23 * 60, // Duration in seconds
        bearing: originBearing.bearing,
        direction: originBearing.direction,
      };
      return responseData;
    } catch (error) {
      Logger.error(error);
      throw new Error('Could not calculate distance and duration');
    }
  }

  async getReverseGeocode(
    lng: number,
    lat: number,
  ): Promise<{ placeName: string }> {
    try {
      const mapboxApiUrl = this.configService.get<string>('MAPBOX_API_URL');
      const mapboxReverseGeocodeApiUrl = `${mapboxApiUrl}/search/geocode/v6/reverse`;
      const mapboxAccessToken = this.configService.get<string>(
        'MAPBOX_ACCESS_TOKEN',
      );

      const response = await axios.get(mapboxReverseGeocodeApiUrl, {
        params: {
          types: 'place',
          longitude: lng,
          latitude: lat,
          access_token: mapboxAccessToken,
        },
      });

      if (!response?.data?.features?.length) {
        throw new Error('No place found for the given coordinates');
      }
      const placeName =
        response?.data?.features[0]?.properties?.name_preferred ?? '';

      return { placeName };
    } catch (error) {
      Logger.error(error);
      throw new Error('Could not get route name');
    }
  }

  async calculateRoute(coords: string): Promise<RouteResponse> {
    try {
      const mapboxApiUrl = this.configService.get<string>('MAPBOX_API_URL');
      const mapboxRouteApiUrl = `${mapboxApiUrl}/directions/v5/mapbox/driving-traffic/${coords.toString()}`;
      const mapboxAccessToken = this.configService.get<string>(
        'MAPBOX_ACCESS_TOKEN',
      );

      const response = await axios.get(mapboxRouteApiUrl, {
        params: {
          geometries: 'geojson',
          steps: false,
          access_token: mapboxAccessToken,
        },
      });
      const route = response?.data?.routes?.[0];
      if (!route) throw new Error('No route found');
      const { distance, duration, geometry, legs } = route;
      const legsWithSOC = legs?.map((leg: Leg) => {
        return {
          distance: leg.distance,
          duration: leg.duration,
          soc: (MapService.SOC_FACTOR * leg.distance) / 1000,
        };
      });

      const coordinates = [];
      const pairs = coords.split(';');

      for (const pair of pairs) {
        const [lng, lat] = pair.split(',').map(Number);
        coordinates.push([lng, lat]);
      }

      return {
        total_distance: distance,
        total_duration: duration,
        route: geometry?.coordinates,
        legs: legsWithSOC,
        coordinates: coordinates,
      };
    } catch (error) {
      Logger.error(error);
      throw new Error('Could not calculate route');
    }
  }

  getBearing(
    origin: [number, number],
    destination: [number, number],
  ): { bearing: number; direction: string } {
    const toRadians = (deg: number): number => deg * (Math.PI / 180);
    const toDegrees = (rad: number): number => rad * (180 / Math.PI);

    const [lon1, lat1] = [toRadians(origin[0]), toRadians(origin[1])];
    const [lon2, lat2] = [toRadians(destination[0]), toRadians(destination[1])];

    const dLon = lon2 - lon1;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);
    brng = toDegrees(brng);

    const direction = this.bearingToCompassDirection((brng + 360) % 360);
    return { bearing: (brng + 360) % 360, direction };
  }

  bearingToCompassDirection(bearing: number): string {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
      'N',
    ];
    const index = Math.round(bearing / 22.5);
    return directions[index];
  }
}
