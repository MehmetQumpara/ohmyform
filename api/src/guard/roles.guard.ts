import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    let userRoles: string[] = []

    // REST API için
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest()
      userRoles = request.user ? request.user.roles : []
    } 
    // GraphQL için
    else {
      const ctx = GqlExecutionContext.create(context)
      userRoles = ctx.getContext().req.user ? ctx.getContext().req.user.roles : []
    }

    for (const role of roles) {
      if (!userRoles.includes(role)) {
        return false;
      }
    }

    return true;
  }
}
