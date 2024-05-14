export class UserUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly profilePictureUrl: Nullable<string>,
    public readonly updatedAt: Date,
  ) {}
}
