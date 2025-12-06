// context/PermissionsContext.tsx
import { createContext, useContext } from "react";

type Permissions = {
  [key: string]: boolean;
};

const PermissionsContext = createContext<Permissions | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // THIS IS THE ONLY LINE THAT MATTERS — READ FROM "permissions" KEY
  const permissionsJson =
    typeof window !== "undefined" ? localStorage.getItem("permissions") : null;

  const permissions: Permissions = permissionsJson
    ? JSON.parse(permissionsJson)
    : {};

  // Optional: Debug once so you KNOW it's working
  // console.log("Permissions loaded →", permissions);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};
