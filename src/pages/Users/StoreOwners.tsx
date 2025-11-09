import RecentOrders from "../../components/ecommerce/RecentOrders";

const StoreOwners = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#456FFF" }}>
        Store Owners
      </h1>
      <RecentOrders />
    </div>
  );
};

export default StoreOwners;
