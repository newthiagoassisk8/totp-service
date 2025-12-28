import { users } from '../schema.js';
import BaseModel from './BaseModel.js';

export default class UserModel extends BaseModel<typeof users> {
    constructor() {
        super(users);
    }
}
