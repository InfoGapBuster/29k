import Koa from 'koa';
import {isEmpty} from 'ramda';
import * as yup from 'yup';

export class RequestValidationError extends Error {
  constructor(message: string, validationErrors: yup.ValidationError) {
    super(message);
    this.validationError = validationErrors;
  }

  validationError: yup.ValidationError;
}

export class ResponseValidationError extends Error {
  constructor(message: string, validationError: yup.ValidationError) {
    super(message);
    this.validationError = validationError;
  }

  validationError: yup.ValidationError;
}

type DefaultSchema = yup.AnySchema<unknown, unknown, unknown, ''>;
interface ValidatedState<
  TBody extends yup.Schema = DefaultSchema,
  TQuery extends yup.Schema = DefaultSchema,
  TResponse extends yup.Schema = DefaultSchema,
> extends Koa.DefaultState {
  body: yup.Asserts<TBody>;
  query: yup.Asserts<TQuery>;
  response: yup.Asserts<TResponse>;
}

type Validator<
  TBody extends yup.Schema,
  TQuery extends yup.Schema,
  TResponse extends yup.Schema,
> = {
  body: TBody;
  query: TQuery;
  response: TResponse;
};

type ValidatorOptions<
  TBody extends yup.Schema = DefaultSchema,
  TQuery extends yup.Schema = DefaultSchema,
  TResponse extends yup.Schema = DefaultSchema,
> = {
  [k in keyof Partial<
    Validator<TBody, TQuery, TResponse>
  >]: yup.ValidateOptions;
};

const defaultOptions: ValidatorOptions = {
  body: {
    stripUnknown: true,
  },
  query: {
    stripUnknown: true,
  },
  response: {
    stripUnknown: true,
  },
};

const validation =
  <
    TBody extends yup.Schema,
    TQuery extends yup.Schema,
    TResponse extends yup.Schema,
  >(
    validator: Partial<Validator<TBody, TQuery, TResponse>>,
    options: ValidatorOptions = defaultOptions,
  ): Koa.Middleware<ValidatedState<TBody, TQuery, TResponse>> =>
  async (ctx: Koa.Context, next: Koa.Next) => {
    try {
      if (validator.body) {
        ctx.state.body = await validator.body.validate(
          ctx.request.body,
          options.body,
        );
      }

      if (validator.query) {
        ctx.state.query = await validator.query.validate(
          ctx.request.query,
          options.query,
        );
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new RequestValidationError('Request validation failed', error);
      } else {
        throw error;
      }
    }

    await next();

    try {
      if (ctx.status === 200 && !isEmpty(ctx.body) && validator.response) {
        ctx.state.response = await validator.response.validate(
          ctx.body,
          options.response,
        );
        ctx.body = ctx.state.response;
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new ResponseValidationError('Response validation failed', error);
      } else {
        throw error;
      }
    }
  };

export interface ResponseContext extends Koa.Context {
  state: ValidatedState;
}

export const assertValidatedResponse =
  () => async (ctx: ResponseContext, next: Koa.Next) => {
    await next();

    if (ctx.status === 200 && !isEmpty(ctx.body)) {
      if (!ctx.state.response) {
        throw new Error(
          `No schema found for the response to ${ctx.request.method} at ${ctx.request.URL}`,
        );
      }
    }
  };

export default validation;
