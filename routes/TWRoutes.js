import RouteParts from './api/RouteParts';

async function fetchRouteParts(userId) {
  try {
    const routeParts = await RouteParts.getRouteParts(userId);
    console.log('Route Parts:', routeParts);
  } catch (error) {
    console.error('Error fetching route parts:', error);
  }
}

fetchRouteParts(1);  // Replace 1 with the actual userId you want to fetch