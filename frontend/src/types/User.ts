export interface User {
  id: string;
  _id?: string;

  name: string;
  email: string;

  role: "admin" | "supervisor" | "operator";

  active: boolean;
  lastLogin: string;
}