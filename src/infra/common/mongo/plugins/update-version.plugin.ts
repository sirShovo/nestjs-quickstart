import { Query, QueryOptions, Schema } from 'mongoose';

type UpdateType = ReturnType<Query<any, any>['getUpdate']>;

const VERSION_STEP = 1;
const OPERATOR_STRING = '$';

export function updateVersionPlugin(schema: Schema) {
  schema.pre('findOneAndUpdate', updateVersioningMiddleware);
  schema.pre('replaceOne', updateVersioningMiddleware);
  schema.pre('update', updateVersioningMiddleware);
  schema.pre('updateOne', updateVersioningMiddleware);
  schema.pre('updateMany', updateVersioningMiddleware);

  return schema;
}

function updateVersioningMiddleware() {
  const options = Object.assign({}, this.getOptions());
  const update = this.getUpdate();
  applyVersioning({ update: update as NonNullable<UpdateType>, options, schema: this.model.schema });
}

function applyVersioning(params: {
  update: NonNullable<UpdateType> & Record<string, any>;
  options: QueryOptions<any>;
  schema: Schema;
}) {
  const { update, options, schema } = params;
  const versionKey = schema.get('versionKey') as string;
  if (!versionKey) {
    return false;
  }

  if (options !== null && options.version === false) {
    return false;
  }

  if (options.overwrite) {
    update[versionKey] = schema.paths[versionKey].options.default || 0;
    return true;
  }

  for (const key of Object.keys(update)) {
    if (key.startsWith(OPERATOR_STRING)) {
      const op = update[key];
      if (op[versionKey]) {
        delete op[versionKey];
      }
      if (Object.keys(op).length === 0) {
        delete update[key];
      }
    } else {
      if (key === versionKey) {
        delete update[key];
        continue;
      }
    }
  }

  update.$inc ??= {};
  update.$inc[versionKey] = VERSION_STEP;

  return true;
}
