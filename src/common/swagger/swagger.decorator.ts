import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiAuthRequired = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid or expired token',
    }),
  );

export const ApiAuthOptional = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({
      description:
        'If Authorization header is present but token is invalid or expired, request is rejected',
    }),
  );

export const ApiShortenResponses = () =>
  applyDecorators(
    ApiCreatedResponse({
      description:
        'Short URL created (or returned if a similar one already exists for this user)',
    }),
    ApiBadRequestResponse({ description: 'Invalid URL input' }),
    ApiConflictResponse({
      description: 'Could not generate a unique short code',
    }),
  );

export const ApiListMyUrlsResponses = () =>
  applyDecorators(ApiOkResponse({ description: 'List returned successfully' }));

export const ApiUpdateUrlResponses = () =>
  applyDecorators(
    ApiOkResponse({ description: 'Short URL updated successfully' }),
    ApiBadRequestResponse({ description: 'Invalid URL input' }),
    ApiNotFoundResponse({ description: 'Short URL not found or not owned' }),
  );

export const ApiDeleteUrlResponses = () =>
  applyDecorators(
    ApiNoContentResponse({
      description: 'Short URL soft deleted successfully',
    }),
    ApiNotFoundResponse({ description: 'Short URL not found or not owned' }),
  );
