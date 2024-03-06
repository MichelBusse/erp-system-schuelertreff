import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from 'src/core/decorators/roles.decorator'

import UserRole from 'src/core/enums/UserRole.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!allowedRoles) return true

    const { user } = context.switchToHttp().getRequest()

    return allowedRoles.includes(user.role)
  }
}
