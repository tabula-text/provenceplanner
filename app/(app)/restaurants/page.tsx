import { RestaurantsList } from "@/components/RestaurantsList";

export default function RestaurantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🍴 Restaurants</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and save restaurant recommendations
        </p>
      </div>

      <RestaurantsList />
    </div>
  );
}
