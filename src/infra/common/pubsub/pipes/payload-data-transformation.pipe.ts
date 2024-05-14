import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Message } from '@softrizon/gcp-pubsub';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PayloadDataTransformationPipe implements PipeTransform {
  transform(value: Message, metadata: ArgumentMetadata) {
    return plainToInstance(metadata.metatype as any, JSON.parse(value.data.toString()), {
      excludeExtraneousValues: true,
    });
  }
}
