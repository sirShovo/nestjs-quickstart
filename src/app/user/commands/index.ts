import { CreateUserCommandHandler } from './create-user.command-handler';
import { DeleteUserCommandHandler } from './delete-user.command-handler';
import { UpdateUserCommandHandler } from './update-user.command-handler';

export * from './create-user.command-handler';
export * from './delete-user.command-handler';
export * from './update-user.command-handler';

export const UserCommandHandlers = [CreateUserCommandHandler, UpdateUserCommandHandler, DeleteUserCommandHandler];
