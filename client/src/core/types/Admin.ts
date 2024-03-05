import UserRole from "../enums/UserRole";
import User from "./User";

interface Admin extends User {
  role: UserRole.ADMIN
}

export default Admin;