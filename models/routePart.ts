interface RoutePart {
  type: 'map' | 'image' | 'audio'; // Type of the route part
  fullscreen: boolean; // Whether the route part should be displayed in fullscreen
  content: string; // URL or identifier for the content associated with the route part
  audioUrl?: string; // Optional: URL of the audio associated with the route part
  radius?: number; // Optional: Radius associated with the route part (if applicable)
  endpoint?: { latitude: number; longitude: number }; // Optional: Endpoint coordinates (if applicable)
  completed: boolean; // Whether the route part has been completed
}