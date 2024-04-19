export interface User {
  _id: string;
  fullname: string;
  username: string;
  gender: "male" | "female" | "";
  profilePicture: string;
}
