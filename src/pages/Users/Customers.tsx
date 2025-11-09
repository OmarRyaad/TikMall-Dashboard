import RecentOrders from "../../components/ecommerce/RecentOrders";

const Customers = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#456FFF" }}>
        Customers
      </h1>
      <RecentOrders />
    </div>
  );
};

export default Customers;
