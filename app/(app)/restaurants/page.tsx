import { RestaurantsList } from "@/components/RestaurantsList";

export default function RestaurantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Restaurants</h1>
        <p className="page-subtitle">
          Discover and save restaurant recommendations
        </p>
      </div>

      <RestaurantsList />
    </div>
  );
}
