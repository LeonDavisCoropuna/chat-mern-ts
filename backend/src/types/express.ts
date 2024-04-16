import {IUser} from "../models/user.model"
import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
  user?: IUser
}