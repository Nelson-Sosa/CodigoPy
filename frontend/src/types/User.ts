export interface User {
  id: string;
  _id?: string;

  name: string;
  email: string;

  role: "admin" | "vendedor";

  active: boolean;
  lastLogin: string;
}