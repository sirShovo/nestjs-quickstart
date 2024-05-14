import { Query } from '@nestjs/common';

import { PaginationQueryTransformationPipe } from '../pipes';

export const PaginatedQuery = () => Query(new PaginationQueryTransformationPipe());
