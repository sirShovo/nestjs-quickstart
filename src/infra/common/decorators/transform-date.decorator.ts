import { Transform } from 'class-transformer';
import moment from 'moment';

export const TransformDate = (format: string) =>
  Transform(({ value }) => {
    if (!value) return;
    return moment(value).format(format);
  });
