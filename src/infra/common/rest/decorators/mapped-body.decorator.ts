import { Body } from '@nestjs/common';

import { RequestBodyTransformationPipe } from '../pipes';

export const MappedBody = () => Body(new RequestBodyTransformationPipe());
