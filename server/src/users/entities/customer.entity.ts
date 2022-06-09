import { ChildEntity } from 'typeorm'

import { User } from './user.entity'

@ChildEntity()
export abstract class Customer extends User {}
