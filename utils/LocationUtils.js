//This class returns the distance between a user's current location and the endpoint in meters.

export default class LocationUtils {
    // Radius of the Earth in kilometers
    static R = 6371;

    static toRad(degree) {
        return degree * (Math.PI / 180);
    }

    static calculateDistance(userLat, userLon, endLat, endLon) {
        const dLat = this.toRad(endLat - userLat);
        const dLon = this.toRad(endLon - userLon);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(userLat)) * Math.cos(this.toRad(endLat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Distance in kilometers
        const distanceInKm = this.R * c;

        // Convert to meters
        return distanceInKm * 1000;
    }
}
