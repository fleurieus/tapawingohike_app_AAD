import { Int32 } from "react-native/Libraries/Types/CodegenTypes";

export type Routepart = {
    type: string,
    fullscreen: boolean,
    audioUrl: string,
    radius: number,
    endpoint: Endpoint,
    completed: boolean,
}

type Endpoint = {
    latitude: number,
    longitude: number
}