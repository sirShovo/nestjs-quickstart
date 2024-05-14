import { Payload } from '@nestjs/microservices';

import { PayloadDataTransformationPipe } from '../pipes';

export const MappedData = () => Payload(new PayloadDataTransformationPipe());
