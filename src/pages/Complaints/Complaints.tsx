import RecentOrders from "../../components/ecommerce/RecentOrders";

const Complaints: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#456FFF" }}>
        Complaints
      </h1>

      <RecentOrders />
    </div>
  );
};

export default Complaints;
