import { Check, ChildEntity, Column } from 'typeorm'

import { maxTimeRange, User } from './user.entity'

@ChildEntity()
@Check(`"timesAvailable" <@ '${maxTimeRange}'::tstzrange`)
export abstract class Customer extends User {
  @Column({
    type: 'tstzmultirange',
    default: `{${maxTimeRange}}`,
    nullable: false,
  })
  timesAvailable: string
}
