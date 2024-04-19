export interface UserSignUp {
  fullname: string;
  username: string;
  password: string;
  gender: "male" | "female" | "";
  confirmPassword: string;
}
