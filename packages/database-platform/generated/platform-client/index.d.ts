
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model operators
 * 
 */
export type operators = $Result.DefaultSelection<Prisma.$operatorsPayload>
/**
 * Model tenant_databases
 * 
 */
export type tenant_databases = $Result.DefaultSelection<Prisma.$tenant_databasesPayload>
/**
 * Model operator_domains
 * 
 */
export type operator_domains = $Result.DefaultSelection<Prisma.$operator_domainsPayload>
/**
 * Model operator_settings
 * 
 */
export type operator_settings = $Result.DefaultSelection<Prisma.$operator_settingsPayload>
/**
 * Model platform_users
 * 
 */
export type platform_users = $Result.DefaultSelection<Prisma.$platform_usersPayload>
/**
 * Model platform_audit_logs
 * 
 */
export type platform_audit_logs = $Result.DefaultSelection<Prisma.$platform_audit_logsPayload>
/**
 * Model platform_settings
 * 
 */
export type platform_settings = $Result.DefaultSelection<Prisma.$platform_settingsPayload>
/**
 * Model tenant_daily_rollups
 * 
 */
export type tenant_daily_rollups = $Result.DefaultSelection<Prisma.$tenant_daily_rollupsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const operator_status: {
  onboarding: 'onboarding',
  active: 'active',
  suspended: 'suspended',
  archived: 'archived',
  onboarding_failed: 'onboarding_failed'
};

export type operator_status = (typeof operator_status)[keyof typeof operator_status]


export const domain_type: {
  subdomain: 'subdomain',
  custom: 'custom'
};

export type domain_type = (typeof domain_type)[keyof typeof domain_type]


export const domain_verification_status: {
  pending: 'pending',
  verified: 'verified',
  failed: 'failed'
};

export type domain_verification_status = (typeof domain_verification_status)[keyof typeof domain_verification_status]


export const ssl_status: {
  pending: 'pending',
  active: 'active'
};

export type ssl_status = (typeof ssl_status)[keyof typeof ssl_status]


export const tenant_database_status: {
  provisioning: 'provisioning',
  active: 'active',
  failed: 'failed'
};

export type tenant_database_status = (typeof tenant_database_status)[keyof typeof tenant_database_status]


export const platform_role: {
  platform_admin: 'platform_admin',
  platform_support: 'platform_support'
};

export type platform_role = (typeof platform_role)[keyof typeof platform_role]


export const gra_application_status: {
  not_started: 'not_started',
  submitted: 'submitted',
  pending_review: 'pending_review',
  approved: 'approved',
  rejected: 'rejected'
};

export type gra_application_status = (typeof gra_application_status)[keyof typeof gra_application_status]

}

export type operator_status = $Enums.operator_status

export const operator_status: typeof $Enums.operator_status

export type domain_type = $Enums.domain_type

export const domain_type: typeof $Enums.domain_type

export type domain_verification_status = $Enums.domain_verification_status

export const domain_verification_status: typeof $Enums.domain_verification_status

export type ssl_status = $Enums.ssl_status

export const ssl_status: typeof $Enums.ssl_status

export type tenant_database_status = $Enums.tenant_database_status

export const tenant_database_status: typeof $Enums.tenant_database_status

export type platform_role = $Enums.platform_role

export const platform_role: typeof $Enums.platform_role

export type gra_application_status = $Enums.gra_application_status

export const gra_application_status: typeof $Enums.gra_application_status

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Operators
 * const operators = await prisma.operators.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Operators
   * const operators = await prisma.operators.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.operators`: Exposes CRUD operations for the **operators** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Operators
    * const operators = await prisma.operators.findMany()
    * ```
    */
  get operators(): Prisma.operatorsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenant_databases`: Exposes CRUD operations for the **tenant_databases** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenant_databases
    * const tenant_databases = await prisma.tenant_databases.findMany()
    * ```
    */
  get tenant_databases(): Prisma.tenant_databasesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.operator_domains`: Exposes CRUD operations for the **operator_domains** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Operator_domains
    * const operator_domains = await prisma.operator_domains.findMany()
    * ```
    */
  get operator_domains(): Prisma.operator_domainsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.operator_settings`: Exposes CRUD operations for the **operator_settings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Operator_settings
    * const operator_settings = await prisma.operator_settings.findMany()
    * ```
    */
  get operator_settings(): Prisma.operator_settingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.platform_users`: Exposes CRUD operations for the **platform_users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Platform_users
    * const platform_users = await prisma.platform_users.findMany()
    * ```
    */
  get platform_users(): Prisma.platform_usersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.platform_audit_logs`: Exposes CRUD operations for the **platform_audit_logs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Platform_audit_logs
    * const platform_audit_logs = await prisma.platform_audit_logs.findMany()
    * ```
    */
  get platform_audit_logs(): Prisma.platform_audit_logsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.platform_settings`: Exposes CRUD operations for the **platform_settings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Platform_settings
    * const platform_settings = await prisma.platform_settings.findMany()
    * ```
    */
  get platform_settings(): Prisma.platform_settingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenant_daily_rollups`: Exposes CRUD operations for the **tenant_daily_rollups** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenant_daily_rollups
    * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findMany()
    * ```
    */
  get tenant_daily_rollups(): Prisma.tenant_daily_rollupsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    operators: 'operators',
    tenant_databases: 'tenant_databases',
    operator_domains: 'operator_domains',
    operator_settings: 'operator_settings',
    platform_users: 'platform_users',
    platform_audit_logs: 'platform_audit_logs',
    platform_settings: 'platform_settings',
    tenant_daily_rollups: 'tenant_daily_rollups'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "operators" | "tenant_databases" | "operator_domains" | "operator_settings" | "platform_users" | "platform_audit_logs" | "platform_settings" | "tenant_daily_rollups"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      operators: {
        payload: Prisma.$operatorsPayload<ExtArgs>
        fields: Prisma.operatorsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.operatorsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.operatorsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>
          }
          findFirst: {
            args: Prisma.operatorsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.operatorsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>
          }
          findMany: {
            args: Prisma.operatorsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>[]
          }
          create: {
            args: Prisma.operatorsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>
          }
          createMany: {
            args: Prisma.operatorsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.operatorsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>[]
          }
          delete: {
            args: Prisma.operatorsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>
          }
          update: {
            args: Prisma.operatorsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>
          }
          deleteMany: {
            args: Prisma.operatorsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.operatorsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.operatorsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>[]
          }
          upsert: {
            args: Prisma.operatorsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operatorsPayload>
          }
          aggregate: {
            args: Prisma.OperatorsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperators>
          }
          groupBy: {
            args: Prisma.operatorsGroupByArgs<ExtArgs>
            result: $Utils.Optional<OperatorsGroupByOutputType>[]
          }
          count: {
            args: Prisma.operatorsCountArgs<ExtArgs>
            result: $Utils.Optional<OperatorsCountAggregateOutputType> | number
          }
        }
      }
      tenant_databases: {
        payload: Prisma.$tenant_databasesPayload<ExtArgs>
        fields: Prisma.tenant_databasesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tenant_databasesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tenant_databasesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>
          }
          findFirst: {
            args: Prisma.tenant_databasesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tenant_databasesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>
          }
          findMany: {
            args: Prisma.tenant_databasesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>[]
          }
          create: {
            args: Prisma.tenant_databasesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>
          }
          createMany: {
            args: Prisma.tenant_databasesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.tenant_databasesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>[]
          }
          delete: {
            args: Prisma.tenant_databasesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>
          }
          update: {
            args: Prisma.tenant_databasesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>
          }
          deleteMany: {
            args: Prisma.tenant_databasesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tenant_databasesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.tenant_databasesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>[]
          }
          upsert: {
            args: Prisma.tenant_databasesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_databasesPayload>
          }
          aggregate: {
            args: Prisma.Tenant_databasesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant_databases>
          }
          groupBy: {
            args: Prisma.tenant_databasesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tenant_databasesGroupByOutputType>[]
          }
          count: {
            args: Prisma.tenant_databasesCountArgs<ExtArgs>
            result: $Utils.Optional<Tenant_databasesCountAggregateOutputType> | number
          }
        }
      }
      operator_domains: {
        payload: Prisma.$operator_domainsPayload<ExtArgs>
        fields: Prisma.operator_domainsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.operator_domainsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.operator_domainsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>
          }
          findFirst: {
            args: Prisma.operator_domainsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.operator_domainsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>
          }
          findMany: {
            args: Prisma.operator_domainsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>[]
          }
          create: {
            args: Prisma.operator_domainsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>
          }
          createMany: {
            args: Prisma.operator_domainsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.operator_domainsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>[]
          }
          delete: {
            args: Prisma.operator_domainsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>
          }
          update: {
            args: Prisma.operator_domainsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>
          }
          deleteMany: {
            args: Prisma.operator_domainsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.operator_domainsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.operator_domainsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>[]
          }
          upsert: {
            args: Prisma.operator_domainsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_domainsPayload>
          }
          aggregate: {
            args: Prisma.Operator_domainsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperator_domains>
          }
          groupBy: {
            args: Prisma.operator_domainsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Operator_domainsGroupByOutputType>[]
          }
          count: {
            args: Prisma.operator_domainsCountArgs<ExtArgs>
            result: $Utils.Optional<Operator_domainsCountAggregateOutputType> | number
          }
        }
      }
      operator_settings: {
        payload: Prisma.$operator_settingsPayload<ExtArgs>
        fields: Prisma.operator_settingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.operator_settingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.operator_settingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>
          }
          findFirst: {
            args: Prisma.operator_settingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.operator_settingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>
          }
          findMany: {
            args: Prisma.operator_settingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>[]
          }
          create: {
            args: Prisma.operator_settingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>
          }
          createMany: {
            args: Prisma.operator_settingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.operator_settingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>[]
          }
          delete: {
            args: Prisma.operator_settingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>
          }
          update: {
            args: Prisma.operator_settingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>
          }
          deleteMany: {
            args: Prisma.operator_settingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.operator_settingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.operator_settingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>[]
          }
          upsert: {
            args: Prisma.operator_settingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$operator_settingsPayload>
          }
          aggregate: {
            args: Prisma.Operator_settingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperator_settings>
          }
          groupBy: {
            args: Prisma.operator_settingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Operator_settingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.operator_settingsCountArgs<ExtArgs>
            result: $Utils.Optional<Operator_settingsCountAggregateOutputType> | number
          }
        }
      }
      platform_users: {
        payload: Prisma.$platform_usersPayload<ExtArgs>
        fields: Prisma.platform_usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.platform_usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.platform_usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>
          }
          findFirst: {
            args: Prisma.platform_usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.platform_usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>
          }
          findMany: {
            args: Prisma.platform_usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>[]
          }
          create: {
            args: Prisma.platform_usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>
          }
          createMany: {
            args: Prisma.platform_usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.platform_usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>[]
          }
          delete: {
            args: Prisma.platform_usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>
          }
          update: {
            args: Prisma.platform_usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>
          }
          deleteMany: {
            args: Prisma.platform_usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.platform_usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.platform_usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>[]
          }
          upsert: {
            args: Prisma.platform_usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_usersPayload>
          }
          aggregate: {
            args: Prisma.Platform_usersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlatform_users>
          }
          groupBy: {
            args: Prisma.platform_usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<Platform_usersGroupByOutputType>[]
          }
          count: {
            args: Prisma.platform_usersCountArgs<ExtArgs>
            result: $Utils.Optional<Platform_usersCountAggregateOutputType> | number
          }
        }
      }
      platform_audit_logs: {
        payload: Prisma.$platform_audit_logsPayload<ExtArgs>
        fields: Prisma.platform_audit_logsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.platform_audit_logsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.platform_audit_logsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>
          }
          findFirst: {
            args: Prisma.platform_audit_logsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.platform_audit_logsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>
          }
          findMany: {
            args: Prisma.platform_audit_logsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>[]
          }
          create: {
            args: Prisma.platform_audit_logsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>
          }
          createMany: {
            args: Prisma.platform_audit_logsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.platform_audit_logsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>[]
          }
          delete: {
            args: Prisma.platform_audit_logsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>
          }
          update: {
            args: Prisma.platform_audit_logsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>
          }
          deleteMany: {
            args: Prisma.platform_audit_logsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.platform_audit_logsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.platform_audit_logsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>[]
          }
          upsert: {
            args: Prisma.platform_audit_logsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_audit_logsPayload>
          }
          aggregate: {
            args: Prisma.Platform_audit_logsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlatform_audit_logs>
          }
          groupBy: {
            args: Prisma.platform_audit_logsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Platform_audit_logsGroupByOutputType>[]
          }
          count: {
            args: Prisma.platform_audit_logsCountArgs<ExtArgs>
            result: $Utils.Optional<Platform_audit_logsCountAggregateOutputType> | number
          }
        }
      }
      platform_settings: {
        payload: Prisma.$platform_settingsPayload<ExtArgs>
        fields: Prisma.platform_settingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.platform_settingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.platform_settingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>
          }
          findFirst: {
            args: Prisma.platform_settingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.platform_settingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>
          }
          findMany: {
            args: Prisma.platform_settingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>[]
          }
          create: {
            args: Prisma.platform_settingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>
          }
          createMany: {
            args: Prisma.platform_settingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.platform_settingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>[]
          }
          delete: {
            args: Prisma.platform_settingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>
          }
          update: {
            args: Prisma.platform_settingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>
          }
          deleteMany: {
            args: Prisma.platform_settingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.platform_settingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.platform_settingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>[]
          }
          upsert: {
            args: Prisma.platform_settingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$platform_settingsPayload>
          }
          aggregate: {
            args: Prisma.Platform_settingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlatform_settings>
          }
          groupBy: {
            args: Prisma.platform_settingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Platform_settingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.platform_settingsCountArgs<ExtArgs>
            result: $Utils.Optional<Platform_settingsCountAggregateOutputType> | number
          }
        }
      }
      tenant_daily_rollups: {
        payload: Prisma.$tenant_daily_rollupsPayload<ExtArgs>
        fields: Prisma.tenant_daily_rollupsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tenant_daily_rollupsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tenant_daily_rollupsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>
          }
          findFirst: {
            args: Prisma.tenant_daily_rollupsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tenant_daily_rollupsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>
          }
          findMany: {
            args: Prisma.tenant_daily_rollupsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>[]
          }
          create: {
            args: Prisma.tenant_daily_rollupsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>
          }
          createMany: {
            args: Prisma.tenant_daily_rollupsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.tenant_daily_rollupsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>[]
          }
          delete: {
            args: Prisma.tenant_daily_rollupsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>
          }
          update: {
            args: Prisma.tenant_daily_rollupsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>
          }
          deleteMany: {
            args: Prisma.tenant_daily_rollupsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tenant_daily_rollupsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.tenant_daily_rollupsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>[]
          }
          upsert: {
            args: Prisma.tenant_daily_rollupsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenant_daily_rollupsPayload>
          }
          aggregate: {
            args: Prisma.Tenant_daily_rollupsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant_daily_rollups>
          }
          groupBy: {
            args: Prisma.tenant_daily_rollupsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tenant_daily_rollupsGroupByOutputType>[]
          }
          count: {
            args: Prisma.tenant_daily_rollupsCountArgs<ExtArgs>
            result: $Utils.Optional<Tenant_daily_rollupsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    operators?: operatorsOmit
    tenant_databases?: tenant_databasesOmit
    operator_domains?: operator_domainsOmit
    operator_settings?: operator_settingsOmit
    platform_users?: platform_usersOmit
    platform_audit_logs?: platform_audit_logsOmit
    platform_settings?: platform_settingsOmit
    tenant_daily_rollups?: tenant_daily_rollupsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OperatorsCountOutputType
   */

  export type OperatorsCountOutputType = {
    domains: number
    audit_logs: number
    rollups: number
  }

  export type OperatorsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domains?: boolean | OperatorsCountOutputTypeCountDomainsArgs
    audit_logs?: boolean | OperatorsCountOutputTypeCountAudit_logsArgs
    rollups?: boolean | OperatorsCountOutputTypeCountRollupsArgs
  }

  // Custom InputTypes
  /**
   * OperatorsCountOutputType without action
   */
  export type OperatorsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperatorsCountOutputType
     */
    select?: OperatorsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OperatorsCountOutputType without action
   */
  export type OperatorsCountOutputTypeCountDomainsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: operator_domainsWhereInput
  }

  /**
   * OperatorsCountOutputType without action
   */
  export type OperatorsCountOutputTypeCountAudit_logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: platform_audit_logsWhereInput
  }

  /**
   * OperatorsCountOutputType without action
   */
  export type OperatorsCountOutputTypeCountRollupsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tenant_daily_rollupsWhereInput
  }


  /**
   * Count Type Platform_usersCountOutputType
   */

  export type Platform_usersCountOutputType = {
    audit_logs: number
  }

  export type Platform_usersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    audit_logs?: boolean | Platform_usersCountOutputTypeCountAudit_logsArgs
  }

  // Custom InputTypes
  /**
   * Platform_usersCountOutputType without action
   */
  export type Platform_usersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Platform_usersCountOutputType
     */
    select?: Platform_usersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Platform_usersCountOutputType without action
   */
  export type Platform_usersCountOutputTypeCountAudit_logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: platform_audit_logsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model operators
   */

  export type AggregateOperators = {
    _count: OperatorsCountAggregateOutputType | null
    _avg: OperatorsAvgAggregateOutputType | null
    _sum: OperatorsSumAggregateOutputType | null
    _min: OperatorsMinAggregateOutputType | null
    _max: OperatorsMaxAggregateOutputType | null
  }

  export type OperatorsAvgAggregateOutputType = {
    default_tax_rate: Decimal | null
  }

  export type OperatorsSumAggregateOutputType = {
    default_tax_rate: Decimal | null
  }

  export type OperatorsMinAggregateOutputType = {
    id: string | null
    gra_registry_id: string | null
    name: string | null
    slug: string | null
    status: $Enums.operator_status | null
    licence_number: string | null
    default_tax_rate: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OperatorsMaxAggregateOutputType = {
    id: string | null
    gra_registry_id: string | null
    name: string | null
    slug: string | null
    status: $Enums.operator_status | null
    licence_number: string | null
    default_tax_rate: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OperatorsCountAggregateOutputType = {
    id: number
    gra_registry_id: number
    name: number
    slug: number
    status: number
    licence_number: number
    default_tax_rate: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type OperatorsAvgAggregateInputType = {
    default_tax_rate?: true
  }

  export type OperatorsSumAggregateInputType = {
    default_tax_rate?: true
  }

  export type OperatorsMinAggregateInputType = {
    id?: true
    gra_registry_id?: true
    name?: true
    slug?: true
    status?: true
    licence_number?: true
    default_tax_rate?: true
    created_at?: true
    updated_at?: true
  }

  export type OperatorsMaxAggregateInputType = {
    id?: true
    gra_registry_id?: true
    name?: true
    slug?: true
    status?: true
    licence_number?: true
    default_tax_rate?: true
    created_at?: true
    updated_at?: true
  }

  export type OperatorsCountAggregateInputType = {
    id?: true
    gra_registry_id?: true
    name?: true
    slug?: true
    status?: true
    licence_number?: true
    default_tax_rate?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type OperatorsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which operators to aggregate.
     */
    where?: operatorsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operators to fetch.
     */
    orderBy?: operatorsOrderByWithRelationInput | operatorsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: operatorsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operators from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operators.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned operators
    **/
    _count?: true | OperatorsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OperatorsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OperatorsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OperatorsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OperatorsMaxAggregateInputType
  }

  export type GetOperatorsAggregateType<T extends OperatorsAggregateArgs> = {
        [P in keyof T & keyof AggregateOperators]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperators[P]>
      : GetScalarType<T[P], AggregateOperators[P]>
  }




  export type operatorsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: operatorsWhereInput
    orderBy?: operatorsOrderByWithAggregationInput | operatorsOrderByWithAggregationInput[]
    by: OperatorsScalarFieldEnum[] | OperatorsScalarFieldEnum
    having?: operatorsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OperatorsCountAggregateInputType | true
    _avg?: OperatorsAvgAggregateInputType
    _sum?: OperatorsSumAggregateInputType
    _min?: OperatorsMinAggregateInputType
    _max?: OperatorsMaxAggregateInputType
  }

  export type OperatorsGroupByOutputType = {
    id: string
    gra_registry_id: string
    name: string
    slug: string
    status: $Enums.operator_status
    licence_number: string | null
    default_tax_rate: Decimal
    created_at: Date
    updated_at: Date
    _count: OperatorsCountAggregateOutputType | null
    _avg: OperatorsAvgAggregateOutputType | null
    _sum: OperatorsSumAggregateOutputType | null
    _min: OperatorsMinAggregateOutputType | null
    _max: OperatorsMaxAggregateOutputType | null
  }

  type GetOperatorsGroupByPayload<T extends operatorsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OperatorsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OperatorsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OperatorsGroupByOutputType[P]>
            : GetScalarType<T[P], OperatorsGroupByOutputType[P]>
        }
      >
    >


  export type operatorsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gra_registry_id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    licence_number?: boolean
    default_tax_rate?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant_database?: boolean | operators$tenant_databaseArgs<ExtArgs>
    domains?: boolean | operators$domainsArgs<ExtArgs>
    settings?: boolean | operators$settingsArgs<ExtArgs>
    audit_logs?: boolean | operators$audit_logsArgs<ExtArgs>
    rollups?: boolean | operators$rollupsArgs<ExtArgs>
    _count?: boolean | OperatorsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operators"]>

  export type operatorsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gra_registry_id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    licence_number?: boolean
    default_tax_rate?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["operators"]>

  export type operatorsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gra_registry_id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    licence_number?: boolean
    default_tax_rate?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["operators"]>

  export type operatorsSelectScalar = {
    id?: boolean
    gra_registry_id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    licence_number?: boolean
    default_tax_rate?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type operatorsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "gra_registry_id" | "name" | "slug" | "status" | "licence_number" | "default_tax_rate" | "created_at" | "updated_at", ExtArgs["result"]["operators"]>
  export type operatorsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant_database?: boolean | operators$tenant_databaseArgs<ExtArgs>
    domains?: boolean | operators$domainsArgs<ExtArgs>
    settings?: boolean | operators$settingsArgs<ExtArgs>
    audit_logs?: boolean | operators$audit_logsArgs<ExtArgs>
    rollups?: boolean | operators$rollupsArgs<ExtArgs>
    _count?: boolean | OperatorsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type operatorsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type operatorsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $operatorsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "operators"
    objects: {
      tenant_database: Prisma.$tenant_databasesPayload<ExtArgs> | null
      domains: Prisma.$operator_domainsPayload<ExtArgs>[]
      settings: Prisma.$operator_settingsPayload<ExtArgs> | null
      audit_logs: Prisma.$platform_audit_logsPayload<ExtArgs>[]
      rollups: Prisma.$tenant_daily_rollupsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      gra_registry_id: string
      name: string
      slug: string
      status: $Enums.operator_status
      licence_number: string | null
      default_tax_rate: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["operators"]>
    composites: {}
  }

  type operatorsGetPayload<S extends boolean | null | undefined | operatorsDefaultArgs> = $Result.GetResult<Prisma.$operatorsPayload, S>

  type operatorsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<operatorsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OperatorsCountAggregateInputType | true
    }

  export interface operatorsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['operators'], meta: { name: 'operators' } }
    /**
     * Find zero or one Operators that matches the filter.
     * @param {operatorsFindUniqueArgs} args - Arguments to find a Operators
     * @example
     * // Get one Operators
     * const operators = await prisma.operators.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends operatorsFindUniqueArgs>(args: SelectSubset<T, operatorsFindUniqueArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Operators that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {operatorsFindUniqueOrThrowArgs} args - Arguments to find a Operators
     * @example
     * // Get one Operators
     * const operators = await prisma.operators.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends operatorsFindUniqueOrThrowArgs>(args: SelectSubset<T, operatorsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Operators that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operatorsFindFirstArgs} args - Arguments to find a Operators
     * @example
     * // Get one Operators
     * const operators = await prisma.operators.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends operatorsFindFirstArgs>(args?: SelectSubset<T, operatorsFindFirstArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Operators that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operatorsFindFirstOrThrowArgs} args - Arguments to find a Operators
     * @example
     * // Get one Operators
     * const operators = await prisma.operators.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends operatorsFindFirstOrThrowArgs>(args?: SelectSubset<T, operatorsFindFirstOrThrowArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Operators that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operatorsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Operators
     * const operators = await prisma.operators.findMany()
     * 
     * // Get first 10 Operators
     * const operators = await prisma.operators.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operatorsWithIdOnly = await prisma.operators.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends operatorsFindManyArgs>(args?: SelectSubset<T, operatorsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Operators.
     * @param {operatorsCreateArgs} args - Arguments to create a Operators.
     * @example
     * // Create one Operators
     * const Operators = await prisma.operators.create({
     *   data: {
     *     // ... data to create a Operators
     *   }
     * })
     * 
     */
    create<T extends operatorsCreateArgs>(args: SelectSubset<T, operatorsCreateArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Operators.
     * @param {operatorsCreateManyArgs} args - Arguments to create many Operators.
     * @example
     * // Create many Operators
     * const operators = await prisma.operators.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends operatorsCreateManyArgs>(args?: SelectSubset<T, operatorsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Operators and returns the data saved in the database.
     * @param {operatorsCreateManyAndReturnArgs} args - Arguments to create many Operators.
     * @example
     * // Create many Operators
     * const operators = await prisma.operators.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Operators and only return the `id`
     * const operatorsWithIdOnly = await prisma.operators.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends operatorsCreateManyAndReturnArgs>(args?: SelectSubset<T, operatorsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Operators.
     * @param {operatorsDeleteArgs} args - Arguments to delete one Operators.
     * @example
     * // Delete one Operators
     * const Operators = await prisma.operators.delete({
     *   where: {
     *     // ... filter to delete one Operators
     *   }
     * })
     * 
     */
    delete<T extends operatorsDeleteArgs>(args: SelectSubset<T, operatorsDeleteArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Operators.
     * @param {operatorsUpdateArgs} args - Arguments to update one Operators.
     * @example
     * // Update one Operators
     * const operators = await prisma.operators.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends operatorsUpdateArgs>(args: SelectSubset<T, operatorsUpdateArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Operators.
     * @param {operatorsDeleteManyArgs} args - Arguments to filter Operators to delete.
     * @example
     * // Delete a few Operators
     * const { count } = await prisma.operators.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends operatorsDeleteManyArgs>(args?: SelectSubset<T, operatorsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Operators.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operatorsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Operators
     * const operators = await prisma.operators.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends operatorsUpdateManyArgs>(args: SelectSubset<T, operatorsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Operators and returns the data updated in the database.
     * @param {operatorsUpdateManyAndReturnArgs} args - Arguments to update many Operators.
     * @example
     * // Update many Operators
     * const operators = await prisma.operators.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Operators and only return the `id`
     * const operatorsWithIdOnly = await prisma.operators.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends operatorsUpdateManyAndReturnArgs>(args: SelectSubset<T, operatorsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Operators.
     * @param {operatorsUpsertArgs} args - Arguments to update or create a Operators.
     * @example
     * // Update or create a Operators
     * const operators = await prisma.operators.upsert({
     *   create: {
     *     // ... data to create a Operators
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Operators we want to update
     *   }
     * })
     */
    upsert<T extends operatorsUpsertArgs>(args: SelectSubset<T, operatorsUpsertArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Operators.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operatorsCountArgs} args - Arguments to filter Operators to count.
     * @example
     * // Count the number of Operators
     * const count = await prisma.operators.count({
     *   where: {
     *     // ... the filter for the Operators we want to count
     *   }
     * })
    **/
    count<T extends operatorsCountArgs>(
      args?: Subset<T, operatorsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OperatorsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Operators.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperatorsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OperatorsAggregateArgs>(args: Subset<T, OperatorsAggregateArgs>): Prisma.PrismaPromise<GetOperatorsAggregateType<T>>

    /**
     * Group by Operators.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operatorsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends operatorsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: operatorsGroupByArgs['orderBy'] }
        : { orderBy?: operatorsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, operatorsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperatorsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the operators model
   */
  readonly fields: operatorsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for operators.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__operatorsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant_database<T extends operators$tenant_databaseArgs<ExtArgs> = {}>(args?: Subset<T, operators$tenant_databaseArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    domains<T extends operators$domainsArgs<ExtArgs> = {}>(args?: Subset<T, operators$domainsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    settings<T extends operators$settingsArgs<ExtArgs> = {}>(args?: Subset<T, operators$settingsArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    audit_logs<T extends operators$audit_logsArgs<ExtArgs> = {}>(args?: Subset<T, operators$audit_logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    rollups<T extends operators$rollupsArgs<ExtArgs> = {}>(args?: Subset<T, operators$rollupsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the operators model
   */
  interface operatorsFieldRefs {
    readonly id: FieldRef<"operators", 'String'>
    readonly gra_registry_id: FieldRef<"operators", 'String'>
    readonly name: FieldRef<"operators", 'String'>
    readonly slug: FieldRef<"operators", 'String'>
    readonly status: FieldRef<"operators", 'operator_status'>
    readonly licence_number: FieldRef<"operators", 'String'>
    readonly default_tax_rate: FieldRef<"operators", 'Decimal'>
    readonly created_at: FieldRef<"operators", 'DateTime'>
    readonly updated_at: FieldRef<"operators", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * operators findUnique
   */
  export type operatorsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * Filter, which operators to fetch.
     */
    where: operatorsWhereUniqueInput
  }

  /**
   * operators findUniqueOrThrow
   */
  export type operatorsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * Filter, which operators to fetch.
     */
    where: operatorsWhereUniqueInput
  }

  /**
   * operators findFirst
   */
  export type operatorsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * Filter, which operators to fetch.
     */
    where?: operatorsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operators to fetch.
     */
    orderBy?: operatorsOrderByWithRelationInput | operatorsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for operators.
     */
    cursor?: operatorsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operators from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operators.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of operators.
     */
    distinct?: OperatorsScalarFieldEnum | OperatorsScalarFieldEnum[]
  }

  /**
   * operators findFirstOrThrow
   */
  export type operatorsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * Filter, which operators to fetch.
     */
    where?: operatorsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operators to fetch.
     */
    orderBy?: operatorsOrderByWithRelationInput | operatorsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for operators.
     */
    cursor?: operatorsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operators from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operators.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of operators.
     */
    distinct?: OperatorsScalarFieldEnum | OperatorsScalarFieldEnum[]
  }

  /**
   * operators findMany
   */
  export type operatorsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * Filter, which operators to fetch.
     */
    where?: operatorsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operators to fetch.
     */
    orderBy?: operatorsOrderByWithRelationInput | operatorsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing operators.
     */
    cursor?: operatorsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operators from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operators.
     */
    skip?: number
    distinct?: OperatorsScalarFieldEnum | OperatorsScalarFieldEnum[]
  }

  /**
   * operators create
   */
  export type operatorsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * The data needed to create a operators.
     */
    data: XOR<operatorsCreateInput, operatorsUncheckedCreateInput>
  }

  /**
   * operators createMany
   */
  export type operatorsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many operators.
     */
    data: operatorsCreateManyInput | operatorsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * operators createManyAndReturn
   */
  export type operatorsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * The data used to create many operators.
     */
    data: operatorsCreateManyInput | operatorsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * operators update
   */
  export type operatorsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * The data needed to update a operators.
     */
    data: XOR<operatorsUpdateInput, operatorsUncheckedUpdateInput>
    /**
     * Choose, which operators to update.
     */
    where: operatorsWhereUniqueInput
  }

  /**
   * operators updateMany
   */
  export type operatorsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update operators.
     */
    data: XOR<operatorsUpdateManyMutationInput, operatorsUncheckedUpdateManyInput>
    /**
     * Filter which operators to update
     */
    where?: operatorsWhereInput
    /**
     * Limit how many operators to update.
     */
    limit?: number
  }

  /**
   * operators updateManyAndReturn
   */
  export type operatorsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * The data used to update operators.
     */
    data: XOR<operatorsUpdateManyMutationInput, operatorsUncheckedUpdateManyInput>
    /**
     * Filter which operators to update
     */
    where?: operatorsWhereInput
    /**
     * Limit how many operators to update.
     */
    limit?: number
  }

  /**
   * operators upsert
   */
  export type operatorsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * The filter to search for the operators to update in case it exists.
     */
    where: operatorsWhereUniqueInput
    /**
     * In case the operators found by the `where` argument doesn't exist, create a new operators with this data.
     */
    create: XOR<operatorsCreateInput, operatorsUncheckedCreateInput>
    /**
     * In case the operators was found with the provided `where` argument, update it with this data.
     */
    update: XOR<operatorsUpdateInput, operatorsUncheckedUpdateInput>
  }

  /**
   * operators delete
   */
  export type operatorsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    /**
     * Filter which operators to delete.
     */
    where: operatorsWhereUniqueInput
  }

  /**
   * operators deleteMany
   */
  export type operatorsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which operators to delete
     */
    where?: operatorsWhereInput
    /**
     * Limit how many operators to delete.
     */
    limit?: number
  }

  /**
   * operators.tenant_database
   */
  export type operators$tenant_databaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    where?: tenant_databasesWhereInput
  }

  /**
   * operators.domains
   */
  export type operators$domainsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    where?: operator_domainsWhereInput
    orderBy?: operator_domainsOrderByWithRelationInput | operator_domainsOrderByWithRelationInput[]
    cursor?: operator_domainsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Operator_domainsScalarFieldEnum | Operator_domainsScalarFieldEnum[]
  }

  /**
   * operators.settings
   */
  export type operators$settingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    where?: operator_settingsWhereInput
  }

  /**
   * operators.audit_logs
   */
  export type operators$audit_logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    where?: platform_audit_logsWhereInput
    orderBy?: platform_audit_logsOrderByWithRelationInput | platform_audit_logsOrderByWithRelationInput[]
    cursor?: platform_audit_logsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Platform_audit_logsScalarFieldEnum | Platform_audit_logsScalarFieldEnum[]
  }

  /**
   * operators.rollups
   */
  export type operators$rollupsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    where?: tenant_daily_rollupsWhereInput
    orderBy?: tenant_daily_rollupsOrderByWithRelationInput | tenant_daily_rollupsOrderByWithRelationInput[]
    cursor?: tenant_daily_rollupsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Tenant_daily_rollupsScalarFieldEnum | Tenant_daily_rollupsScalarFieldEnum[]
  }

  /**
   * operators without action
   */
  export type operatorsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
  }


  /**
   * Model tenant_databases
   */

  export type AggregateTenant_databases = {
    _count: Tenant_databasesCountAggregateOutputType | null
    _avg: Tenant_databasesAvgAggregateOutputType | null
    _sum: Tenant_databasesSumAggregateOutputType | null
    _min: Tenant_databasesMinAggregateOutputType | null
    _max: Tenant_databasesMaxAggregateOutputType | null
  }

  export type Tenant_databasesAvgAggregateOutputType = {
    database_port: number | null
  }

  export type Tenant_databasesSumAggregateOutputType = {
    database_port: number | null
  }

  export type Tenant_databasesMinAggregateOutputType = {
    id: string | null
    operator_id: string | null
    database_name: string | null
    database_host: string | null
    database_port: number | null
    database_user: string | null
    database_password_encrypted: string | null
    connection_url_encrypted: string | null
    schema_version: string | null
    provisioned_at: Date | null
    provision_error: string | null
    status: $Enums.tenant_database_status | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Tenant_databasesMaxAggregateOutputType = {
    id: string | null
    operator_id: string | null
    database_name: string | null
    database_host: string | null
    database_port: number | null
    database_user: string | null
    database_password_encrypted: string | null
    connection_url_encrypted: string | null
    schema_version: string | null
    provisioned_at: Date | null
    provision_error: string | null
    status: $Enums.tenant_database_status | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Tenant_databasesCountAggregateOutputType = {
    id: number
    operator_id: number
    database_name: number
    database_host: number
    database_port: number
    database_user: number
    database_password_encrypted: number
    connection_url_encrypted: number
    schema_version: number
    provisioned_at: number
    provision_error: number
    status: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Tenant_databasesAvgAggregateInputType = {
    database_port?: true
  }

  export type Tenant_databasesSumAggregateInputType = {
    database_port?: true
  }

  export type Tenant_databasesMinAggregateInputType = {
    id?: true
    operator_id?: true
    database_name?: true
    database_host?: true
    database_port?: true
    database_user?: true
    database_password_encrypted?: true
    connection_url_encrypted?: true
    schema_version?: true
    provisioned_at?: true
    provision_error?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type Tenant_databasesMaxAggregateInputType = {
    id?: true
    operator_id?: true
    database_name?: true
    database_host?: true
    database_port?: true
    database_user?: true
    database_password_encrypted?: true
    connection_url_encrypted?: true
    schema_version?: true
    provisioned_at?: true
    provision_error?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type Tenant_databasesCountAggregateInputType = {
    id?: true
    operator_id?: true
    database_name?: true
    database_host?: true
    database_port?: true
    database_user?: true
    database_password_encrypted?: true
    connection_url_encrypted?: true
    schema_version?: true
    provisioned_at?: true
    provision_error?: true
    status?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Tenant_databasesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tenant_databases to aggregate.
     */
    where?: tenant_databasesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_databases to fetch.
     */
    orderBy?: tenant_databasesOrderByWithRelationInput | tenant_databasesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tenant_databasesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_databases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_databases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tenant_databases
    **/
    _count?: true | Tenant_databasesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tenant_databasesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tenant_databasesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tenant_databasesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tenant_databasesMaxAggregateInputType
  }

  export type GetTenant_databasesAggregateType<T extends Tenant_databasesAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant_databases]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant_databases[P]>
      : GetScalarType<T[P], AggregateTenant_databases[P]>
  }




  export type tenant_databasesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tenant_databasesWhereInput
    orderBy?: tenant_databasesOrderByWithAggregationInput | tenant_databasesOrderByWithAggregationInput[]
    by: Tenant_databasesScalarFieldEnum[] | Tenant_databasesScalarFieldEnum
    having?: tenant_databasesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tenant_databasesCountAggregateInputType | true
    _avg?: Tenant_databasesAvgAggregateInputType
    _sum?: Tenant_databasesSumAggregateInputType
    _min?: Tenant_databasesMinAggregateInputType
    _max?: Tenant_databasesMaxAggregateInputType
  }

  export type Tenant_databasesGroupByOutputType = {
    id: string
    operator_id: string
    database_name: string
    database_host: string
    database_port: number
    database_user: string
    database_password_encrypted: string
    connection_url_encrypted: string
    schema_version: string
    provisioned_at: Date | null
    provision_error: string | null
    status: $Enums.tenant_database_status
    created_at: Date
    updated_at: Date
    _count: Tenant_databasesCountAggregateOutputType | null
    _avg: Tenant_databasesAvgAggregateOutputType | null
    _sum: Tenant_databasesSumAggregateOutputType | null
    _min: Tenant_databasesMinAggregateOutputType | null
    _max: Tenant_databasesMaxAggregateOutputType | null
  }

  type GetTenant_databasesGroupByPayload<T extends tenant_databasesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tenant_databasesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tenant_databasesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tenant_databasesGroupByOutputType[P]>
            : GetScalarType<T[P], Tenant_databasesGroupByOutputType[P]>
        }
      >
    >


  export type tenant_databasesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    database_name?: boolean
    database_host?: boolean
    database_port?: boolean
    database_user?: boolean
    database_password_encrypted?: boolean
    connection_url_encrypted?: boolean
    schema_version?: boolean
    provisioned_at?: boolean
    provision_error?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant_databases"]>

  export type tenant_databasesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    database_name?: boolean
    database_host?: boolean
    database_port?: boolean
    database_user?: boolean
    database_password_encrypted?: boolean
    connection_url_encrypted?: boolean
    schema_version?: boolean
    provisioned_at?: boolean
    provision_error?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant_databases"]>

  export type tenant_databasesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    database_name?: boolean
    database_host?: boolean
    database_port?: boolean
    database_user?: boolean
    database_password_encrypted?: boolean
    connection_url_encrypted?: boolean
    schema_version?: boolean
    provisioned_at?: boolean
    provision_error?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant_databases"]>

  export type tenant_databasesSelectScalar = {
    id?: boolean
    operator_id?: boolean
    database_name?: boolean
    database_host?: boolean
    database_port?: boolean
    database_user?: boolean
    database_password_encrypted?: boolean
    connection_url_encrypted?: boolean
    schema_version?: boolean
    provisioned_at?: boolean
    provision_error?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type tenant_databasesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "operator_id" | "database_name" | "database_host" | "database_port" | "database_user" | "database_password_encrypted" | "connection_url_encrypted" | "schema_version" | "provisioned_at" | "provision_error" | "status" | "created_at" | "updated_at", ExtArgs["result"]["tenant_databases"]>
  export type tenant_databasesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type tenant_databasesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type tenant_databasesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }

  export type $tenant_databasesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tenant_databases"
    objects: {
      operator: Prisma.$operatorsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      operator_id: string
      database_name: string
      database_host: string
      database_port: number
      database_user: string
      database_password_encrypted: string
      connection_url_encrypted: string
      schema_version: string
      provisioned_at: Date | null
      provision_error: string | null
      status: $Enums.tenant_database_status
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["tenant_databases"]>
    composites: {}
  }

  type tenant_databasesGetPayload<S extends boolean | null | undefined | tenant_databasesDefaultArgs> = $Result.GetResult<Prisma.$tenant_databasesPayload, S>

  type tenant_databasesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tenant_databasesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tenant_databasesCountAggregateInputType | true
    }

  export interface tenant_databasesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tenant_databases'], meta: { name: 'tenant_databases' } }
    /**
     * Find zero or one Tenant_databases that matches the filter.
     * @param {tenant_databasesFindUniqueArgs} args - Arguments to find a Tenant_databases
     * @example
     * // Get one Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tenant_databasesFindUniqueArgs>(args: SelectSubset<T, tenant_databasesFindUniqueArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant_databases that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tenant_databasesFindUniqueOrThrowArgs} args - Arguments to find a Tenant_databases
     * @example
     * // Get one Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tenant_databasesFindUniqueOrThrowArgs>(args: SelectSubset<T, tenant_databasesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant_databases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_databasesFindFirstArgs} args - Arguments to find a Tenant_databases
     * @example
     * // Get one Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tenant_databasesFindFirstArgs>(args?: SelectSubset<T, tenant_databasesFindFirstArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant_databases that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_databasesFindFirstOrThrowArgs} args - Arguments to find a Tenant_databases
     * @example
     * // Get one Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tenant_databasesFindFirstOrThrowArgs>(args?: SelectSubset<T, tenant_databasesFindFirstOrThrowArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenant_databases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_databasesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.findMany()
     * 
     * // Get first 10 Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenant_databasesWithIdOnly = await prisma.tenant_databases.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends tenant_databasesFindManyArgs>(args?: SelectSubset<T, tenant_databasesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant_databases.
     * @param {tenant_databasesCreateArgs} args - Arguments to create a Tenant_databases.
     * @example
     * // Create one Tenant_databases
     * const Tenant_databases = await prisma.tenant_databases.create({
     *   data: {
     *     // ... data to create a Tenant_databases
     *   }
     * })
     * 
     */
    create<T extends tenant_databasesCreateArgs>(args: SelectSubset<T, tenant_databasesCreateArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenant_databases.
     * @param {tenant_databasesCreateManyArgs} args - Arguments to create many Tenant_databases.
     * @example
     * // Create many Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tenant_databasesCreateManyArgs>(args?: SelectSubset<T, tenant_databasesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenant_databases and returns the data saved in the database.
     * @param {tenant_databasesCreateManyAndReturnArgs} args - Arguments to create many Tenant_databases.
     * @example
     * // Create many Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenant_databases and only return the `id`
     * const tenant_databasesWithIdOnly = await prisma.tenant_databases.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends tenant_databasesCreateManyAndReturnArgs>(args?: SelectSubset<T, tenant_databasesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant_databases.
     * @param {tenant_databasesDeleteArgs} args - Arguments to delete one Tenant_databases.
     * @example
     * // Delete one Tenant_databases
     * const Tenant_databases = await prisma.tenant_databases.delete({
     *   where: {
     *     // ... filter to delete one Tenant_databases
     *   }
     * })
     * 
     */
    delete<T extends tenant_databasesDeleteArgs>(args: SelectSubset<T, tenant_databasesDeleteArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant_databases.
     * @param {tenant_databasesUpdateArgs} args - Arguments to update one Tenant_databases.
     * @example
     * // Update one Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tenant_databasesUpdateArgs>(args: SelectSubset<T, tenant_databasesUpdateArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenant_databases.
     * @param {tenant_databasesDeleteManyArgs} args - Arguments to filter Tenant_databases to delete.
     * @example
     * // Delete a few Tenant_databases
     * const { count } = await prisma.tenant_databases.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tenant_databasesDeleteManyArgs>(args?: SelectSubset<T, tenant_databasesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenant_databases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_databasesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tenant_databasesUpdateManyArgs>(args: SelectSubset<T, tenant_databasesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenant_databases and returns the data updated in the database.
     * @param {tenant_databasesUpdateManyAndReturnArgs} args - Arguments to update many Tenant_databases.
     * @example
     * // Update many Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenant_databases and only return the `id`
     * const tenant_databasesWithIdOnly = await prisma.tenant_databases.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends tenant_databasesUpdateManyAndReturnArgs>(args: SelectSubset<T, tenant_databasesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant_databases.
     * @param {tenant_databasesUpsertArgs} args - Arguments to update or create a Tenant_databases.
     * @example
     * // Update or create a Tenant_databases
     * const tenant_databases = await prisma.tenant_databases.upsert({
     *   create: {
     *     // ... data to create a Tenant_databases
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant_databases we want to update
     *   }
     * })
     */
    upsert<T extends tenant_databasesUpsertArgs>(args: SelectSubset<T, tenant_databasesUpsertArgs<ExtArgs>>): Prisma__tenant_databasesClient<$Result.GetResult<Prisma.$tenant_databasesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenant_databases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_databasesCountArgs} args - Arguments to filter Tenant_databases to count.
     * @example
     * // Count the number of Tenant_databases
     * const count = await prisma.tenant_databases.count({
     *   where: {
     *     // ... the filter for the Tenant_databases we want to count
     *   }
     * })
    **/
    count<T extends tenant_databasesCountArgs>(
      args?: Subset<T, tenant_databasesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tenant_databasesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant_databases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tenant_databasesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Tenant_databasesAggregateArgs>(args: Subset<T, Tenant_databasesAggregateArgs>): Prisma.PrismaPromise<GetTenant_databasesAggregateType<T>>

    /**
     * Group by Tenant_databases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_databasesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends tenant_databasesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tenant_databasesGroupByArgs['orderBy'] }
        : { orderBy?: tenant_databasesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, tenant_databasesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenant_databasesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tenant_databases model
   */
  readonly fields: tenant_databasesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tenant_databases.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tenant_databasesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    operator<T extends operatorsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, operatorsDefaultArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the tenant_databases model
   */
  interface tenant_databasesFieldRefs {
    readonly id: FieldRef<"tenant_databases", 'String'>
    readonly operator_id: FieldRef<"tenant_databases", 'String'>
    readonly database_name: FieldRef<"tenant_databases", 'String'>
    readonly database_host: FieldRef<"tenant_databases", 'String'>
    readonly database_port: FieldRef<"tenant_databases", 'Int'>
    readonly database_user: FieldRef<"tenant_databases", 'String'>
    readonly database_password_encrypted: FieldRef<"tenant_databases", 'String'>
    readonly connection_url_encrypted: FieldRef<"tenant_databases", 'String'>
    readonly schema_version: FieldRef<"tenant_databases", 'String'>
    readonly provisioned_at: FieldRef<"tenant_databases", 'DateTime'>
    readonly provision_error: FieldRef<"tenant_databases", 'String'>
    readonly status: FieldRef<"tenant_databases", 'tenant_database_status'>
    readonly created_at: FieldRef<"tenant_databases", 'DateTime'>
    readonly updated_at: FieldRef<"tenant_databases", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tenant_databases findUnique
   */
  export type tenant_databasesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * Filter, which tenant_databases to fetch.
     */
    where: tenant_databasesWhereUniqueInput
  }

  /**
   * tenant_databases findUniqueOrThrow
   */
  export type tenant_databasesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * Filter, which tenant_databases to fetch.
     */
    where: tenant_databasesWhereUniqueInput
  }

  /**
   * tenant_databases findFirst
   */
  export type tenant_databasesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * Filter, which tenant_databases to fetch.
     */
    where?: tenant_databasesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_databases to fetch.
     */
    orderBy?: tenant_databasesOrderByWithRelationInput | tenant_databasesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tenant_databases.
     */
    cursor?: tenant_databasesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_databases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_databases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tenant_databases.
     */
    distinct?: Tenant_databasesScalarFieldEnum | Tenant_databasesScalarFieldEnum[]
  }

  /**
   * tenant_databases findFirstOrThrow
   */
  export type tenant_databasesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * Filter, which tenant_databases to fetch.
     */
    where?: tenant_databasesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_databases to fetch.
     */
    orderBy?: tenant_databasesOrderByWithRelationInput | tenant_databasesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tenant_databases.
     */
    cursor?: tenant_databasesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_databases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_databases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tenant_databases.
     */
    distinct?: Tenant_databasesScalarFieldEnum | Tenant_databasesScalarFieldEnum[]
  }

  /**
   * tenant_databases findMany
   */
  export type tenant_databasesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * Filter, which tenant_databases to fetch.
     */
    where?: tenant_databasesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_databases to fetch.
     */
    orderBy?: tenant_databasesOrderByWithRelationInput | tenant_databasesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tenant_databases.
     */
    cursor?: tenant_databasesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_databases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_databases.
     */
    skip?: number
    distinct?: Tenant_databasesScalarFieldEnum | Tenant_databasesScalarFieldEnum[]
  }

  /**
   * tenant_databases create
   */
  export type tenant_databasesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * The data needed to create a tenant_databases.
     */
    data: XOR<tenant_databasesCreateInput, tenant_databasesUncheckedCreateInput>
  }

  /**
   * tenant_databases createMany
   */
  export type tenant_databasesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tenant_databases.
     */
    data: tenant_databasesCreateManyInput | tenant_databasesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tenant_databases createManyAndReturn
   */
  export type tenant_databasesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * The data used to create many tenant_databases.
     */
    data: tenant_databasesCreateManyInput | tenant_databasesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * tenant_databases update
   */
  export type tenant_databasesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * The data needed to update a tenant_databases.
     */
    data: XOR<tenant_databasesUpdateInput, tenant_databasesUncheckedUpdateInput>
    /**
     * Choose, which tenant_databases to update.
     */
    where: tenant_databasesWhereUniqueInput
  }

  /**
   * tenant_databases updateMany
   */
  export type tenant_databasesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tenant_databases.
     */
    data: XOR<tenant_databasesUpdateManyMutationInput, tenant_databasesUncheckedUpdateManyInput>
    /**
     * Filter which tenant_databases to update
     */
    where?: tenant_databasesWhereInput
    /**
     * Limit how many tenant_databases to update.
     */
    limit?: number
  }

  /**
   * tenant_databases updateManyAndReturn
   */
  export type tenant_databasesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * The data used to update tenant_databases.
     */
    data: XOR<tenant_databasesUpdateManyMutationInput, tenant_databasesUncheckedUpdateManyInput>
    /**
     * Filter which tenant_databases to update
     */
    where?: tenant_databasesWhereInput
    /**
     * Limit how many tenant_databases to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * tenant_databases upsert
   */
  export type tenant_databasesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * The filter to search for the tenant_databases to update in case it exists.
     */
    where: tenant_databasesWhereUniqueInput
    /**
     * In case the tenant_databases found by the `where` argument doesn't exist, create a new tenant_databases with this data.
     */
    create: XOR<tenant_databasesCreateInput, tenant_databasesUncheckedCreateInput>
    /**
     * In case the tenant_databases was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tenant_databasesUpdateInput, tenant_databasesUncheckedUpdateInput>
  }

  /**
   * tenant_databases delete
   */
  export type tenant_databasesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
    /**
     * Filter which tenant_databases to delete.
     */
    where: tenant_databasesWhereUniqueInput
  }

  /**
   * tenant_databases deleteMany
   */
  export type tenant_databasesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tenant_databases to delete
     */
    where?: tenant_databasesWhereInput
    /**
     * Limit how many tenant_databases to delete.
     */
    limit?: number
  }

  /**
   * tenant_databases without action
   */
  export type tenant_databasesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_databases
     */
    select?: tenant_databasesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_databases
     */
    omit?: tenant_databasesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_databasesInclude<ExtArgs> | null
  }


  /**
   * Model operator_domains
   */

  export type AggregateOperator_domains = {
    _count: Operator_domainsCountAggregateOutputType | null
    _min: Operator_domainsMinAggregateOutputType | null
    _max: Operator_domainsMaxAggregateOutputType | null
  }

  export type Operator_domainsMinAggregateOutputType = {
    id: string | null
    operator_id: string | null
    hostname: string | null
    domain_type: $Enums.domain_type | null
    verification_status: $Enums.domain_verification_status | null
    ssl_status: $Enums.ssl_status | null
    is_primary: boolean | null
    created_at: Date | null
  }

  export type Operator_domainsMaxAggregateOutputType = {
    id: string | null
    operator_id: string | null
    hostname: string | null
    domain_type: $Enums.domain_type | null
    verification_status: $Enums.domain_verification_status | null
    ssl_status: $Enums.ssl_status | null
    is_primary: boolean | null
    created_at: Date | null
  }

  export type Operator_domainsCountAggregateOutputType = {
    id: number
    operator_id: number
    hostname: number
    domain_type: number
    verification_status: number
    ssl_status: number
    is_primary: number
    created_at: number
    _all: number
  }


  export type Operator_domainsMinAggregateInputType = {
    id?: true
    operator_id?: true
    hostname?: true
    domain_type?: true
    verification_status?: true
    ssl_status?: true
    is_primary?: true
    created_at?: true
  }

  export type Operator_domainsMaxAggregateInputType = {
    id?: true
    operator_id?: true
    hostname?: true
    domain_type?: true
    verification_status?: true
    ssl_status?: true
    is_primary?: true
    created_at?: true
  }

  export type Operator_domainsCountAggregateInputType = {
    id?: true
    operator_id?: true
    hostname?: true
    domain_type?: true
    verification_status?: true
    ssl_status?: true
    is_primary?: true
    created_at?: true
    _all?: true
  }

  export type Operator_domainsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which operator_domains to aggregate.
     */
    where?: operator_domainsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_domains to fetch.
     */
    orderBy?: operator_domainsOrderByWithRelationInput | operator_domainsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: operator_domainsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_domains.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned operator_domains
    **/
    _count?: true | Operator_domainsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Operator_domainsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Operator_domainsMaxAggregateInputType
  }

  export type GetOperator_domainsAggregateType<T extends Operator_domainsAggregateArgs> = {
        [P in keyof T & keyof AggregateOperator_domains]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperator_domains[P]>
      : GetScalarType<T[P], AggregateOperator_domains[P]>
  }




  export type operator_domainsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: operator_domainsWhereInput
    orderBy?: operator_domainsOrderByWithAggregationInput | operator_domainsOrderByWithAggregationInput[]
    by: Operator_domainsScalarFieldEnum[] | Operator_domainsScalarFieldEnum
    having?: operator_domainsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Operator_domainsCountAggregateInputType | true
    _min?: Operator_domainsMinAggregateInputType
    _max?: Operator_domainsMaxAggregateInputType
  }

  export type Operator_domainsGroupByOutputType = {
    id: string
    operator_id: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status: $Enums.domain_verification_status
    ssl_status: $Enums.ssl_status
    is_primary: boolean
    created_at: Date
    _count: Operator_domainsCountAggregateOutputType | null
    _min: Operator_domainsMinAggregateOutputType | null
    _max: Operator_domainsMaxAggregateOutputType | null
  }

  type GetOperator_domainsGroupByPayload<T extends operator_domainsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Operator_domainsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Operator_domainsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Operator_domainsGroupByOutputType[P]>
            : GetScalarType<T[P], Operator_domainsGroupByOutputType[P]>
        }
      >
    >


  export type operator_domainsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    hostname?: boolean
    domain_type?: boolean
    verification_status?: boolean
    ssl_status?: boolean
    is_primary?: boolean
    created_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operator_domains"]>

  export type operator_domainsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    hostname?: boolean
    domain_type?: boolean
    verification_status?: boolean
    ssl_status?: boolean
    is_primary?: boolean
    created_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operator_domains"]>

  export type operator_domainsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    hostname?: boolean
    domain_type?: boolean
    verification_status?: boolean
    ssl_status?: boolean
    is_primary?: boolean
    created_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operator_domains"]>

  export type operator_domainsSelectScalar = {
    id?: boolean
    operator_id?: boolean
    hostname?: boolean
    domain_type?: boolean
    verification_status?: boolean
    ssl_status?: boolean
    is_primary?: boolean
    created_at?: boolean
  }

  export type operator_domainsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "operator_id" | "hostname" | "domain_type" | "verification_status" | "ssl_status" | "is_primary" | "created_at", ExtArgs["result"]["operator_domains"]>
  export type operator_domainsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type operator_domainsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type operator_domainsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }

  export type $operator_domainsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "operator_domains"
    objects: {
      operator: Prisma.$operatorsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      operator_id: string
      hostname: string
      domain_type: $Enums.domain_type
      verification_status: $Enums.domain_verification_status
      ssl_status: $Enums.ssl_status
      is_primary: boolean
      created_at: Date
    }, ExtArgs["result"]["operator_domains"]>
    composites: {}
  }

  type operator_domainsGetPayload<S extends boolean | null | undefined | operator_domainsDefaultArgs> = $Result.GetResult<Prisma.$operator_domainsPayload, S>

  type operator_domainsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<operator_domainsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Operator_domainsCountAggregateInputType | true
    }

  export interface operator_domainsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['operator_domains'], meta: { name: 'operator_domains' } }
    /**
     * Find zero or one Operator_domains that matches the filter.
     * @param {operator_domainsFindUniqueArgs} args - Arguments to find a Operator_domains
     * @example
     * // Get one Operator_domains
     * const operator_domains = await prisma.operator_domains.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends operator_domainsFindUniqueArgs>(args: SelectSubset<T, operator_domainsFindUniqueArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Operator_domains that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {operator_domainsFindUniqueOrThrowArgs} args - Arguments to find a Operator_domains
     * @example
     * // Get one Operator_domains
     * const operator_domains = await prisma.operator_domains.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends operator_domainsFindUniqueOrThrowArgs>(args: SelectSubset<T, operator_domainsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Operator_domains that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_domainsFindFirstArgs} args - Arguments to find a Operator_domains
     * @example
     * // Get one Operator_domains
     * const operator_domains = await prisma.operator_domains.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends operator_domainsFindFirstArgs>(args?: SelectSubset<T, operator_domainsFindFirstArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Operator_domains that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_domainsFindFirstOrThrowArgs} args - Arguments to find a Operator_domains
     * @example
     * // Get one Operator_domains
     * const operator_domains = await prisma.operator_domains.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends operator_domainsFindFirstOrThrowArgs>(args?: SelectSubset<T, operator_domainsFindFirstOrThrowArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Operator_domains that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_domainsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Operator_domains
     * const operator_domains = await prisma.operator_domains.findMany()
     * 
     * // Get first 10 Operator_domains
     * const operator_domains = await prisma.operator_domains.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operator_domainsWithIdOnly = await prisma.operator_domains.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends operator_domainsFindManyArgs>(args?: SelectSubset<T, operator_domainsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Operator_domains.
     * @param {operator_domainsCreateArgs} args - Arguments to create a Operator_domains.
     * @example
     * // Create one Operator_domains
     * const Operator_domains = await prisma.operator_domains.create({
     *   data: {
     *     // ... data to create a Operator_domains
     *   }
     * })
     * 
     */
    create<T extends operator_domainsCreateArgs>(args: SelectSubset<T, operator_domainsCreateArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Operator_domains.
     * @param {operator_domainsCreateManyArgs} args - Arguments to create many Operator_domains.
     * @example
     * // Create many Operator_domains
     * const operator_domains = await prisma.operator_domains.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends operator_domainsCreateManyArgs>(args?: SelectSubset<T, operator_domainsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Operator_domains and returns the data saved in the database.
     * @param {operator_domainsCreateManyAndReturnArgs} args - Arguments to create many Operator_domains.
     * @example
     * // Create many Operator_domains
     * const operator_domains = await prisma.operator_domains.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Operator_domains and only return the `id`
     * const operator_domainsWithIdOnly = await prisma.operator_domains.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends operator_domainsCreateManyAndReturnArgs>(args?: SelectSubset<T, operator_domainsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Operator_domains.
     * @param {operator_domainsDeleteArgs} args - Arguments to delete one Operator_domains.
     * @example
     * // Delete one Operator_domains
     * const Operator_domains = await prisma.operator_domains.delete({
     *   where: {
     *     // ... filter to delete one Operator_domains
     *   }
     * })
     * 
     */
    delete<T extends operator_domainsDeleteArgs>(args: SelectSubset<T, operator_domainsDeleteArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Operator_domains.
     * @param {operator_domainsUpdateArgs} args - Arguments to update one Operator_domains.
     * @example
     * // Update one Operator_domains
     * const operator_domains = await prisma.operator_domains.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends operator_domainsUpdateArgs>(args: SelectSubset<T, operator_domainsUpdateArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Operator_domains.
     * @param {operator_domainsDeleteManyArgs} args - Arguments to filter Operator_domains to delete.
     * @example
     * // Delete a few Operator_domains
     * const { count } = await prisma.operator_domains.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends operator_domainsDeleteManyArgs>(args?: SelectSubset<T, operator_domainsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Operator_domains.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_domainsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Operator_domains
     * const operator_domains = await prisma.operator_domains.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends operator_domainsUpdateManyArgs>(args: SelectSubset<T, operator_domainsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Operator_domains and returns the data updated in the database.
     * @param {operator_domainsUpdateManyAndReturnArgs} args - Arguments to update many Operator_domains.
     * @example
     * // Update many Operator_domains
     * const operator_domains = await prisma.operator_domains.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Operator_domains and only return the `id`
     * const operator_domainsWithIdOnly = await prisma.operator_domains.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends operator_domainsUpdateManyAndReturnArgs>(args: SelectSubset<T, operator_domainsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Operator_domains.
     * @param {operator_domainsUpsertArgs} args - Arguments to update or create a Operator_domains.
     * @example
     * // Update or create a Operator_domains
     * const operator_domains = await prisma.operator_domains.upsert({
     *   create: {
     *     // ... data to create a Operator_domains
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Operator_domains we want to update
     *   }
     * })
     */
    upsert<T extends operator_domainsUpsertArgs>(args: SelectSubset<T, operator_domainsUpsertArgs<ExtArgs>>): Prisma__operator_domainsClient<$Result.GetResult<Prisma.$operator_domainsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Operator_domains.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_domainsCountArgs} args - Arguments to filter Operator_domains to count.
     * @example
     * // Count the number of Operator_domains
     * const count = await prisma.operator_domains.count({
     *   where: {
     *     // ... the filter for the Operator_domains we want to count
     *   }
     * })
    **/
    count<T extends operator_domainsCountArgs>(
      args?: Subset<T, operator_domainsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Operator_domainsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Operator_domains.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Operator_domainsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Operator_domainsAggregateArgs>(args: Subset<T, Operator_domainsAggregateArgs>): Prisma.PrismaPromise<GetOperator_domainsAggregateType<T>>

    /**
     * Group by Operator_domains.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_domainsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends operator_domainsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: operator_domainsGroupByArgs['orderBy'] }
        : { orderBy?: operator_domainsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, operator_domainsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperator_domainsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the operator_domains model
   */
  readonly fields: operator_domainsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for operator_domains.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__operator_domainsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    operator<T extends operatorsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, operatorsDefaultArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the operator_domains model
   */
  interface operator_domainsFieldRefs {
    readonly id: FieldRef<"operator_domains", 'String'>
    readonly operator_id: FieldRef<"operator_domains", 'String'>
    readonly hostname: FieldRef<"operator_domains", 'String'>
    readonly domain_type: FieldRef<"operator_domains", 'domain_type'>
    readonly verification_status: FieldRef<"operator_domains", 'domain_verification_status'>
    readonly ssl_status: FieldRef<"operator_domains", 'ssl_status'>
    readonly is_primary: FieldRef<"operator_domains", 'Boolean'>
    readonly created_at: FieldRef<"operator_domains", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * operator_domains findUnique
   */
  export type operator_domainsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * Filter, which operator_domains to fetch.
     */
    where: operator_domainsWhereUniqueInput
  }

  /**
   * operator_domains findUniqueOrThrow
   */
  export type operator_domainsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * Filter, which operator_domains to fetch.
     */
    where: operator_domainsWhereUniqueInput
  }

  /**
   * operator_domains findFirst
   */
  export type operator_domainsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * Filter, which operator_domains to fetch.
     */
    where?: operator_domainsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_domains to fetch.
     */
    orderBy?: operator_domainsOrderByWithRelationInput | operator_domainsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for operator_domains.
     */
    cursor?: operator_domainsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_domains.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of operator_domains.
     */
    distinct?: Operator_domainsScalarFieldEnum | Operator_domainsScalarFieldEnum[]
  }

  /**
   * operator_domains findFirstOrThrow
   */
  export type operator_domainsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * Filter, which operator_domains to fetch.
     */
    where?: operator_domainsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_domains to fetch.
     */
    orderBy?: operator_domainsOrderByWithRelationInput | operator_domainsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for operator_domains.
     */
    cursor?: operator_domainsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_domains.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of operator_domains.
     */
    distinct?: Operator_domainsScalarFieldEnum | Operator_domainsScalarFieldEnum[]
  }

  /**
   * operator_domains findMany
   */
  export type operator_domainsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * Filter, which operator_domains to fetch.
     */
    where?: operator_domainsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_domains to fetch.
     */
    orderBy?: operator_domainsOrderByWithRelationInput | operator_domainsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing operator_domains.
     */
    cursor?: operator_domainsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_domains.
     */
    skip?: number
    distinct?: Operator_domainsScalarFieldEnum | Operator_domainsScalarFieldEnum[]
  }

  /**
   * operator_domains create
   */
  export type operator_domainsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * The data needed to create a operator_domains.
     */
    data: XOR<operator_domainsCreateInput, operator_domainsUncheckedCreateInput>
  }

  /**
   * operator_domains createMany
   */
  export type operator_domainsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many operator_domains.
     */
    data: operator_domainsCreateManyInput | operator_domainsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * operator_domains createManyAndReturn
   */
  export type operator_domainsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * The data used to create many operator_domains.
     */
    data: operator_domainsCreateManyInput | operator_domainsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * operator_domains update
   */
  export type operator_domainsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * The data needed to update a operator_domains.
     */
    data: XOR<operator_domainsUpdateInput, operator_domainsUncheckedUpdateInput>
    /**
     * Choose, which operator_domains to update.
     */
    where: operator_domainsWhereUniqueInput
  }

  /**
   * operator_domains updateMany
   */
  export type operator_domainsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update operator_domains.
     */
    data: XOR<operator_domainsUpdateManyMutationInput, operator_domainsUncheckedUpdateManyInput>
    /**
     * Filter which operator_domains to update
     */
    where?: operator_domainsWhereInput
    /**
     * Limit how many operator_domains to update.
     */
    limit?: number
  }

  /**
   * operator_domains updateManyAndReturn
   */
  export type operator_domainsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * The data used to update operator_domains.
     */
    data: XOR<operator_domainsUpdateManyMutationInput, operator_domainsUncheckedUpdateManyInput>
    /**
     * Filter which operator_domains to update
     */
    where?: operator_domainsWhereInput
    /**
     * Limit how many operator_domains to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * operator_domains upsert
   */
  export type operator_domainsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * The filter to search for the operator_domains to update in case it exists.
     */
    where: operator_domainsWhereUniqueInput
    /**
     * In case the operator_domains found by the `where` argument doesn't exist, create a new operator_domains with this data.
     */
    create: XOR<operator_domainsCreateInput, operator_domainsUncheckedCreateInput>
    /**
     * In case the operator_domains was found with the provided `where` argument, update it with this data.
     */
    update: XOR<operator_domainsUpdateInput, operator_domainsUncheckedUpdateInput>
  }

  /**
   * operator_domains delete
   */
  export type operator_domainsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
    /**
     * Filter which operator_domains to delete.
     */
    where: operator_domainsWhereUniqueInput
  }

  /**
   * operator_domains deleteMany
   */
  export type operator_domainsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which operator_domains to delete
     */
    where?: operator_domainsWhereInput
    /**
     * Limit how many operator_domains to delete.
     */
    limit?: number
  }

  /**
   * operator_domains without action
   */
  export type operator_domainsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_domains
     */
    select?: operator_domainsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_domains
     */
    omit?: operator_domainsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_domainsInclude<ExtArgs> | null
  }


  /**
   * Model operator_settings
   */

  export type AggregateOperator_settings = {
    _count: Operator_settingsCountAggregateOutputType | null
    _min: Operator_settingsMinAggregateOutputType | null
    _max: Operator_settingsMaxAggregateOutputType | null
  }

  export type Operator_settingsMinAggregateOutputType = {
    id: string | null
    operator_id: string | null
    logo_url: string | null
    primary_color: string | null
    support_email: string | null
    footer_licence_text: string | null
    gra_api_key_encrypted: string | null
    gra_hmac_secret_encrypted: string | null
    gra_last_heartbeat_at: Date | null
    gra_last_heartbeat_status: string | null
    gra_last_heartbeat_error: string | null
    payment_merchant_ref_encrypted: string | null
    ga4_measurement_id: string | null
    facebook_pixel_id: string | null
    analytics_enabled: boolean | null
    faq_text: string | null
    terms_text: string | null
    privacy_text: string | null
    legal_name: string | null
    trading_name: string | null
    registration_number: string | null
    kra_pin: string | null
    beneficial_owner: string | null
    business_email: string | null
    business_phone: string | null
    county: string | null
    region: string | null
    website: string | null
    legal_profile_locked_at: Date | null
    gra_application_status: $Enums.gra_application_status | null
    gra_application_id: string | null
    gra_application_submitted_at: Date | null
    gra_approved_at: Date | null
    gra_rejection_reason: string | null
    provision_owner_email: string | null
    provision_owner_password_encrypted: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Operator_settingsMaxAggregateOutputType = {
    id: string | null
    operator_id: string | null
    logo_url: string | null
    primary_color: string | null
    support_email: string | null
    footer_licence_text: string | null
    gra_api_key_encrypted: string | null
    gra_hmac_secret_encrypted: string | null
    gra_last_heartbeat_at: Date | null
    gra_last_heartbeat_status: string | null
    gra_last_heartbeat_error: string | null
    payment_merchant_ref_encrypted: string | null
    ga4_measurement_id: string | null
    facebook_pixel_id: string | null
    analytics_enabled: boolean | null
    faq_text: string | null
    terms_text: string | null
    privacy_text: string | null
    legal_name: string | null
    trading_name: string | null
    registration_number: string | null
    kra_pin: string | null
    beneficial_owner: string | null
    business_email: string | null
    business_phone: string | null
    county: string | null
    region: string | null
    website: string | null
    legal_profile_locked_at: Date | null
    gra_application_status: $Enums.gra_application_status | null
    gra_application_id: string | null
    gra_application_submitted_at: Date | null
    gra_approved_at: Date | null
    gra_rejection_reason: string | null
    provision_owner_email: string | null
    provision_owner_password_encrypted: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Operator_settingsCountAggregateOutputType = {
    id: number
    operator_id: number
    logo_url: number
    primary_color: number
    support_email: number
    footer_licence_text: number
    social_links: number
    gra_api_key_encrypted: number
    gra_hmac_secret_encrypted: number
    gra_last_heartbeat_at: number
    gra_last_heartbeat_status: number
    gra_last_heartbeat_error: number
    payment_merchant_ref_encrypted: number
    feature_flags: number
    ga4_measurement_id: number
    facebook_pixel_id: number
    analytics_enabled: number
    faq_text: number
    terms_text: number
    privacy_text: number
    legal_name: number
    trading_name: number
    registration_number: number
    kra_pin: number
    beneficial_owner: number
    business_email: number
    business_phone: number
    county: number
    region: number
    website: number
    legal_profile_locked_at: number
    gra_application_status: number
    gra_application_id: number
    gra_application_submitted_at: number
    gra_approved_at: number
    gra_rejection_reason: number
    provision_owner_email: number
    provision_owner_password_encrypted: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Operator_settingsMinAggregateInputType = {
    id?: true
    operator_id?: true
    logo_url?: true
    primary_color?: true
    support_email?: true
    footer_licence_text?: true
    gra_api_key_encrypted?: true
    gra_hmac_secret_encrypted?: true
    gra_last_heartbeat_at?: true
    gra_last_heartbeat_status?: true
    gra_last_heartbeat_error?: true
    payment_merchant_ref_encrypted?: true
    ga4_measurement_id?: true
    facebook_pixel_id?: true
    analytics_enabled?: true
    faq_text?: true
    terms_text?: true
    privacy_text?: true
    legal_name?: true
    trading_name?: true
    registration_number?: true
    kra_pin?: true
    beneficial_owner?: true
    business_email?: true
    business_phone?: true
    county?: true
    region?: true
    website?: true
    legal_profile_locked_at?: true
    gra_application_status?: true
    gra_application_id?: true
    gra_application_submitted_at?: true
    gra_approved_at?: true
    gra_rejection_reason?: true
    provision_owner_email?: true
    provision_owner_password_encrypted?: true
    created_at?: true
    updated_at?: true
  }

  export type Operator_settingsMaxAggregateInputType = {
    id?: true
    operator_id?: true
    logo_url?: true
    primary_color?: true
    support_email?: true
    footer_licence_text?: true
    gra_api_key_encrypted?: true
    gra_hmac_secret_encrypted?: true
    gra_last_heartbeat_at?: true
    gra_last_heartbeat_status?: true
    gra_last_heartbeat_error?: true
    payment_merchant_ref_encrypted?: true
    ga4_measurement_id?: true
    facebook_pixel_id?: true
    analytics_enabled?: true
    faq_text?: true
    terms_text?: true
    privacy_text?: true
    legal_name?: true
    trading_name?: true
    registration_number?: true
    kra_pin?: true
    beneficial_owner?: true
    business_email?: true
    business_phone?: true
    county?: true
    region?: true
    website?: true
    legal_profile_locked_at?: true
    gra_application_status?: true
    gra_application_id?: true
    gra_application_submitted_at?: true
    gra_approved_at?: true
    gra_rejection_reason?: true
    provision_owner_email?: true
    provision_owner_password_encrypted?: true
    created_at?: true
    updated_at?: true
  }

  export type Operator_settingsCountAggregateInputType = {
    id?: true
    operator_id?: true
    logo_url?: true
    primary_color?: true
    support_email?: true
    footer_licence_text?: true
    social_links?: true
    gra_api_key_encrypted?: true
    gra_hmac_secret_encrypted?: true
    gra_last_heartbeat_at?: true
    gra_last_heartbeat_status?: true
    gra_last_heartbeat_error?: true
    payment_merchant_ref_encrypted?: true
    feature_flags?: true
    ga4_measurement_id?: true
    facebook_pixel_id?: true
    analytics_enabled?: true
    faq_text?: true
    terms_text?: true
    privacy_text?: true
    legal_name?: true
    trading_name?: true
    registration_number?: true
    kra_pin?: true
    beneficial_owner?: true
    business_email?: true
    business_phone?: true
    county?: true
    region?: true
    website?: true
    legal_profile_locked_at?: true
    gra_application_status?: true
    gra_application_id?: true
    gra_application_submitted_at?: true
    gra_approved_at?: true
    gra_rejection_reason?: true
    provision_owner_email?: true
    provision_owner_password_encrypted?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Operator_settingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which operator_settings to aggregate.
     */
    where?: operator_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_settings to fetch.
     */
    orderBy?: operator_settingsOrderByWithRelationInput | operator_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: operator_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned operator_settings
    **/
    _count?: true | Operator_settingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Operator_settingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Operator_settingsMaxAggregateInputType
  }

  export type GetOperator_settingsAggregateType<T extends Operator_settingsAggregateArgs> = {
        [P in keyof T & keyof AggregateOperator_settings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperator_settings[P]>
      : GetScalarType<T[P], AggregateOperator_settings[P]>
  }




  export type operator_settingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: operator_settingsWhereInput
    orderBy?: operator_settingsOrderByWithAggregationInput | operator_settingsOrderByWithAggregationInput[]
    by: Operator_settingsScalarFieldEnum[] | Operator_settingsScalarFieldEnum
    having?: operator_settingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Operator_settingsCountAggregateInputType | true
    _min?: Operator_settingsMinAggregateInputType
    _max?: Operator_settingsMaxAggregateInputType
  }

  export type Operator_settingsGroupByOutputType = {
    id: string
    operator_id: string
    logo_url: string | null
    primary_color: string | null
    support_email: string | null
    footer_licence_text: string | null
    social_links: JsonValue | null
    gra_api_key_encrypted: string | null
    gra_hmac_secret_encrypted: string | null
    gra_last_heartbeat_at: Date | null
    gra_last_heartbeat_status: string | null
    gra_last_heartbeat_error: string | null
    payment_merchant_ref_encrypted: string | null
    feature_flags: JsonValue
    ga4_measurement_id: string | null
    facebook_pixel_id: string | null
    analytics_enabled: boolean
    faq_text: string | null
    terms_text: string | null
    privacy_text: string | null
    legal_name: string | null
    trading_name: string | null
    registration_number: string | null
    kra_pin: string | null
    beneficial_owner: string | null
    business_email: string | null
    business_phone: string | null
    county: string | null
    region: string | null
    website: string | null
    legal_profile_locked_at: Date | null
    gra_application_status: $Enums.gra_application_status
    gra_application_id: string | null
    gra_application_submitted_at: Date | null
    gra_approved_at: Date | null
    gra_rejection_reason: string | null
    provision_owner_email: string | null
    provision_owner_password_encrypted: string | null
    created_at: Date
    updated_at: Date
    _count: Operator_settingsCountAggregateOutputType | null
    _min: Operator_settingsMinAggregateOutputType | null
    _max: Operator_settingsMaxAggregateOutputType | null
  }

  type GetOperator_settingsGroupByPayload<T extends operator_settingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Operator_settingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Operator_settingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Operator_settingsGroupByOutputType[P]>
            : GetScalarType<T[P], Operator_settingsGroupByOutputType[P]>
        }
      >
    >


  export type operator_settingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    logo_url?: boolean
    primary_color?: boolean
    support_email?: boolean
    footer_licence_text?: boolean
    social_links?: boolean
    gra_api_key_encrypted?: boolean
    gra_hmac_secret_encrypted?: boolean
    gra_last_heartbeat_at?: boolean
    gra_last_heartbeat_status?: boolean
    gra_last_heartbeat_error?: boolean
    payment_merchant_ref_encrypted?: boolean
    feature_flags?: boolean
    ga4_measurement_id?: boolean
    facebook_pixel_id?: boolean
    analytics_enabled?: boolean
    faq_text?: boolean
    terms_text?: boolean
    privacy_text?: boolean
    legal_name?: boolean
    trading_name?: boolean
    registration_number?: boolean
    kra_pin?: boolean
    beneficial_owner?: boolean
    business_email?: boolean
    business_phone?: boolean
    county?: boolean
    region?: boolean
    website?: boolean
    legal_profile_locked_at?: boolean
    gra_application_status?: boolean
    gra_application_id?: boolean
    gra_application_submitted_at?: boolean
    gra_approved_at?: boolean
    gra_rejection_reason?: boolean
    provision_owner_email?: boolean
    provision_owner_password_encrypted?: boolean
    created_at?: boolean
    updated_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operator_settings"]>

  export type operator_settingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    logo_url?: boolean
    primary_color?: boolean
    support_email?: boolean
    footer_licence_text?: boolean
    social_links?: boolean
    gra_api_key_encrypted?: boolean
    gra_hmac_secret_encrypted?: boolean
    gra_last_heartbeat_at?: boolean
    gra_last_heartbeat_status?: boolean
    gra_last_heartbeat_error?: boolean
    payment_merchant_ref_encrypted?: boolean
    feature_flags?: boolean
    ga4_measurement_id?: boolean
    facebook_pixel_id?: boolean
    analytics_enabled?: boolean
    faq_text?: boolean
    terms_text?: boolean
    privacy_text?: boolean
    legal_name?: boolean
    trading_name?: boolean
    registration_number?: boolean
    kra_pin?: boolean
    beneficial_owner?: boolean
    business_email?: boolean
    business_phone?: boolean
    county?: boolean
    region?: boolean
    website?: boolean
    legal_profile_locked_at?: boolean
    gra_application_status?: boolean
    gra_application_id?: boolean
    gra_application_submitted_at?: boolean
    gra_approved_at?: boolean
    gra_rejection_reason?: boolean
    provision_owner_email?: boolean
    provision_owner_password_encrypted?: boolean
    created_at?: boolean
    updated_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operator_settings"]>

  export type operator_settingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    logo_url?: boolean
    primary_color?: boolean
    support_email?: boolean
    footer_licence_text?: boolean
    social_links?: boolean
    gra_api_key_encrypted?: boolean
    gra_hmac_secret_encrypted?: boolean
    gra_last_heartbeat_at?: boolean
    gra_last_heartbeat_status?: boolean
    gra_last_heartbeat_error?: boolean
    payment_merchant_ref_encrypted?: boolean
    feature_flags?: boolean
    ga4_measurement_id?: boolean
    facebook_pixel_id?: boolean
    analytics_enabled?: boolean
    faq_text?: boolean
    terms_text?: boolean
    privacy_text?: boolean
    legal_name?: boolean
    trading_name?: boolean
    registration_number?: boolean
    kra_pin?: boolean
    beneficial_owner?: boolean
    business_email?: boolean
    business_phone?: boolean
    county?: boolean
    region?: boolean
    website?: boolean
    legal_profile_locked_at?: boolean
    gra_application_status?: boolean
    gra_application_id?: boolean
    gra_application_submitted_at?: boolean
    gra_approved_at?: boolean
    gra_rejection_reason?: boolean
    provision_owner_email?: boolean
    provision_owner_password_encrypted?: boolean
    created_at?: boolean
    updated_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operator_settings"]>

  export type operator_settingsSelectScalar = {
    id?: boolean
    operator_id?: boolean
    logo_url?: boolean
    primary_color?: boolean
    support_email?: boolean
    footer_licence_text?: boolean
    social_links?: boolean
    gra_api_key_encrypted?: boolean
    gra_hmac_secret_encrypted?: boolean
    gra_last_heartbeat_at?: boolean
    gra_last_heartbeat_status?: boolean
    gra_last_heartbeat_error?: boolean
    payment_merchant_ref_encrypted?: boolean
    feature_flags?: boolean
    ga4_measurement_id?: boolean
    facebook_pixel_id?: boolean
    analytics_enabled?: boolean
    faq_text?: boolean
    terms_text?: boolean
    privacy_text?: boolean
    legal_name?: boolean
    trading_name?: boolean
    registration_number?: boolean
    kra_pin?: boolean
    beneficial_owner?: boolean
    business_email?: boolean
    business_phone?: boolean
    county?: boolean
    region?: boolean
    website?: boolean
    legal_profile_locked_at?: boolean
    gra_application_status?: boolean
    gra_application_id?: boolean
    gra_application_submitted_at?: boolean
    gra_approved_at?: boolean
    gra_rejection_reason?: boolean
    provision_owner_email?: boolean
    provision_owner_password_encrypted?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type operator_settingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "operator_id" | "logo_url" | "primary_color" | "support_email" | "footer_licence_text" | "social_links" | "gra_api_key_encrypted" | "gra_hmac_secret_encrypted" | "gra_last_heartbeat_at" | "gra_last_heartbeat_status" | "gra_last_heartbeat_error" | "payment_merchant_ref_encrypted" | "feature_flags" | "ga4_measurement_id" | "facebook_pixel_id" | "analytics_enabled" | "faq_text" | "terms_text" | "privacy_text" | "legal_name" | "trading_name" | "registration_number" | "kra_pin" | "beneficial_owner" | "business_email" | "business_phone" | "county" | "region" | "website" | "legal_profile_locked_at" | "gra_application_status" | "gra_application_id" | "gra_application_submitted_at" | "gra_approved_at" | "gra_rejection_reason" | "provision_owner_email" | "provision_owner_password_encrypted" | "created_at" | "updated_at", ExtArgs["result"]["operator_settings"]>
  export type operator_settingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type operator_settingsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type operator_settingsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }

  export type $operator_settingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "operator_settings"
    objects: {
      operator: Prisma.$operatorsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      operator_id: string
      logo_url: string | null
      primary_color: string | null
      support_email: string | null
      footer_licence_text: string | null
      social_links: Prisma.JsonValue | null
      gra_api_key_encrypted: string | null
      gra_hmac_secret_encrypted: string | null
      gra_last_heartbeat_at: Date | null
      gra_last_heartbeat_status: string | null
      gra_last_heartbeat_error: string | null
      payment_merchant_ref_encrypted: string | null
      feature_flags: Prisma.JsonValue
      ga4_measurement_id: string | null
      facebook_pixel_id: string | null
      analytics_enabled: boolean
      faq_text: string | null
      terms_text: string | null
      privacy_text: string | null
      legal_name: string | null
      trading_name: string | null
      registration_number: string | null
      kra_pin: string | null
      beneficial_owner: string | null
      business_email: string | null
      business_phone: string | null
      county: string | null
      region: string | null
      website: string | null
      legal_profile_locked_at: Date | null
      gra_application_status: $Enums.gra_application_status
      gra_application_id: string | null
      gra_application_submitted_at: Date | null
      gra_approved_at: Date | null
      gra_rejection_reason: string | null
      provision_owner_email: string | null
      provision_owner_password_encrypted: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["operator_settings"]>
    composites: {}
  }

  type operator_settingsGetPayload<S extends boolean | null | undefined | operator_settingsDefaultArgs> = $Result.GetResult<Prisma.$operator_settingsPayload, S>

  type operator_settingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<operator_settingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Operator_settingsCountAggregateInputType | true
    }

  export interface operator_settingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['operator_settings'], meta: { name: 'operator_settings' } }
    /**
     * Find zero or one Operator_settings that matches the filter.
     * @param {operator_settingsFindUniqueArgs} args - Arguments to find a Operator_settings
     * @example
     * // Get one Operator_settings
     * const operator_settings = await prisma.operator_settings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends operator_settingsFindUniqueArgs>(args: SelectSubset<T, operator_settingsFindUniqueArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Operator_settings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {operator_settingsFindUniqueOrThrowArgs} args - Arguments to find a Operator_settings
     * @example
     * // Get one Operator_settings
     * const operator_settings = await prisma.operator_settings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends operator_settingsFindUniqueOrThrowArgs>(args: SelectSubset<T, operator_settingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Operator_settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_settingsFindFirstArgs} args - Arguments to find a Operator_settings
     * @example
     * // Get one Operator_settings
     * const operator_settings = await prisma.operator_settings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends operator_settingsFindFirstArgs>(args?: SelectSubset<T, operator_settingsFindFirstArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Operator_settings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_settingsFindFirstOrThrowArgs} args - Arguments to find a Operator_settings
     * @example
     * // Get one Operator_settings
     * const operator_settings = await prisma.operator_settings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends operator_settingsFindFirstOrThrowArgs>(args?: SelectSubset<T, operator_settingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Operator_settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_settingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Operator_settings
     * const operator_settings = await prisma.operator_settings.findMany()
     * 
     * // Get first 10 Operator_settings
     * const operator_settings = await prisma.operator_settings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operator_settingsWithIdOnly = await prisma.operator_settings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends operator_settingsFindManyArgs>(args?: SelectSubset<T, operator_settingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Operator_settings.
     * @param {operator_settingsCreateArgs} args - Arguments to create a Operator_settings.
     * @example
     * // Create one Operator_settings
     * const Operator_settings = await prisma.operator_settings.create({
     *   data: {
     *     // ... data to create a Operator_settings
     *   }
     * })
     * 
     */
    create<T extends operator_settingsCreateArgs>(args: SelectSubset<T, operator_settingsCreateArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Operator_settings.
     * @param {operator_settingsCreateManyArgs} args - Arguments to create many Operator_settings.
     * @example
     * // Create many Operator_settings
     * const operator_settings = await prisma.operator_settings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends operator_settingsCreateManyArgs>(args?: SelectSubset<T, operator_settingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Operator_settings and returns the data saved in the database.
     * @param {operator_settingsCreateManyAndReturnArgs} args - Arguments to create many Operator_settings.
     * @example
     * // Create many Operator_settings
     * const operator_settings = await prisma.operator_settings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Operator_settings and only return the `id`
     * const operator_settingsWithIdOnly = await prisma.operator_settings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends operator_settingsCreateManyAndReturnArgs>(args?: SelectSubset<T, operator_settingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Operator_settings.
     * @param {operator_settingsDeleteArgs} args - Arguments to delete one Operator_settings.
     * @example
     * // Delete one Operator_settings
     * const Operator_settings = await prisma.operator_settings.delete({
     *   where: {
     *     // ... filter to delete one Operator_settings
     *   }
     * })
     * 
     */
    delete<T extends operator_settingsDeleteArgs>(args: SelectSubset<T, operator_settingsDeleteArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Operator_settings.
     * @param {operator_settingsUpdateArgs} args - Arguments to update one Operator_settings.
     * @example
     * // Update one Operator_settings
     * const operator_settings = await prisma.operator_settings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends operator_settingsUpdateArgs>(args: SelectSubset<T, operator_settingsUpdateArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Operator_settings.
     * @param {operator_settingsDeleteManyArgs} args - Arguments to filter Operator_settings to delete.
     * @example
     * // Delete a few Operator_settings
     * const { count } = await prisma.operator_settings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends operator_settingsDeleteManyArgs>(args?: SelectSubset<T, operator_settingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Operator_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_settingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Operator_settings
     * const operator_settings = await prisma.operator_settings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends operator_settingsUpdateManyArgs>(args: SelectSubset<T, operator_settingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Operator_settings and returns the data updated in the database.
     * @param {operator_settingsUpdateManyAndReturnArgs} args - Arguments to update many Operator_settings.
     * @example
     * // Update many Operator_settings
     * const operator_settings = await prisma.operator_settings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Operator_settings and only return the `id`
     * const operator_settingsWithIdOnly = await prisma.operator_settings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends operator_settingsUpdateManyAndReturnArgs>(args: SelectSubset<T, operator_settingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Operator_settings.
     * @param {operator_settingsUpsertArgs} args - Arguments to update or create a Operator_settings.
     * @example
     * // Update or create a Operator_settings
     * const operator_settings = await prisma.operator_settings.upsert({
     *   create: {
     *     // ... data to create a Operator_settings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Operator_settings we want to update
     *   }
     * })
     */
    upsert<T extends operator_settingsUpsertArgs>(args: SelectSubset<T, operator_settingsUpsertArgs<ExtArgs>>): Prisma__operator_settingsClient<$Result.GetResult<Prisma.$operator_settingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Operator_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_settingsCountArgs} args - Arguments to filter Operator_settings to count.
     * @example
     * // Count the number of Operator_settings
     * const count = await prisma.operator_settings.count({
     *   where: {
     *     // ... the filter for the Operator_settings we want to count
     *   }
     * })
    **/
    count<T extends operator_settingsCountArgs>(
      args?: Subset<T, operator_settingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Operator_settingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Operator_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Operator_settingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Operator_settingsAggregateArgs>(args: Subset<T, Operator_settingsAggregateArgs>): Prisma.PrismaPromise<GetOperator_settingsAggregateType<T>>

    /**
     * Group by Operator_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {operator_settingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends operator_settingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: operator_settingsGroupByArgs['orderBy'] }
        : { orderBy?: operator_settingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, operator_settingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperator_settingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the operator_settings model
   */
  readonly fields: operator_settingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for operator_settings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__operator_settingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    operator<T extends operatorsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, operatorsDefaultArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the operator_settings model
   */
  interface operator_settingsFieldRefs {
    readonly id: FieldRef<"operator_settings", 'String'>
    readonly operator_id: FieldRef<"operator_settings", 'String'>
    readonly logo_url: FieldRef<"operator_settings", 'String'>
    readonly primary_color: FieldRef<"operator_settings", 'String'>
    readonly support_email: FieldRef<"operator_settings", 'String'>
    readonly footer_licence_text: FieldRef<"operator_settings", 'String'>
    readonly social_links: FieldRef<"operator_settings", 'Json'>
    readonly gra_api_key_encrypted: FieldRef<"operator_settings", 'String'>
    readonly gra_hmac_secret_encrypted: FieldRef<"operator_settings", 'String'>
    readonly gra_last_heartbeat_at: FieldRef<"operator_settings", 'DateTime'>
    readonly gra_last_heartbeat_status: FieldRef<"operator_settings", 'String'>
    readonly gra_last_heartbeat_error: FieldRef<"operator_settings", 'String'>
    readonly payment_merchant_ref_encrypted: FieldRef<"operator_settings", 'String'>
    readonly feature_flags: FieldRef<"operator_settings", 'Json'>
    readonly ga4_measurement_id: FieldRef<"operator_settings", 'String'>
    readonly facebook_pixel_id: FieldRef<"operator_settings", 'String'>
    readonly analytics_enabled: FieldRef<"operator_settings", 'Boolean'>
    readonly faq_text: FieldRef<"operator_settings", 'String'>
    readonly terms_text: FieldRef<"operator_settings", 'String'>
    readonly privacy_text: FieldRef<"operator_settings", 'String'>
    readonly legal_name: FieldRef<"operator_settings", 'String'>
    readonly trading_name: FieldRef<"operator_settings", 'String'>
    readonly registration_number: FieldRef<"operator_settings", 'String'>
    readonly kra_pin: FieldRef<"operator_settings", 'String'>
    readonly beneficial_owner: FieldRef<"operator_settings", 'String'>
    readonly business_email: FieldRef<"operator_settings", 'String'>
    readonly business_phone: FieldRef<"operator_settings", 'String'>
    readonly county: FieldRef<"operator_settings", 'String'>
    readonly region: FieldRef<"operator_settings", 'String'>
    readonly website: FieldRef<"operator_settings", 'String'>
    readonly legal_profile_locked_at: FieldRef<"operator_settings", 'DateTime'>
    readonly gra_application_status: FieldRef<"operator_settings", 'gra_application_status'>
    readonly gra_application_id: FieldRef<"operator_settings", 'String'>
    readonly gra_application_submitted_at: FieldRef<"operator_settings", 'DateTime'>
    readonly gra_approved_at: FieldRef<"operator_settings", 'DateTime'>
    readonly gra_rejection_reason: FieldRef<"operator_settings", 'String'>
    readonly provision_owner_email: FieldRef<"operator_settings", 'String'>
    readonly provision_owner_password_encrypted: FieldRef<"operator_settings", 'String'>
    readonly created_at: FieldRef<"operator_settings", 'DateTime'>
    readonly updated_at: FieldRef<"operator_settings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * operator_settings findUnique
   */
  export type operator_settingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * Filter, which operator_settings to fetch.
     */
    where: operator_settingsWhereUniqueInput
  }

  /**
   * operator_settings findUniqueOrThrow
   */
  export type operator_settingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * Filter, which operator_settings to fetch.
     */
    where: operator_settingsWhereUniqueInput
  }

  /**
   * operator_settings findFirst
   */
  export type operator_settingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * Filter, which operator_settings to fetch.
     */
    where?: operator_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_settings to fetch.
     */
    orderBy?: operator_settingsOrderByWithRelationInput | operator_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for operator_settings.
     */
    cursor?: operator_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of operator_settings.
     */
    distinct?: Operator_settingsScalarFieldEnum | Operator_settingsScalarFieldEnum[]
  }

  /**
   * operator_settings findFirstOrThrow
   */
  export type operator_settingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * Filter, which operator_settings to fetch.
     */
    where?: operator_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_settings to fetch.
     */
    orderBy?: operator_settingsOrderByWithRelationInput | operator_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for operator_settings.
     */
    cursor?: operator_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of operator_settings.
     */
    distinct?: Operator_settingsScalarFieldEnum | Operator_settingsScalarFieldEnum[]
  }

  /**
   * operator_settings findMany
   */
  export type operator_settingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * Filter, which operator_settings to fetch.
     */
    where?: operator_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of operator_settings to fetch.
     */
    orderBy?: operator_settingsOrderByWithRelationInput | operator_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing operator_settings.
     */
    cursor?: operator_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` operator_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` operator_settings.
     */
    skip?: number
    distinct?: Operator_settingsScalarFieldEnum | Operator_settingsScalarFieldEnum[]
  }

  /**
   * operator_settings create
   */
  export type operator_settingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * The data needed to create a operator_settings.
     */
    data: XOR<operator_settingsCreateInput, operator_settingsUncheckedCreateInput>
  }

  /**
   * operator_settings createMany
   */
  export type operator_settingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many operator_settings.
     */
    data: operator_settingsCreateManyInput | operator_settingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * operator_settings createManyAndReturn
   */
  export type operator_settingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * The data used to create many operator_settings.
     */
    data: operator_settingsCreateManyInput | operator_settingsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * operator_settings update
   */
  export type operator_settingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * The data needed to update a operator_settings.
     */
    data: XOR<operator_settingsUpdateInput, operator_settingsUncheckedUpdateInput>
    /**
     * Choose, which operator_settings to update.
     */
    where: operator_settingsWhereUniqueInput
  }

  /**
   * operator_settings updateMany
   */
  export type operator_settingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update operator_settings.
     */
    data: XOR<operator_settingsUpdateManyMutationInput, operator_settingsUncheckedUpdateManyInput>
    /**
     * Filter which operator_settings to update
     */
    where?: operator_settingsWhereInput
    /**
     * Limit how many operator_settings to update.
     */
    limit?: number
  }

  /**
   * operator_settings updateManyAndReturn
   */
  export type operator_settingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * The data used to update operator_settings.
     */
    data: XOR<operator_settingsUpdateManyMutationInput, operator_settingsUncheckedUpdateManyInput>
    /**
     * Filter which operator_settings to update
     */
    where?: operator_settingsWhereInput
    /**
     * Limit how many operator_settings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * operator_settings upsert
   */
  export type operator_settingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * The filter to search for the operator_settings to update in case it exists.
     */
    where: operator_settingsWhereUniqueInput
    /**
     * In case the operator_settings found by the `where` argument doesn't exist, create a new operator_settings with this data.
     */
    create: XOR<operator_settingsCreateInput, operator_settingsUncheckedCreateInput>
    /**
     * In case the operator_settings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<operator_settingsUpdateInput, operator_settingsUncheckedUpdateInput>
  }

  /**
   * operator_settings delete
   */
  export type operator_settingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
    /**
     * Filter which operator_settings to delete.
     */
    where: operator_settingsWhereUniqueInput
  }

  /**
   * operator_settings deleteMany
   */
  export type operator_settingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which operator_settings to delete
     */
    where?: operator_settingsWhereInput
    /**
     * Limit how many operator_settings to delete.
     */
    limit?: number
  }

  /**
   * operator_settings without action
   */
  export type operator_settingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operator_settings
     */
    select?: operator_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operator_settings
     */
    omit?: operator_settingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operator_settingsInclude<ExtArgs> | null
  }


  /**
   * Model platform_users
   */

  export type AggregatePlatform_users = {
    _count: Platform_usersCountAggregateOutputType | null
    _min: Platform_usersMinAggregateOutputType | null
    _max: Platform_usersMaxAggregateOutputType | null
  }

  export type Platform_usersMinAggregateOutputType = {
    id: string | null
    email: string | null
    password_hash: string | null
    role: $Enums.platform_role | null
    mfa_enabled: boolean | null
    mfa_secret_encrypted: string | null
    last_login_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Platform_usersMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password_hash: string | null
    role: $Enums.platform_role | null
    mfa_enabled: boolean | null
    mfa_secret_encrypted: string | null
    last_login_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Platform_usersCountAggregateOutputType = {
    id: number
    email: number
    password_hash: number
    role: number
    mfa_enabled: number
    mfa_secret_encrypted: number
    last_login_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Platform_usersMinAggregateInputType = {
    id?: true
    email?: true
    password_hash?: true
    role?: true
    mfa_enabled?: true
    mfa_secret_encrypted?: true
    last_login_at?: true
    created_at?: true
    updated_at?: true
  }

  export type Platform_usersMaxAggregateInputType = {
    id?: true
    email?: true
    password_hash?: true
    role?: true
    mfa_enabled?: true
    mfa_secret_encrypted?: true
    last_login_at?: true
    created_at?: true
    updated_at?: true
  }

  export type Platform_usersCountAggregateInputType = {
    id?: true
    email?: true
    password_hash?: true
    role?: true
    mfa_enabled?: true
    mfa_secret_encrypted?: true
    last_login_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Platform_usersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which platform_users to aggregate.
     */
    where?: platform_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_users to fetch.
     */
    orderBy?: platform_usersOrderByWithRelationInput | platform_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: platform_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned platform_users
    **/
    _count?: true | Platform_usersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Platform_usersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Platform_usersMaxAggregateInputType
  }

  export type GetPlatform_usersAggregateType<T extends Platform_usersAggregateArgs> = {
        [P in keyof T & keyof AggregatePlatform_users]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlatform_users[P]>
      : GetScalarType<T[P], AggregatePlatform_users[P]>
  }




  export type platform_usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: platform_usersWhereInput
    orderBy?: platform_usersOrderByWithAggregationInput | platform_usersOrderByWithAggregationInput[]
    by: Platform_usersScalarFieldEnum[] | Platform_usersScalarFieldEnum
    having?: platform_usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Platform_usersCountAggregateInputType | true
    _min?: Platform_usersMinAggregateInputType
    _max?: Platform_usersMaxAggregateInputType
  }

  export type Platform_usersGroupByOutputType = {
    id: string
    email: string
    password_hash: string
    role: $Enums.platform_role
    mfa_enabled: boolean
    mfa_secret_encrypted: string | null
    last_login_at: Date | null
    created_at: Date
    updated_at: Date
    _count: Platform_usersCountAggregateOutputType | null
    _min: Platform_usersMinAggregateOutputType | null
    _max: Platform_usersMaxAggregateOutputType | null
  }

  type GetPlatform_usersGroupByPayload<T extends platform_usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Platform_usersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Platform_usersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Platform_usersGroupByOutputType[P]>
            : GetScalarType<T[P], Platform_usersGroupByOutputType[P]>
        }
      >
    >


  export type platform_usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    mfa_enabled?: boolean
    mfa_secret_encrypted?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    audit_logs?: boolean | platform_users$audit_logsArgs<ExtArgs>
    _count?: boolean | Platform_usersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["platform_users"]>

  export type platform_usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    mfa_enabled?: boolean
    mfa_secret_encrypted?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["platform_users"]>

  export type platform_usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    mfa_enabled?: boolean
    mfa_secret_encrypted?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["platform_users"]>

  export type platform_usersSelectScalar = {
    id?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    mfa_enabled?: boolean
    mfa_secret_encrypted?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type platform_usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password_hash" | "role" | "mfa_enabled" | "mfa_secret_encrypted" | "last_login_at" | "created_at" | "updated_at", ExtArgs["result"]["platform_users"]>
  export type platform_usersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    audit_logs?: boolean | platform_users$audit_logsArgs<ExtArgs>
    _count?: boolean | Platform_usersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type platform_usersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type platform_usersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $platform_usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "platform_users"
    objects: {
      audit_logs: Prisma.$platform_audit_logsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password_hash: string
      role: $Enums.platform_role
      mfa_enabled: boolean
      mfa_secret_encrypted: string | null
      last_login_at: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["platform_users"]>
    composites: {}
  }

  type platform_usersGetPayload<S extends boolean | null | undefined | platform_usersDefaultArgs> = $Result.GetResult<Prisma.$platform_usersPayload, S>

  type platform_usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<platform_usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Platform_usersCountAggregateInputType | true
    }

  export interface platform_usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['platform_users'], meta: { name: 'platform_users' } }
    /**
     * Find zero or one Platform_users that matches the filter.
     * @param {platform_usersFindUniqueArgs} args - Arguments to find a Platform_users
     * @example
     * // Get one Platform_users
     * const platform_users = await prisma.platform_users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends platform_usersFindUniqueArgs>(args: SelectSubset<T, platform_usersFindUniqueArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Platform_users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {platform_usersFindUniqueOrThrowArgs} args - Arguments to find a Platform_users
     * @example
     * // Get one Platform_users
     * const platform_users = await prisma.platform_users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends platform_usersFindUniqueOrThrowArgs>(args: SelectSubset<T, platform_usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Platform_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_usersFindFirstArgs} args - Arguments to find a Platform_users
     * @example
     * // Get one Platform_users
     * const platform_users = await prisma.platform_users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends platform_usersFindFirstArgs>(args?: SelectSubset<T, platform_usersFindFirstArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Platform_users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_usersFindFirstOrThrowArgs} args - Arguments to find a Platform_users
     * @example
     * // Get one Platform_users
     * const platform_users = await prisma.platform_users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends platform_usersFindFirstOrThrowArgs>(args?: SelectSubset<T, platform_usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Platform_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Platform_users
     * const platform_users = await prisma.platform_users.findMany()
     * 
     * // Get first 10 Platform_users
     * const platform_users = await prisma.platform_users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const platform_usersWithIdOnly = await prisma.platform_users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends platform_usersFindManyArgs>(args?: SelectSubset<T, platform_usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Platform_users.
     * @param {platform_usersCreateArgs} args - Arguments to create a Platform_users.
     * @example
     * // Create one Platform_users
     * const Platform_users = await prisma.platform_users.create({
     *   data: {
     *     // ... data to create a Platform_users
     *   }
     * })
     * 
     */
    create<T extends platform_usersCreateArgs>(args: SelectSubset<T, platform_usersCreateArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Platform_users.
     * @param {platform_usersCreateManyArgs} args - Arguments to create many Platform_users.
     * @example
     * // Create many Platform_users
     * const platform_users = await prisma.platform_users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends platform_usersCreateManyArgs>(args?: SelectSubset<T, platform_usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Platform_users and returns the data saved in the database.
     * @param {platform_usersCreateManyAndReturnArgs} args - Arguments to create many Platform_users.
     * @example
     * // Create many Platform_users
     * const platform_users = await prisma.platform_users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Platform_users and only return the `id`
     * const platform_usersWithIdOnly = await prisma.platform_users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends platform_usersCreateManyAndReturnArgs>(args?: SelectSubset<T, platform_usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Platform_users.
     * @param {platform_usersDeleteArgs} args - Arguments to delete one Platform_users.
     * @example
     * // Delete one Platform_users
     * const Platform_users = await prisma.platform_users.delete({
     *   where: {
     *     // ... filter to delete one Platform_users
     *   }
     * })
     * 
     */
    delete<T extends platform_usersDeleteArgs>(args: SelectSubset<T, platform_usersDeleteArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Platform_users.
     * @param {platform_usersUpdateArgs} args - Arguments to update one Platform_users.
     * @example
     * // Update one Platform_users
     * const platform_users = await prisma.platform_users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends platform_usersUpdateArgs>(args: SelectSubset<T, platform_usersUpdateArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Platform_users.
     * @param {platform_usersDeleteManyArgs} args - Arguments to filter Platform_users to delete.
     * @example
     * // Delete a few Platform_users
     * const { count } = await prisma.platform_users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends platform_usersDeleteManyArgs>(args?: SelectSubset<T, platform_usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Platform_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Platform_users
     * const platform_users = await prisma.platform_users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends platform_usersUpdateManyArgs>(args: SelectSubset<T, platform_usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Platform_users and returns the data updated in the database.
     * @param {platform_usersUpdateManyAndReturnArgs} args - Arguments to update many Platform_users.
     * @example
     * // Update many Platform_users
     * const platform_users = await prisma.platform_users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Platform_users and only return the `id`
     * const platform_usersWithIdOnly = await prisma.platform_users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends platform_usersUpdateManyAndReturnArgs>(args: SelectSubset<T, platform_usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Platform_users.
     * @param {platform_usersUpsertArgs} args - Arguments to update or create a Platform_users.
     * @example
     * // Update or create a Platform_users
     * const platform_users = await prisma.platform_users.upsert({
     *   create: {
     *     // ... data to create a Platform_users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Platform_users we want to update
     *   }
     * })
     */
    upsert<T extends platform_usersUpsertArgs>(args: SelectSubset<T, platform_usersUpsertArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Platform_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_usersCountArgs} args - Arguments to filter Platform_users to count.
     * @example
     * // Count the number of Platform_users
     * const count = await prisma.platform_users.count({
     *   where: {
     *     // ... the filter for the Platform_users we want to count
     *   }
     * })
    **/
    count<T extends platform_usersCountArgs>(
      args?: Subset<T, platform_usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Platform_usersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Platform_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Platform_usersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Platform_usersAggregateArgs>(args: Subset<T, Platform_usersAggregateArgs>): Prisma.PrismaPromise<GetPlatform_usersAggregateType<T>>

    /**
     * Group by Platform_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_usersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends platform_usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: platform_usersGroupByArgs['orderBy'] }
        : { orderBy?: platform_usersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, platform_usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatform_usersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the platform_users model
   */
  readonly fields: platform_usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for platform_users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__platform_usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    audit_logs<T extends platform_users$audit_logsArgs<ExtArgs> = {}>(args?: Subset<T, platform_users$audit_logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the platform_users model
   */
  interface platform_usersFieldRefs {
    readonly id: FieldRef<"platform_users", 'String'>
    readonly email: FieldRef<"platform_users", 'String'>
    readonly password_hash: FieldRef<"platform_users", 'String'>
    readonly role: FieldRef<"platform_users", 'platform_role'>
    readonly mfa_enabled: FieldRef<"platform_users", 'Boolean'>
    readonly mfa_secret_encrypted: FieldRef<"platform_users", 'String'>
    readonly last_login_at: FieldRef<"platform_users", 'DateTime'>
    readonly created_at: FieldRef<"platform_users", 'DateTime'>
    readonly updated_at: FieldRef<"platform_users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * platform_users findUnique
   */
  export type platform_usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * Filter, which platform_users to fetch.
     */
    where: platform_usersWhereUniqueInput
  }

  /**
   * platform_users findUniqueOrThrow
   */
  export type platform_usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * Filter, which platform_users to fetch.
     */
    where: platform_usersWhereUniqueInput
  }

  /**
   * platform_users findFirst
   */
  export type platform_usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * Filter, which platform_users to fetch.
     */
    where?: platform_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_users to fetch.
     */
    orderBy?: platform_usersOrderByWithRelationInput | platform_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for platform_users.
     */
    cursor?: platform_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of platform_users.
     */
    distinct?: Platform_usersScalarFieldEnum | Platform_usersScalarFieldEnum[]
  }

  /**
   * platform_users findFirstOrThrow
   */
  export type platform_usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * Filter, which platform_users to fetch.
     */
    where?: platform_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_users to fetch.
     */
    orderBy?: platform_usersOrderByWithRelationInput | platform_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for platform_users.
     */
    cursor?: platform_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of platform_users.
     */
    distinct?: Platform_usersScalarFieldEnum | Platform_usersScalarFieldEnum[]
  }

  /**
   * platform_users findMany
   */
  export type platform_usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * Filter, which platform_users to fetch.
     */
    where?: platform_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_users to fetch.
     */
    orderBy?: platform_usersOrderByWithRelationInput | platform_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing platform_users.
     */
    cursor?: platform_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_users.
     */
    skip?: number
    distinct?: Platform_usersScalarFieldEnum | Platform_usersScalarFieldEnum[]
  }

  /**
   * platform_users create
   */
  export type platform_usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * The data needed to create a platform_users.
     */
    data: XOR<platform_usersCreateInput, platform_usersUncheckedCreateInput>
  }

  /**
   * platform_users createMany
   */
  export type platform_usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many platform_users.
     */
    data: platform_usersCreateManyInput | platform_usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * platform_users createManyAndReturn
   */
  export type platform_usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * The data used to create many platform_users.
     */
    data: platform_usersCreateManyInput | platform_usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * platform_users update
   */
  export type platform_usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * The data needed to update a platform_users.
     */
    data: XOR<platform_usersUpdateInput, platform_usersUncheckedUpdateInput>
    /**
     * Choose, which platform_users to update.
     */
    where: platform_usersWhereUniqueInput
  }

  /**
   * platform_users updateMany
   */
  export type platform_usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update platform_users.
     */
    data: XOR<platform_usersUpdateManyMutationInput, platform_usersUncheckedUpdateManyInput>
    /**
     * Filter which platform_users to update
     */
    where?: platform_usersWhereInput
    /**
     * Limit how many platform_users to update.
     */
    limit?: number
  }

  /**
   * platform_users updateManyAndReturn
   */
  export type platform_usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * The data used to update platform_users.
     */
    data: XOR<platform_usersUpdateManyMutationInput, platform_usersUncheckedUpdateManyInput>
    /**
     * Filter which platform_users to update
     */
    where?: platform_usersWhereInput
    /**
     * Limit how many platform_users to update.
     */
    limit?: number
  }

  /**
   * platform_users upsert
   */
  export type platform_usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * The filter to search for the platform_users to update in case it exists.
     */
    where: platform_usersWhereUniqueInput
    /**
     * In case the platform_users found by the `where` argument doesn't exist, create a new platform_users with this data.
     */
    create: XOR<platform_usersCreateInput, platform_usersUncheckedCreateInput>
    /**
     * In case the platform_users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<platform_usersUpdateInput, platform_usersUncheckedUpdateInput>
  }

  /**
   * platform_users delete
   */
  export type platform_usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    /**
     * Filter which platform_users to delete.
     */
    where: platform_usersWhereUniqueInput
  }

  /**
   * platform_users deleteMany
   */
  export type platform_usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which platform_users to delete
     */
    where?: platform_usersWhereInput
    /**
     * Limit how many platform_users to delete.
     */
    limit?: number
  }

  /**
   * platform_users.audit_logs
   */
  export type platform_users$audit_logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    where?: platform_audit_logsWhereInput
    orderBy?: platform_audit_logsOrderByWithRelationInput | platform_audit_logsOrderByWithRelationInput[]
    cursor?: platform_audit_logsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Platform_audit_logsScalarFieldEnum | Platform_audit_logsScalarFieldEnum[]
  }

  /**
   * platform_users without action
   */
  export type platform_usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
  }


  /**
   * Model platform_audit_logs
   */

  export type AggregatePlatform_audit_logs = {
    _count: Platform_audit_logsCountAggregateOutputType | null
    _min: Platform_audit_logsMinAggregateOutputType | null
    _max: Platform_audit_logsMaxAggregateOutputType | null
  }

  export type Platform_audit_logsMinAggregateOutputType = {
    id: string | null
    platform_user_id: string | null
    operator_id: string | null
    action: string | null
    entity_type: string | null
    entity_id: string | null
    created_at: Date | null
  }

  export type Platform_audit_logsMaxAggregateOutputType = {
    id: string | null
    platform_user_id: string | null
    operator_id: string | null
    action: string | null
    entity_type: string | null
    entity_id: string | null
    created_at: Date | null
  }

  export type Platform_audit_logsCountAggregateOutputType = {
    id: number
    platform_user_id: number
    operator_id: number
    action: number
    entity_type: number
    entity_id: number
    metadata: number
    created_at: number
    _all: number
  }


  export type Platform_audit_logsMinAggregateInputType = {
    id?: true
    platform_user_id?: true
    operator_id?: true
    action?: true
    entity_type?: true
    entity_id?: true
    created_at?: true
  }

  export type Platform_audit_logsMaxAggregateInputType = {
    id?: true
    platform_user_id?: true
    operator_id?: true
    action?: true
    entity_type?: true
    entity_id?: true
    created_at?: true
  }

  export type Platform_audit_logsCountAggregateInputType = {
    id?: true
    platform_user_id?: true
    operator_id?: true
    action?: true
    entity_type?: true
    entity_id?: true
    metadata?: true
    created_at?: true
    _all?: true
  }

  export type Platform_audit_logsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which platform_audit_logs to aggregate.
     */
    where?: platform_audit_logsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_audit_logs to fetch.
     */
    orderBy?: platform_audit_logsOrderByWithRelationInput | platform_audit_logsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: platform_audit_logsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_audit_logs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_audit_logs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned platform_audit_logs
    **/
    _count?: true | Platform_audit_logsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Platform_audit_logsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Platform_audit_logsMaxAggregateInputType
  }

  export type GetPlatform_audit_logsAggregateType<T extends Platform_audit_logsAggregateArgs> = {
        [P in keyof T & keyof AggregatePlatform_audit_logs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlatform_audit_logs[P]>
      : GetScalarType<T[P], AggregatePlatform_audit_logs[P]>
  }




  export type platform_audit_logsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: platform_audit_logsWhereInput
    orderBy?: platform_audit_logsOrderByWithAggregationInput | platform_audit_logsOrderByWithAggregationInput[]
    by: Platform_audit_logsScalarFieldEnum[] | Platform_audit_logsScalarFieldEnum
    having?: platform_audit_logsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Platform_audit_logsCountAggregateInputType | true
    _min?: Platform_audit_logsMinAggregateInputType
    _max?: Platform_audit_logsMaxAggregateInputType
  }

  export type Platform_audit_logsGroupByOutputType = {
    id: string
    platform_user_id: string | null
    operator_id: string | null
    action: string
    entity_type: string
    entity_id: string | null
    metadata: JsonValue | null
    created_at: Date
    _count: Platform_audit_logsCountAggregateOutputType | null
    _min: Platform_audit_logsMinAggregateOutputType | null
    _max: Platform_audit_logsMaxAggregateOutputType | null
  }

  type GetPlatform_audit_logsGroupByPayload<T extends platform_audit_logsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Platform_audit_logsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Platform_audit_logsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Platform_audit_logsGroupByOutputType[P]>
            : GetScalarType<T[P], Platform_audit_logsGroupByOutputType[P]>
        }
      >
    >


  export type platform_audit_logsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platform_user_id?: boolean
    operator_id?: boolean
    action?: boolean
    entity_type?: boolean
    entity_id?: boolean
    metadata?: boolean
    created_at?: boolean
    platform_user?: boolean | platform_audit_logs$platform_userArgs<ExtArgs>
    operator?: boolean | platform_audit_logs$operatorArgs<ExtArgs>
  }, ExtArgs["result"]["platform_audit_logs"]>

  export type platform_audit_logsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platform_user_id?: boolean
    operator_id?: boolean
    action?: boolean
    entity_type?: boolean
    entity_id?: boolean
    metadata?: boolean
    created_at?: boolean
    platform_user?: boolean | platform_audit_logs$platform_userArgs<ExtArgs>
    operator?: boolean | platform_audit_logs$operatorArgs<ExtArgs>
  }, ExtArgs["result"]["platform_audit_logs"]>

  export type platform_audit_logsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platform_user_id?: boolean
    operator_id?: boolean
    action?: boolean
    entity_type?: boolean
    entity_id?: boolean
    metadata?: boolean
    created_at?: boolean
    platform_user?: boolean | platform_audit_logs$platform_userArgs<ExtArgs>
    operator?: boolean | platform_audit_logs$operatorArgs<ExtArgs>
  }, ExtArgs["result"]["platform_audit_logs"]>

  export type platform_audit_logsSelectScalar = {
    id?: boolean
    platform_user_id?: boolean
    operator_id?: boolean
    action?: boolean
    entity_type?: boolean
    entity_id?: boolean
    metadata?: boolean
    created_at?: boolean
  }

  export type platform_audit_logsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "platform_user_id" | "operator_id" | "action" | "entity_type" | "entity_id" | "metadata" | "created_at", ExtArgs["result"]["platform_audit_logs"]>
  export type platform_audit_logsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    platform_user?: boolean | platform_audit_logs$platform_userArgs<ExtArgs>
    operator?: boolean | platform_audit_logs$operatorArgs<ExtArgs>
  }
  export type platform_audit_logsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    platform_user?: boolean | platform_audit_logs$platform_userArgs<ExtArgs>
    operator?: boolean | platform_audit_logs$operatorArgs<ExtArgs>
  }
  export type platform_audit_logsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    platform_user?: boolean | platform_audit_logs$platform_userArgs<ExtArgs>
    operator?: boolean | platform_audit_logs$operatorArgs<ExtArgs>
  }

  export type $platform_audit_logsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "platform_audit_logs"
    objects: {
      platform_user: Prisma.$platform_usersPayload<ExtArgs> | null
      operator: Prisma.$operatorsPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      platform_user_id: string | null
      operator_id: string | null
      action: string
      entity_type: string
      entity_id: string | null
      metadata: Prisma.JsonValue | null
      created_at: Date
    }, ExtArgs["result"]["platform_audit_logs"]>
    composites: {}
  }

  type platform_audit_logsGetPayload<S extends boolean | null | undefined | platform_audit_logsDefaultArgs> = $Result.GetResult<Prisma.$platform_audit_logsPayload, S>

  type platform_audit_logsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<platform_audit_logsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Platform_audit_logsCountAggregateInputType | true
    }

  export interface platform_audit_logsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['platform_audit_logs'], meta: { name: 'platform_audit_logs' } }
    /**
     * Find zero or one Platform_audit_logs that matches the filter.
     * @param {platform_audit_logsFindUniqueArgs} args - Arguments to find a Platform_audit_logs
     * @example
     * // Get one Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends platform_audit_logsFindUniqueArgs>(args: SelectSubset<T, platform_audit_logsFindUniqueArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Platform_audit_logs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {platform_audit_logsFindUniqueOrThrowArgs} args - Arguments to find a Platform_audit_logs
     * @example
     * // Get one Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends platform_audit_logsFindUniqueOrThrowArgs>(args: SelectSubset<T, platform_audit_logsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Platform_audit_logs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_audit_logsFindFirstArgs} args - Arguments to find a Platform_audit_logs
     * @example
     * // Get one Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends platform_audit_logsFindFirstArgs>(args?: SelectSubset<T, platform_audit_logsFindFirstArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Platform_audit_logs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_audit_logsFindFirstOrThrowArgs} args - Arguments to find a Platform_audit_logs
     * @example
     * // Get one Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends platform_audit_logsFindFirstOrThrowArgs>(args?: SelectSubset<T, platform_audit_logsFindFirstOrThrowArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Platform_audit_logs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_audit_logsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.findMany()
     * 
     * // Get first 10 Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const platform_audit_logsWithIdOnly = await prisma.platform_audit_logs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends platform_audit_logsFindManyArgs>(args?: SelectSubset<T, platform_audit_logsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Platform_audit_logs.
     * @param {platform_audit_logsCreateArgs} args - Arguments to create a Platform_audit_logs.
     * @example
     * // Create one Platform_audit_logs
     * const Platform_audit_logs = await prisma.platform_audit_logs.create({
     *   data: {
     *     // ... data to create a Platform_audit_logs
     *   }
     * })
     * 
     */
    create<T extends platform_audit_logsCreateArgs>(args: SelectSubset<T, platform_audit_logsCreateArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Platform_audit_logs.
     * @param {platform_audit_logsCreateManyArgs} args - Arguments to create many Platform_audit_logs.
     * @example
     * // Create many Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends platform_audit_logsCreateManyArgs>(args?: SelectSubset<T, platform_audit_logsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Platform_audit_logs and returns the data saved in the database.
     * @param {platform_audit_logsCreateManyAndReturnArgs} args - Arguments to create many Platform_audit_logs.
     * @example
     * // Create many Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Platform_audit_logs and only return the `id`
     * const platform_audit_logsWithIdOnly = await prisma.platform_audit_logs.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends platform_audit_logsCreateManyAndReturnArgs>(args?: SelectSubset<T, platform_audit_logsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Platform_audit_logs.
     * @param {platform_audit_logsDeleteArgs} args - Arguments to delete one Platform_audit_logs.
     * @example
     * // Delete one Platform_audit_logs
     * const Platform_audit_logs = await prisma.platform_audit_logs.delete({
     *   where: {
     *     // ... filter to delete one Platform_audit_logs
     *   }
     * })
     * 
     */
    delete<T extends platform_audit_logsDeleteArgs>(args: SelectSubset<T, platform_audit_logsDeleteArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Platform_audit_logs.
     * @param {platform_audit_logsUpdateArgs} args - Arguments to update one Platform_audit_logs.
     * @example
     * // Update one Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends platform_audit_logsUpdateArgs>(args: SelectSubset<T, platform_audit_logsUpdateArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Platform_audit_logs.
     * @param {platform_audit_logsDeleteManyArgs} args - Arguments to filter Platform_audit_logs to delete.
     * @example
     * // Delete a few Platform_audit_logs
     * const { count } = await prisma.platform_audit_logs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends platform_audit_logsDeleteManyArgs>(args?: SelectSubset<T, platform_audit_logsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Platform_audit_logs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_audit_logsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends platform_audit_logsUpdateManyArgs>(args: SelectSubset<T, platform_audit_logsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Platform_audit_logs and returns the data updated in the database.
     * @param {platform_audit_logsUpdateManyAndReturnArgs} args - Arguments to update many Platform_audit_logs.
     * @example
     * // Update many Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Platform_audit_logs and only return the `id`
     * const platform_audit_logsWithIdOnly = await prisma.platform_audit_logs.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends platform_audit_logsUpdateManyAndReturnArgs>(args: SelectSubset<T, platform_audit_logsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Platform_audit_logs.
     * @param {platform_audit_logsUpsertArgs} args - Arguments to update or create a Platform_audit_logs.
     * @example
     * // Update or create a Platform_audit_logs
     * const platform_audit_logs = await prisma.platform_audit_logs.upsert({
     *   create: {
     *     // ... data to create a Platform_audit_logs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Platform_audit_logs we want to update
     *   }
     * })
     */
    upsert<T extends platform_audit_logsUpsertArgs>(args: SelectSubset<T, platform_audit_logsUpsertArgs<ExtArgs>>): Prisma__platform_audit_logsClient<$Result.GetResult<Prisma.$platform_audit_logsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Platform_audit_logs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_audit_logsCountArgs} args - Arguments to filter Platform_audit_logs to count.
     * @example
     * // Count the number of Platform_audit_logs
     * const count = await prisma.platform_audit_logs.count({
     *   where: {
     *     // ... the filter for the Platform_audit_logs we want to count
     *   }
     * })
    **/
    count<T extends platform_audit_logsCountArgs>(
      args?: Subset<T, platform_audit_logsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Platform_audit_logsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Platform_audit_logs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Platform_audit_logsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Platform_audit_logsAggregateArgs>(args: Subset<T, Platform_audit_logsAggregateArgs>): Prisma.PrismaPromise<GetPlatform_audit_logsAggregateType<T>>

    /**
     * Group by Platform_audit_logs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_audit_logsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends platform_audit_logsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: platform_audit_logsGroupByArgs['orderBy'] }
        : { orderBy?: platform_audit_logsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, platform_audit_logsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatform_audit_logsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the platform_audit_logs model
   */
  readonly fields: platform_audit_logsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for platform_audit_logs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__platform_audit_logsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    platform_user<T extends platform_audit_logs$platform_userArgs<ExtArgs> = {}>(args?: Subset<T, platform_audit_logs$platform_userArgs<ExtArgs>>): Prisma__platform_usersClient<$Result.GetResult<Prisma.$platform_usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    operator<T extends platform_audit_logs$operatorArgs<ExtArgs> = {}>(args?: Subset<T, platform_audit_logs$operatorArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the platform_audit_logs model
   */
  interface platform_audit_logsFieldRefs {
    readonly id: FieldRef<"platform_audit_logs", 'String'>
    readonly platform_user_id: FieldRef<"platform_audit_logs", 'String'>
    readonly operator_id: FieldRef<"platform_audit_logs", 'String'>
    readonly action: FieldRef<"platform_audit_logs", 'String'>
    readonly entity_type: FieldRef<"platform_audit_logs", 'String'>
    readonly entity_id: FieldRef<"platform_audit_logs", 'String'>
    readonly metadata: FieldRef<"platform_audit_logs", 'Json'>
    readonly created_at: FieldRef<"platform_audit_logs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * platform_audit_logs findUnique
   */
  export type platform_audit_logsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * Filter, which platform_audit_logs to fetch.
     */
    where: platform_audit_logsWhereUniqueInput
  }

  /**
   * platform_audit_logs findUniqueOrThrow
   */
  export type platform_audit_logsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * Filter, which platform_audit_logs to fetch.
     */
    where: platform_audit_logsWhereUniqueInput
  }

  /**
   * platform_audit_logs findFirst
   */
  export type platform_audit_logsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * Filter, which platform_audit_logs to fetch.
     */
    where?: platform_audit_logsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_audit_logs to fetch.
     */
    orderBy?: platform_audit_logsOrderByWithRelationInput | platform_audit_logsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for platform_audit_logs.
     */
    cursor?: platform_audit_logsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_audit_logs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_audit_logs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of platform_audit_logs.
     */
    distinct?: Platform_audit_logsScalarFieldEnum | Platform_audit_logsScalarFieldEnum[]
  }

  /**
   * platform_audit_logs findFirstOrThrow
   */
  export type platform_audit_logsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * Filter, which platform_audit_logs to fetch.
     */
    where?: platform_audit_logsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_audit_logs to fetch.
     */
    orderBy?: platform_audit_logsOrderByWithRelationInput | platform_audit_logsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for platform_audit_logs.
     */
    cursor?: platform_audit_logsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_audit_logs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_audit_logs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of platform_audit_logs.
     */
    distinct?: Platform_audit_logsScalarFieldEnum | Platform_audit_logsScalarFieldEnum[]
  }

  /**
   * platform_audit_logs findMany
   */
  export type platform_audit_logsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * Filter, which platform_audit_logs to fetch.
     */
    where?: platform_audit_logsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_audit_logs to fetch.
     */
    orderBy?: platform_audit_logsOrderByWithRelationInput | platform_audit_logsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing platform_audit_logs.
     */
    cursor?: platform_audit_logsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_audit_logs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_audit_logs.
     */
    skip?: number
    distinct?: Platform_audit_logsScalarFieldEnum | Platform_audit_logsScalarFieldEnum[]
  }

  /**
   * platform_audit_logs create
   */
  export type platform_audit_logsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * The data needed to create a platform_audit_logs.
     */
    data: XOR<platform_audit_logsCreateInput, platform_audit_logsUncheckedCreateInput>
  }

  /**
   * platform_audit_logs createMany
   */
  export type platform_audit_logsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many platform_audit_logs.
     */
    data: platform_audit_logsCreateManyInput | platform_audit_logsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * platform_audit_logs createManyAndReturn
   */
  export type platform_audit_logsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * The data used to create many platform_audit_logs.
     */
    data: platform_audit_logsCreateManyInput | platform_audit_logsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * platform_audit_logs update
   */
  export type platform_audit_logsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * The data needed to update a platform_audit_logs.
     */
    data: XOR<platform_audit_logsUpdateInput, platform_audit_logsUncheckedUpdateInput>
    /**
     * Choose, which platform_audit_logs to update.
     */
    where: platform_audit_logsWhereUniqueInput
  }

  /**
   * platform_audit_logs updateMany
   */
  export type platform_audit_logsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update platform_audit_logs.
     */
    data: XOR<platform_audit_logsUpdateManyMutationInput, platform_audit_logsUncheckedUpdateManyInput>
    /**
     * Filter which platform_audit_logs to update
     */
    where?: platform_audit_logsWhereInput
    /**
     * Limit how many platform_audit_logs to update.
     */
    limit?: number
  }

  /**
   * platform_audit_logs updateManyAndReturn
   */
  export type platform_audit_logsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * The data used to update platform_audit_logs.
     */
    data: XOR<platform_audit_logsUpdateManyMutationInput, platform_audit_logsUncheckedUpdateManyInput>
    /**
     * Filter which platform_audit_logs to update
     */
    where?: platform_audit_logsWhereInput
    /**
     * Limit how many platform_audit_logs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * platform_audit_logs upsert
   */
  export type platform_audit_logsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * The filter to search for the platform_audit_logs to update in case it exists.
     */
    where: platform_audit_logsWhereUniqueInput
    /**
     * In case the platform_audit_logs found by the `where` argument doesn't exist, create a new platform_audit_logs with this data.
     */
    create: XOR<platform_audit_logsCreateInput, platform_audit_logsUncheckedCreateInput>
    /**
     * In case the platform_audit_logs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<platform_audit_logsUpdateInput, platform_audit_logsUncheckedUpdateInput>
  }

  /**
   * platform_audit_logs delete
   */
  export type platform_audit_logsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
    /**
     * Filter which platform_audit_logs to delete.
     */
    where: platform_audit_logsWhereUniqueInput
  }

  /**
   * platform_audit_logs deleteMany
   */
  export type platform_audit_logsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which platform_audit_logs to delete
     */
    where?: platform_audit_logsWhereInput
    /**
     * Limit how many platform_audit_logs to delete.
     */
    limit?: number
  }

  /**
   * platform_audit_logs.platform_user
   */
  export type platform_audit_logs$platform_userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_users
     */
    select?: platform_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_users
     */
    omit?: platform_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_usersInclude<ExtArgs> | null
    where?: platform_usersWhereInput
  }

  /**
   * platform_audit_logs.operator
   */
  export type platform_audit_logs$operatorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the operators
     */
    select?: operatorsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the operators
     */
    omit?: operatorsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: operatorsInclude<ExtArgs> | null
    where?: operatorsWhereInput
  }

  /**
   * platform_audit_logs without action
   */
  export type platform_audit_logsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_audit_logs
     */
    select?: platform_audit_logsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_audit_logs
     */
    omit?: platform_audit_logsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: platform_audit_logsInclude<ExtArgs> | null
  }


  /**
   * Model platform_settings
   */

  export type AggregatePlatform_settings = {
    _count: Platform_settingsCountAggregateOutputType | null
    _avg: Platform_settingsAvgAggregateOutputType | null
    _sum: Platform_settingsSumAggregateOutputType | null
    _min: Platform_settingsMinAggregateOutputType | null
    _max: Platform_settingsMaxAggregateOutputType | null
  }

  export type Platform_settingsAvgAggregateOutputType = {
    smtp_port: number | null
  }

  export type Platform_settingsSumAggregateOutputType = {
    smtp_port: number | null
  }

  export type Platform_settingsMinAggregateOutputType = {
    id: string | null
    tenant_base_domain: string | null
    alert_email: string | null
    rollup_schedule: string | null
    smtp_host: string | null
    smtp_port: number | null
    smtp_user: string | null
    updated_at: Date | null
  }

  export type Platform_settingsMaxAggregateOutputType = {
    id: string | null
    tenant_base_domain: string | null
    alert_email: string | null
    rollup_schedule: string | null
    smtp_host: string | null
    smtp_port: number | null
    smtp_user: string | null
    updated_at: Date | null
  }

  export type Platform_settingsCountAggregateOutputType = {
    id: number
    tenant_base_domain: number
    alert_email: number
    rollup_schedule: number
    smtp_host: number
    smtp_port: number
    smtp_user: number
    updated_at: number
    _all: number
  }


  export type Platform_settingsAvgAggregateInputType = {
    smtp_port?: true
  }

  export type Platform_settingsSumAggregateInputType = {
    smtp_port?: true
  }

  export type Platform_settingsMinAggregateInputType = {
    id?: true
    tenant_base_domain?: true
    alert_email?: true
    rollup_schedule?: true
    smtp_host?: true
    smtp_port?: true
    smtp_user?: true
    updated_at?: true
  }

  export type Platform_settingsMaxAggregateInputType = {
    id?: true
    tenant_base_domain?: true
    alert_email?: true
    rollup_schedule?: true
    smtp_host?: true
    smtp_port?: true
    smtp_user?: true
    updated_at?: true
  }

  export type Platform_settingsCountAggregateInputType = {
    id?: true
    tenant_base_domain?: true
    alert_email?: true
    rollup_schedule?: true
    smtp_host?: true
    smtp_port?: true
    smtp_user?: true
    updated_at?: true
    _all?: true
  }

  export type Platform_settingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which platform_settings to aggregate.
     */
    where?: platform_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_settings to fetch.
     */
    orderBy?: platform_settingsOrderByWithRelationInput | platform_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: platform_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned platform_settings
    **/
    _count?: true | Platform_settingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Platform_settingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Platform_settingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Platform_settingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Platform_settingsMaxAggregateInputType
  }

  export type GetPlatform_settingsAggregateType<T extends Platform_settingsAggregateArgs> = {
        [P in keyof T & keyof AggregatePlatform_settings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlatform_settings[P]>
      : GetScalarType<T[P], AggregatePlatform_settings[P]>
  }




  export type platform_settingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: platform_settingsWhereInput
    orderBy?: platform_settingsOrderByWithAggregationInput | platform_settingsOrderByWithAggregationInput[]
    by: Platform_settingsScalarFieldEnum[] | Platform_settingsScalarFieldEnum
    having?: platform_settingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Platform_settingsCountAggregateInputType | true
    _avg?: Platform_settingsAvgAggregateInputType
    _sum?: Platform_settingsSumAggregateInputType
    _min?: Platform_settingsMinAggregateInputType
    _max?: Platform_settingsMaxAggregateInputType
  }

  export type Platform_settingsGroupByOutputType = {
    id: string
    tenant_base_domain: string
    alert_email: string | null
    rollup_schedule: string
    smtp_host: string | null
    smtp_port: number | null
    smtp_user: string | null
    updated_at: Date
    _count: Platform_settingsCountAggregateOutputType | null
    _avg: Platform_settingsAvgAggregateOutputType | null
    _sum: Platform_settingsSumAggregateOutputType | null
    _min: Platform_settingsMinAggregateOutputType | null
    _max: Platform_settingsMaxAggregateOutputType | null
  }

  type GetPlatform_settingsGroupByPayload<T extends platform_settingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Platform_settingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Platform_settingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Platform_settingsGroupByOutputType[P]>
            : GetScalarType<T[P], Platform_settingsGroupByOutputType[P]>
        }
      >
    >


  export type platform_settingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_base_domain?: boolean
    alert_email?: boolean
    rollup_schedule?: boolean
    smtp_host?: boolean
    smtp_port?: boolean
    smtp_user?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["platform_settings"]>

  export type platform_settingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_base_domain?: boolean
    alert_email?: boolean
    rollup_schedule?: boolean
    smtp_host?: boolean
    smtp_port?: boolean
    smtp_user?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["platform_settings"]>

  export type platform_settingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_base_domain?: boolean
    alert_email?: boolean
    rollup_schedule?: boolean
    smtp_host?: boolean
    smtp_port?: boolean
    smtp_user?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["platform_settings"]>

  export type platform_settingsSelectScalar = {
    id?: boolean
    tenant_base_domain?: boolean
    alert_email?: boolean
    rollup_schedule?: boolean
    smtp_host?: boolean
    smtp_port?: boolean
    smtp_user?: boolean
    updated_at?: boolean
  }

  export type platform_settingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenant_base_domain" | "alert_email" | "rollup_schedule" | "smtp_host" | "smtp_port" | "smtp_user" | "updated_at", ExtArgs["result"]["platform_settings"]>

  export type $platform_settingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "platform_settings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_base_domain: string
      alert_email: string | null
      rollup_schedule: string
      smtp_host: string | null
      smtp_port: number | null
      smtp_user: string | null
      updated_at: Date
    }, ExtArgs["result"]["platform_settings"]>
    composites: {}
  }

  type platform_settingsGetPayload<S extends boolean | null | undefined | platform_settingsDefaultArgs> = $Result.GetResult<Prisma.$platform_settingsPayload, S>

  type platform_settingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<platform_settingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Platform_settingsCountAggregateInputType | true
    }

  export interface platform_settingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['platform_settings'], meta: { name: 'platform_settings' } }
    /**
     * Find zero or one Platform_settings that matches the filter.
     * @param {platform_settingsFindUniqueArgs} args - Arguments to find a Platform_settings
     * @example
     * // Get one Platform_settings
     * const platform_settings = await prisma.platform_settings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends platform_settingsFindUniqueArgs>(args: SelectSubset<T, platform_settingsFindUniqueArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Platform_settings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {platform_settingsFindUniqueOrThrowArgs} args - Arguments to find a Platform_settings
     * @example
     * // Get one Platform_settings
     * const platform_settings = await prisma.platform_settings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends platform_settingsFindUniqueOrThrowArgs>(args: SelectSubset<T, platform_settingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Platform_settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_settingsFindFirstArgs} args - Arguments to find a Platform_settings
     * @example
     * // Get one Platform_settings
     * const platform_settings = await prisma.platform_settings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends platform_settingsFindFirstArgs>(args?: SelectSubset<T, platform_settingsFindFirstArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Platform_settings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_settingsFindFirstOrThrowArgs} args - Arguments to find a Platform_settings
     * @example
     * // Get one Platform_settings
     * const platform_settings = await prisma.platform_settings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends platform_settingsFindFirstOrThrowArgs>(args?: SelectSubset<T, platform_settingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Platform_settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_settingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Platform_settings
     * const platform_settings = await prisma.platform_settings.findMany()
     * 
     * // Get first 10 Platform_settings
     * const platform_settings = await prisma.platform_settings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const platform_settingsWithIdOnly = await prisma.platform_settings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends platform_settingsFindManyArgs>(args?: SelectSubset<T, platform_settingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Platform_settings.
     * @param {platform_settingsCreateArgs} args - Arguments to create a Platform_settings.
     * @example
     * // Create one Platform_settings
     * const Platform_settings = await prisma.platform_settings.create({
     *   data: {
     *     // ... data to create a Platform_settings
     *   }
     * })
     * 
     */
    create<T extends platform_settingsCreateArgs>(args: SelectSubset<T, platform_settingsCreateArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Platform_settings.
     * @param {platform_settingsCreateManyArgs} args - Arguments to create many Platform_settings.
     * @example
     * // Create many Platform_settings
     * const platform_settings = await prisma.platform_settings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends platform_settingsCreateManyArgs>(args?: SelectSubset<T, platform_settingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Platform_settings and returns the data saved in the database.
     * @param {platform_settingsCreateManyAndReturnArgs} args - Arguments to create many Platform_settings.
     * @example
     * // Create many Platform_settings
     * const platform_settings = await prisma.platform_settings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Platform_settings and only return the `id`
     * const platform_settingsWithIdOnly = await prisma.platform_settings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends platform_settingsCreateManyAndReturnArgs>(args?: SelectSubset<T, platform_settingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Platform_settings.
     * @param {platform_settingsDeleteArgs} args - Arguments to delete one Platform_settings.
     * @example
     * // Delete one Platform_settings
     * const Platform_settings = await prisma.platform_settings.delete({
     *   where: {
     *     // ... filter to delete one Platform_settings
     *   }
     * })
     * 
     */
    delete<T extends platform_settingsDeleteArgs>(args: SelectSubset<T, platform_settingsDeleteArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Platform_settings.
     * @param {platform_settingsUpdateArgs} args - Arguments to update one Platform_settings.
     * @example
     * // Update one Platform_settings
     * const platform_settings = await prisma.platform_settings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends platform_settingsUpdateArgs>(args: SelectSubset<T, platform_settingsUpdateArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Platform_settings.
     * @param {platform_settingsDeleteManyArgs} args - Arguments to filter Platform_settings to delete.
     * @example
     * // Delete a few Platform_settings
     * const { count } = await prisma.platform_settings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends platform_settingsDeleteManyArgs>(args?: SelectSubset<T, platform_settingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Platform_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_settingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Platform_settings
     * const platform_settings = await prisma.platform_settings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends platform_settingsUpdateManyArgs>(args: SelectSubset<T, platform_settingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Platform_settings and returns the data updated in the database.
     * @param {platform_settingsUpdateManyAndReturnArgs} args - Arguments to update many Platform_settings.
     * @example
     * // Update many Platform_settings
     * const platform_settings = await prisma.platform_settings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Platform_settings and only return the `id`
     * const platform_settingsWithIdOnly = await prisma.platform_settings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends platform_settingsUpdateManyAndReturnArgs>(args: SelectSubset<T, platform_settingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Platform_settings.
     * @param {platform_settingsUpsertArgs} args - Arguments to update or create a Platform_settings.
     * @example
     * // Update or create a Platform_settings
     * const platform_settings = await prisma.platform_settings.upsert({
     *   create: {
     *     // ... data to create a Platform_settings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Platform_settings we want to update
     *   }
     * })
     */
    upsert<T extends platform_settingsUpsertArgs>(args: SelectSubset<T, platform_settingsUpsertArgs<ExtArgs>>): Prisma__platform_settingsClient<$Result.GetResult<Prisma.$platform_settingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Platform_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_settingsCountArgs} args - Arguments to filter Platform_settings to count.
     * @example
     * // Count the number of Platform_settings
     * const count = await prisma.platform_settings.count({
     *   where: {
     *     // ... the filter for the Platform_settings we want to count
     *   }
     * })
    **/
    count<T extends platform_settingsCountArgs>(
      args?: Subset<T, platform_settingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Platform_settingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Platform_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Platform_settingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Platform_settingsAggregateArgs>(args: Subset<T, Platform_settingsAggregateArgs>): Prisma.PrismaPromise<GetPlatform_settingsAggregateType<T>>

    /**
     * Group by Platform_settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {platform_settingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends platform_settingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: platform_settingsGroupByArgs['orderBy'] }
        : { orderBy?: platform_settingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, platform_settingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatform_settingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the platform_settings model
   */
  readonly fields: platform_settingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for platform_settings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__platform_settingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the platform_settings model
   */
  interface platform_settingsFieldRefs {
    readonly id: FieldRef<"platform_settings", 'String'>
    readonly tenant_base_domain: FieldRef<"platform_settings", 'String'>
    readonly alert_email: FieldRef<"platform_settings", 'String'>
    readonly rollup_schedule: FieldRef<"platform_settings", 'String'>
    readonly smtp_host: FieldRef<"platform_settings", 'String'>
    readonly smtp_port: FieldRef<"platform_settings", 'Int'>
    readonly smtp_user: FieldRef<"platform_settings", 'String'>
    readonly updated_at: FieldRef<"platform_settings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * platform_settings findUnique
   */
  export type platform_settingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * Filter, which platform_settings to fetch.
     */
    where: platform_settingsWhereUniqueInput
  }

  /**
   * platform_settings findUniqueOrThrow
   */
  export type platform_settingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * Filter, which platform_settings to fetch.
     */
    where: platform_settingsWhereUniqueInput
  }

  /**
   * platform_settings findFirst
   */
  export type platform_settingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * Filter, which platform_settings to fetch.
     */
    where?: platform_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_settings to fetch.
     */
    orderBy?: platform_settingsOrderByWithRelationInput | platform_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for platform_settings.
     */
    cursor?: platform_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of platform_settings.
     */
    distinct?: Platform_settingsScalarFieldEnum | Platform_settingsScalarFieldEnum[]
  }

  /**
   * platform_settings findFirstOrThrow
   */
  export type platform_settingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * Filter, which platform_settings to fetch.
     */
    where?: platform_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_settings to fetch.
     */
    orderBy?: platform_settingsOrderByWithRelationInput | platform_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for platform_settings.
     */
    cursor?: platform_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of platform_settings.
     */
    distinct?: Platform_settingsScalarFieldEnum | Platform_settingsScalarFieldEnum[]
  }

  /**
   * platform_settings findMany
   */
  export type platform_settingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * Filter, which platform_settings to fetch.
     */
    where?: platform_settingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of platform_settings to fetch.
     */
    orderBy?: platform_settingsOrderByWithRelationInput | platform_settingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing platform_settings.
     */
    cursor?: platform_settingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` platform_settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` platform_settings.
     */
    skip?: number
    distinct?: Platform_settingsScalarFieldEnum | Platform_settingsScalarFieldEnum[]
  }

  /**
   * platform_settings create
   */
  export type platform_settingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * The data needed to create a platform_settings.
     */
    data: XOR<platform_settingsCreateInput, platform_settingsUncheckedCreateInput>
  }

  /**
   * platform_settings createMany
   */
  export type platform_settingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many platform_settings.
     */
    data: platform_settingsCreateManyInput | platform_settingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * platform_settings createManyAndReturn
   */
  export type platform_settingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * The data used to create many platform_settings.
     */
    data: platform_settingsCreateManyInput | platform_settingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * platform_settings update
   */
  export type platform_settingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * The data needed to update a platform_settings.
     */
    data: XOR<platform_settingsUpdateInput, platform_settingsUncheckedUpdateInput>
    /**
     * Choose, which platform_settings to update.
     */
    where: platform_settingsWhereUniqueInput
  }

  /**
   * platform_settings updateMany
   */
  export type platform_settingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update platform_settings.
     */
    data: XOR<platform_settingsUpdateManyMutationInput, platform_settingsUncheckedUpdateManyInput>
    /**
     * Filter which platform_settings to update
     */
    where?: platform_settingsWhereInput
    /**
     * Limit how many platform_settings to update.
     */
    limit?: number
  }

  /**
   * platform_settings updateManyAndReturn
   */
  export type platform_settingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * The data used to update platform_settings.
     */
    data: XOR<platform_settingsUpdateManyMutationInput, platform_settingsUncheckedUpdateManyInput>
    /**
     * Filter which platform_settings to update
     */
    where?: platform_settingsWhereInput
    /**
     * Limit how many platform_settings to update.
     */
    limit?: number
  }

  /**
   * platform_settings upsert
   */
  export type platform_settingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * The filter to search for the platform_settings to update in case it exists.
     */
    where: platform_settingsWhereUniqueInput
    /**
     * In case the platform_settings found by the `where` argument doesn't exist, create a new platform_settings with this data.
     */
    create: XOR<platform_settingsCreateInput, platform_settingsUncheckedCreateInput>
    /**
     * In case the platform_settings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<platform_settingsUpdateInput, platform_settingsUncheckedUpdateInput>
  }

  /**
   * platform_settings delete
   */
  export type platform_settingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
    /**
     * Filter which platform_settings to delete.
     */
    where: platform_settingsWhereUniqueInput
  }

  /**
   * platform_settings deleteMany
   */
  export type platform_settingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which platform_settings to delete
     */
    where?: platform_settingsWhereInput
    /**
     * Limit how many platform_settings to delete.
     */
    limit?: number
  }

  /**
   * platform_settings without action
   */
  export type platform_settingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the platform_settings
     */
    select?: platform_settingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the platform_settings
     */
    omit?: platform_settingsOmit<ExtArgs> | null
  }


  /**
   * Model tenant_daily_rollups
   */

  export type AggregateTenant_daily_rollups = {
    _count: Tenant_daily_rollupsCountAggregateOutputType | null
    _avg: Tenant_daily_rollupsAvgAggregateOutputType | null
    _sum: Tenant_daily_rollupsSumAggregateOutputType | null
    _min: Tenant_daily_rollupsMinAggregateOutputType | null
    _max: Tenant_daily_rollupsMaxAggregateOutputType | null
  }

  export type Tenant_daily_rollupsAvgAggregateOutputType = {
    gross_sales: Decimal | null
    tax_collected: Decimal | null
    orders_count: number | null
    active_raffles: number | null
    failed_gra_events: number | null
  }

  export type Tenant_daily_rollupsSumAggregateOutputType = {
    gross_sales: Decimal | null
    tax_collected: Decimal | null
    orders_count: number | null
    active_raffles: number | null
    failed_gra_events: number | null
  }

  export type Tenant_daily_rollupsMinAggregateOutputType = {
    id: string | null
    operator_id: string | null
    date: Date | null
    gross_sales: Decimal | null
    tax_collected: Decimal | null
    orders_count: number | null
    active_raffles: number | null
    failed_gra_events: number | null
    created_at: Date | null
  }

  export type Tenant_daily_rollupsMaxAggregateOutputType = {
    id: string | null
    operator_id: string | null
    date: Date | null
    gross_sales: Decimal | null
    tax_collected: Decimal | null
    orders_count: number | null
    active_raffles: number | null
    failed_gra_events: number | null
    created_at: Date | null
  }

  export type Tenant_daily_rollupsCountAggregateOutputType = {
    id: number
    operator_id: number
    date: number
    gross_sales: number
    tax_collected: number
    orders_count: number
    active_raffles: number
    failed_gra_events: number
    created_at: number
    _all: number
  }


  export type Tenant_daily_rollupsAvgAggregateInputType = {
    gross_sales?: true
    tax_collected?: true
    orders_count?: true
    active_raffles?: true
    failed_gra_events?: true
  }

  export type Tenant_daily_rollupsSumAggregateInputType = {
    gross_sales?: true
    tax_collected?: true
    orders_count?: true
    active_raffles?: true
    failed_gra_events?: true
  }

  export type Tenant_daily_rollupsMinAggregateInputType = {
    id?: true
    operator_id?: true
    date?: true
    gross_sales?: true
    tax_collected?: true
    orders_count?: true
    active_raffles?: true
    failed_gra_events?: true
    created_at?: true
  }

  export type Tenant_daily_rollupsMaxAggregateInputType = {
    id?: true
    operator_id?: true
    date?: true
    gross_sales?: true
    tax_collected?: true
    orders_count?: true
    active_raffles?: true
    failed_gra_events?: true
    created_at?: true
  }

  export type Tenant_daily_rollupsCountAggregateInputType = {
    id?: true
    operator_id?: true
    date?: true
    gross_sales?: true
    tax_collected?: true
    orders_count?: true
    active_raffles?: true
    failed_gra_events?: true
    created_at?: true
    _all?: true
  }

  export type Tenant_daily_rollupsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tenant_daily_rollups to aggregate.
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_daily_rollups to fetch.
     */
    orderBy?: tenant_daily_rollupsOrderByWithRelationInput | tenant_daily_rollupsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tenant_daily_rollupsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_daily_rollups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_daily_rollups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tenant_daily_rollups
    **/
    _count?: true | Tenant_daily_rollupsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tenant_daily_rollupsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tenant_daily_rollupsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tenant_daily_rollupsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tenant_daily_rollupsMaxAggregateInputType
  }

  export type GetTenant_daily_rollupsAggregateType<T extends Tenant_daily_rollupsAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant_daily_rollups]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant_daily_rollups[P]>
      : GetScalarType<T[P], AggregateTenant_daily_rollups[P]>
  }




  export type tenant_daily_rollupsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tenant_daily_rollupsWhereInput
    orderBy?: tenant_daily_rollupsOrderByWithAggregationInput | tenant_daily_rollupsOrderByWithAggregationInput[]
    by: Tenant_daily_rollupsScalarFieldEnum[] | Tenant_daily_rollupsScalarFieldEnum
    having?: tenant_daily_rollupsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tenant_daily_rollupsCountAggregateInputType | true
    _avg?: Tenant_daily_rollupsAvgAggregateInputType
    _sum?: Tenant_daily_rollupsSumAggregateInputType
    _min?: Tenant_daily_rollupsMinAggregateInputType
    _max?: Tenant_daily_rollupsMaxAggregateInputType
  }

  export type Tenant_daily_rollupsGroupByOutputType = {
    id: string
    operator_id: string
    date: Date
    gross_sales: Decimal
    tax_collected: Decimal
    orders_count: number
    active_raffles: number
    failed_gra_events: number
    created_at: Date
    _count: Tenant_daily_rollupsCountAggregateOutputType | null
    _avg: Tenant_daily_rollupsAvgAggregateOutputType | null
    _sum: Tenant_daily_rollupsSumAggregateOutputType | null
    _min: Tenant_daily_rollupsMinAggregateOutputType | null
    _max: Tenant_daily_rollupsMaxAggregateOutputType | null
  }

  type GetTenant_daily_rollupsGroupByPayload<T extends tenant_daily_rollupsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tenant_daily_rollupsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tenant_daily_rollupsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tenant_daily_rollupsGroupByOutputType[P]>
            : GetScalarType<T[P], Tenant_daily_rollupsGroupByOutputType[P]>
        }
      >
    >


  export type tenant_daily_rollupsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    date?: boolean
    gross_sales?: boolean
    tax_collected?: boolean
    orders_count?: boolean
    active_raffles?: boolean
    failed_gra_events?: boolean
    created_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant_daily_rollups"]>

  export type tenant_daily_rollupsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    date?: boolean
    gross_sales?: boolean
    tax_collected?: boolean
    orders_count?: boolean
    active_raffles?: boolean
    failed_gra_events?: boolean
    created_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant_daily_rollups"]>

  export type tenant_daily_rollupsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operator_id?: boolean
    date?: boolean
    gross_sales?: boolean
    tax_collected?: boolean
    orders_count?: boolean
    active_raffles?: boolean
    failed_gra_events?: boolean
    created_at?: boolean
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant_daily_rollups"]>

  export type tenant_daily_rollupsSelectScalar = {
    id?: boolean
    operator_id?: boolean
    date?: boolean
    gross_sales?: boolean
    tax_collected?: boolean
    orders_count?: boolean
    active_raffles?: boolean
    failed_gra_events?: boolean
    created_at?: boolean
  }

  export type tenant_daily_rollupsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "operator_id" | "date" | "gross_sales" | "tax_collected" | "orders_count" | "active_raffles" | "failed_gra_events" | "created_at", ExtArgs["result"]["tenant_daily_rollups"]>
  export type tenant_daily_rollupsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type tenant_daily_rollupsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }
  export type tenant_daily_rollupsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operator?: boolean | operatorsDefaultArgs<ExtArgs>
  }

  export type $tenant_daily_rollupsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tenant_daily_rollups"
    objects: {
      operator: Prisma.$operatorsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      operator_id: string
      date: Date
      gross_sales: Prisma.Decimal
      tax_collected: Prisma.Decimal
      orders_count: number
      active_raffles: number
      failed_gra_events: number
      created_at: Date
    }, ExtArgs["result"]["tenant_daily_rollups"]>
    composites: {}
  }

  type tenant_daily_rollupsGetPayload<S extends boolean | null | undefined | tenant_daily_rollupsDefaultArgs> = $Result.GetResult<Prisma.$tenant_daily_rollupsPayload, S>

  type tenant_daily_rollupsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tenant_daily_rollupsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tenant_daily_rollupsCountAggregateInputType | true
    }

  export interface tenant_daily_rollupsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tenant_daily_rollups'], meta: { name: 'tenant_daily_rollups' } }
    /**
     * Find zero or one Tenant_daily_rollups that matches the filter.
     * @param {tenant_daily_rollupsFindUniqueArgs} args - Arguments to find a Tenant_daily_rollups
     * @example
     * // Get one Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tenant_daily_rollupsFindUniqueArgs>(args: SelectSubset<T, tenant_daily_rollupsFindUniqueArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant_daily_rollups that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tenant_daily_rollupsFindUniqueOrThrowArgs} args - Arguments to find a Tenant_daily_rollups
     * @example
     * // Get one Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tenant_daily_rollupsFindUniqueOrThrowArgs>(args: SelectSubset<T, tenant_daily_rollupsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant_daily_rollups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_daily_rollupsFindFirstArgs} args - Arguments to find a Tenant_daily_rollups
     * @example
     * // Get one Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tenant_daily_rollupsFindFirstArgs>(args?: SelectSubset<T, tenant_daily_rollupsFindFirstArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant_daily_rollups that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_daily_rollupsFindFirstOrThrowArgs} args - Arguments to find a Tenant_daily_rollups
     * @example
     * // Get one Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tenant_daily_rollupsFindFirstOrThrowArgs>(args?: SelectSubset<T, tenant_daily_rollupsFindFirstOrThrowArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenant_daily_rollups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_daily_rollupsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findMany()
     * 
     * // Get first 10 Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenant_daily_rollupsWithIdOnly = await prisma.tenant_daily_rollups.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends tenant_daily_rollupsFindManyArgs>(args?: SelectSubset<T, tenant_daily_rollupsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant_daily_rollups.
     * @param {tenant_daily_rollupsCreateArgs} args - Arguments to create a Tenant_daily_rollups.
     * @example
     * // Create one Tenant_daily_rollups
     * const Tenant_daily_rollups = await prisma.tenant_daily_rollups.create({
     *   data: {
     *     // ... data to create a Tenant_daily_rollups
     *   }
     * })
     * 
     */
    create<T extends tenant_daily_rollupsCreateArgs>(args: SelectSubset<T, tenant_daily_rollupsCreateArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenant_daily_rollups.
     * @param {tenant_daily_rollupsCreateManyArgs} args - Arguments to create many Tenant_daily_rollups.
     * @example
     * // Create many Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tenant_daily_rollupsCreateManyArgs>(args?: SelectSubset<T, tenant_daily_rollupsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenant_daily_rollups and returns the data saved in the database.
     * @param {tenant_daily_rollupsCreateManyAndReturnArgs} args - Arguments to create many Tenant_daily_rollups.
     * @example
     * // Create many Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenant_daily_rollups and only return the `id`
     * const tenant_daily_rollupsWithIdOnly = await prisma.tenant_daily_rollups.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends tenant_daily_rollupsCreateManyAndReturnArgs>(args?: SelectSubset<T, tenant_daily_rollupsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant_daily_rollups.
     * @param {tenant_daily_rollupsDeleteArgs} args - Arguments to delete one Tenant_daily_rollups.
     * @example
     * // Delete one Tenant_daily_rollups
     * const Tenant_daily_rollups = await prisma.tenant_daily_rollups.delete({
     *   where: {
     *     // ... filter to delete one Tenant_daily_rollups
     *   }
     * })
     * 
     */
    delete<T extends tenant_daily_rollupsDeleteArgs>(args: SelectSubset<T, tenant_daily_rollupsDeleteArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant_daily_rollups.
     * @param {tenant_daily_rollupsUpdateArgs} args - Arguments to update one Tenant_daily_rollups.
     * @example
     * // Update one Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tenant_daily_rollupsUpdateArgs>(args: SelectSubset<T, tenant_daily_rollupsUpdateArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenant_daily_rollups.
     * @param {tenant_daily_rollupsDeleteManyArgs} args - Arguments to filter Tenant_daily_rollups to delete.
     * @example
     * // Delete a few Tenant_daily_rollups
     * const { count } = await prisma.tenant_daily_rollups.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tenant_daily_rollupsDeleteManyArgs>(args?: SelectSubset<T, tenant_daily_rollupsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenant_daily_rollups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_daily_rollupsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tenant_daily_rollupsUpdateManyArgs>(args: SelectSubset<T, tenant_daily_rollupsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenant_daily_rollups and returns the data updated in the database.
     * @param {tenant_daily_rollupsUpdateManyAndReturnArgs} args - Arguments to update many Tenant_daily_rollups.
     * @example
     * // Update many Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenant_daily_rollups and only return the `id`
     * const tenant_daily_rollupsWithIdOnly = await prisma.tenant_daily_rollups.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends tenant_daily_rollupsUpdateManyAndReturnArgs>(args: SelectSubset<T, tenant_daily_rollupsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant_daily_rollups.
     * @param {tenant_daily_rollupsUpsertArgs} args - Arguments to update or create a Tenant_daily_rollups.
     * @example
     * // Update or create a Tenant_daily_rollups
     * const tenant_daily_rollups = await prisma.tenant_daily_rollups.upsert({
     *   create: {
     *     // ... data to create a Tenant_daily_rollups
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant_daily_rollups we want to update
     *   }
     * })
     */
    upsert<T extends tenant_daily_rollupsUpsertArgs>(args: SelectSubset<T, tenant_daily_rollupsUpsertArgs<ExtArgs>>): Prisma__tenant_daily_rollupsClient<$Result.GetResult<Prisma.$tenant_daily_rollupsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenant_daily_rollups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_daily_rollupsCountArgs} args - Arguments to filter Tenant_daily_rollups to count.
     * @example
     * // Count the number of Tenant_daily_rollups
     * const count = await prisma.tenant_daily_rollups.count({
     *   where: {
     *     // ... the filter for the Tenant_daily_rollups we want to count
     *   }
     * })
    **/
    count<T extends tenant_daily_rollupsCountArgs>(
      args?: Subset<T, tenant_daily_rollupsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tenant_daily_rollupsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant_daily_rollups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tenant_daily_rollupsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Tenant_daily_rollupsAggregateArgs>(args: Subset<T, Tenant_daily_rollupsAggregateArgs>): Prisma.PrismaPromise<GetTenant_daily_rollupsAggregateType<T>>

    /**
     * Group by Tenant_daily_rollups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenant_daily_rollupsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends tenant_daily_rollupsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tenant_daily_rollupsGroupByArgs['orderBy'] }
        : { orderBy?: tenant_daily_rollupsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, tenant_daily_rollupsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenant_daily_rollupsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tenant_daily_rollups model
   */
  readonly fields: tenant_daily_rollupsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tenant_daily_rollups.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tenant_daily_rollupsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    operator<T extends operatorsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, operatorsDefaultArgs<ExtArgs>>): Prisma__operatorsClient<$Result.GetResult<Prisma.$operatorsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the tenant_daily_rollups model
   */
  interface tenant_daily_rollupsFieldRefs {
    readonly id: FieldRef<"tenant_daily_rollups", 'String'>
    readonly operator_id: FieldRef<"tenant_daily_rollups", 'String'>
    readonly date: FieldRef<"tenant_daily_rollups", 'DateTime'>
    readonly gross_sales: FieldRef<"tenant_daily_rollups", 'Decimal'>
    readonly tax_collected: FieldRef<"tenant_daily_rollups", 'Decimal'>
    readonly orders_count: FieldRef<"tenant_daily_rollups", 'Int'>
    readonly active_raffles: FieldRef<"tenant_daily_rollups", 'Int'>
    readonly failed_gra_events: FieldRef<"tenant_daily_rollups", 'Int'>
    readonly created_at: FieldRef<"tenant_daily_rollups", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tenant_daily_rollups findUnique
   */
  export type tenant_daily_rollupsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * Filter, which tenant_daily_rollups to fetch.
     */
    where: tenant_daily_rollupsWhereUniqueInput
  }

  /**
   * tenant_daily_rollups findUniqueOrThrow
   */
  export type tenant_daily_rollupsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * Filter, which tenant_daily_rollups to fetch.
     */
    where: tenant_daily_rollupsWhereUniqueInput
  }

  /**
   * tenant_daily_rollups findFirst
   */
  export type tenant_daily_rollupsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * Filter, which tenant_daily_rollups to fetch.
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_daily_rollups to fetch.
     */
    orderBy?: tenant_daily_rollupsOrderByWithRelationInput | tenant_daily_rollupsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tenant_daily_rollups.
     */
    cursor?: tenant_daily_rollupsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_daily_rollups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_daily_rollups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tenant_daily_rollups.
     */
    distinct?: Tenant_daily_rollupsScalarFieldEnum | Tenant_daily_rollupsScalarFieldEnum[]
  }

  /**
   * tenant_daily_rollups findFirstOrThrow
   */
  export type tenant_daily_rollupsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * Filter, which tenant_daily_rollups to fetch.
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_daily_rollups to fetch.
     */
    orderBy?: tenant_daily_rollupsOrderByWithRelationInput | tenant_daily_rollupsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tenant_daily_rollups.
     */
    cursor?: tenant_daily_rollupsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_daily_rollups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_daily_rollups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tenant_daily_rollups.
     */
    distinct?: Tenant_daily_rollupsScalarFieldEnum | Tenant_daily_rollupsScalarFieldEnum[]
  }

  /**
   * tenant_daily_rollups findMany
   */
  export type tenant_daily_rollupsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * Filter, which tenant_daily_rollups to fetch.
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenant_daily_rollups to fetch.
     */
    orderBy?: tenant_daily_rollupsOrderByWithRelationInput | tenant_daily_rollupsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tenant_daily_rollups.
     */
    cursor?: tenant_daily_rollupsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenant_daily_rollups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenant_daily_rollups.
     */
    skip?: number
    distinct?: Tenant_daily_rollupsScalarFieldEnum | Tenant_daily_rollupsScalarFieldEnum[]
  }

  /**
   * tenant_daily_rollups create
   */
  export type tenant_daily_rollupsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * The data needed to create a tenant_daily_rollups.
     */
    data: XOR<tenant_daily_rollupsCreateInput, tenant_daily_rollupsUncheckedCreateInput>
  }

  /**
   * tenant_daily_rollups createMany
   */
  export type tenant_daily_rollupsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tenant_daily_rollups.
     */
    data: tenant_daily_rollupsCreateManyInput | tenant_daily_rollupsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tenant_daily_rollups createManyAndReturn
   */
  export type tenant_daily_rollupsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * The data used to create many tenant_daily_rollups.
     */
    data: tenant_daily_rollupsCreateManyInput | tenant_daily_rollupsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * tenant_daily_rollups update
   */
  export type tenant_daily_rollupsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * The data needed to update a tenant_daily_rollups.
     */
    data: XOR<tenant_daily_rollupsUpdateInput, tenant_daily_rollupsUncheckedUpdateInput>
    /**
     * Choose, which tenant_daily_rollups to update.
     */
    where: tenant_daily_rollupsWhereUniqueInput
  }

  /**
   * tenant_daily_rollups updateMany
   */
  export type tenant_daily_rollupsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tenant_daily_rollups.
     */
    data: XOR<tenant_daily_rollupsUpdateManyMutationInput, tenant_daily_rollupsUncheckedUpdateManyInput>
    /**
     * Filter which tenant_daily_rollups to update
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * Limit how many tenant_daily_rollups to update.
     */
    limit?: number
  }

  /**
   * tenant_daily_rollups updateManyAndReturn
   */
  export type tenant_daily_rollupsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * The data used to update tenant_daily_rollups.
     */
    data: XOR<tenant_daily_rollupsUpdateManyMutationInput, tenant_daily_rollupsUncheckedUpdateManyInput>
    /**
     * Filter which tenant_daily_rollups to update
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * Limit how many tenant_daily_rollups to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * tenant_daily_rollups upsert
   */
  export type tenant_daily_rollupsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * The filter to search for the tenant_daily_rollups to update in case it exists.
     */
    where: tenant_daily_rollupsWhereUniqueInput
    /**
     * In case the tenant_daily_rollups found by the `where` argument doesn't exist, create a new tenant_daily_rollups with this data.
     */
    create: XOR<tenant_daily_rollupsCreateInput, tenant_daily_rollupsUncheckedCreateInput>
    /**
     * In case the tenant_daily_rollups was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tenant_daily_rollupsUpdateInput, tenant_daily_rollupsUncheckedUpdateInput>
  }

  /**
   * tenant_daily_rollups delete
   */
  export type tenant_daily_rollupsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
    /**
     * Filter which tenant_daily_rollups to delete.
     */
    where: tenant_daily_rollupsWhereUniqueInput
  }

  /**
   * tenant_daily_rollups deleteMany
   */
  export type tenant_daily_rollupsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tenant_daily_rollups to delete
     */
    where?: tenant_daily_rollupsWhereInput
    /**
     * Limit how many tenant_daily_rollups to delete.
     */
    limit?: number
  }

  /**
   * tenant_daily_rollups without action
   */
  export type tenant_daily_rollupsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenant_daily_rollups
     */
    select?: tenant_daily_rollupsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenant_daily_rollups
     */
    omit?: tenant_daily_rollupsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenant_daily_rollupsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OperatorsScalarFieldEnum: {
    id: 'id',
    gra_registry_id: 'gra_registry_id',
    name: 'name',
    slug: 'slug',
    status: 'status',
    licence_number: 'licence_number',
    default_tax_rate: 'default_tax_rate',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type OperatorsScalarFieldEnum = (typeof OperatorsScalarFieldEnum)[keyof typeof OperatorsScalarFieldEnum]


  export const Tenant_databasesScalarFieldEnum: {
    id: 'id',
    operator_id: 'operator_id',
    database_name: 'database_name',
    database_host: 'database_host',
    database_port: 'database_port',
    database_user: 'database_user',
    database_password_encrypted: 'database_password_encrypted',
    connection_url_encrypted: 'connection_url_encrypted',
    schema_version: 'schema_version',
    provisioned_at: 'provisioned_at',
    provision_error: 'provision_error',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Tenant_databasesScalarFieldEnum = (typeof Tenant_databasesScalarFieldEnum)[keyof typeof Tenant_databasesScalarFieldEnum]


  export const Operator_domainsScalarFieldEnum: {
    id: 'id',
    operator_id: 'operator_id',
    hostname: 'hostname',
    domain_type: 'domain_type',
    verification_status: 'verification_status',
    ssl_status: 'ssl_status',
    is_primary: 'is_primary',
    created_at: 'created_at'
  };

  export type Operator_domainsScalarFieldEnum = (typeof Operator_domainsScalarFieldEnum)[keyof typeof Operator_domainsScalarFieldEnum]


  export const Operator_settingsScalarFieldEnum: {
    id: 'id',
    operator_id: 'operator_id',
    logo_url: 'logo_url',
    primary_color: 'primary_color',
    support_email: 'support_email',
    footer_licence_text: 'footer_licence_text',
    social_links: 'social_links',
    gra_api_key_encrypted: 'gra_api_key_encrypted',
    gra_hmac_secret_encrypted: 'gra_hmac_secret_encrypted',
    gra_last_heartbeat_at: 'gra_last_heartbeat_at',
    gra_last_heartbeat_status: 'gra_last_heartbeat_status',
    gra_last_heartbeat_error: 'gra_last_heartbeat_error',
    payment_merchant_ref_encrypted: 'payment_merchant_ref_encrypted',
    feature_flags: 'feature_flags',
    ga4_measurement_id: 'ga4_measurement_id',
    facebook_pixel_id: 'facebook_pixel_id',
    analytics_enabled: 'analytics_enabled',
    faq_text: 'faq_text',
    terms_text: 'terms_text',
    privacy_text: 'privacy_text',
    legal_name: 'legal_name',
    trading_name: 'trading_name',
    registration_number: 'registration_number',
    kra_pin: 'kra_pin',
    beneficial_owner: 'beneficial_owner',
    business_email: 'business_email',
    business_phone: 'business_phone',
    county: 'county',
    region: 'region',
    website: 'website',
    legal_profile_locked_at: 'legal_profile_locked_at',
    gra_application_status: 'gra_application_status',
    gra_application_id: 'gra_application_id',
    gra_application_submitted_at: 'gra_application_submitted_at',
    gra_approved_at: 'gra_approved_at',
    gra_rejection_reason: 'gra_rejection_reason',
    provision_owner_email: 'provision_owner_email',
    provision_owner_password_encrypted: 'provision_owner_password_encrypted',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Operator_settingsScalarFieldEnum = (typeof Operator_settingsScalarFieldEnum)[keyof typeof Operator_settingsScalarFieldEnum]


  export const Platform_usersScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password_hash: 'password_hash',
    role: 'role',
    mfa_enabled: 'mfa_enabled',
    mfa_secret_encrypted: 'mfa_secret_encrypted',
    last_login_at: 'last_login_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Platform_usersScalarFieldEnum = (typeof Platform_usersScalarFieldEnum)[keyof typeof Platform_usersScalarFieldEnum]


  export const Platform_audit_logsScalarFieldEnum: {
    id: 'id',
    platform_user_id: 'platform_user_id',
    operator_id: 'operator_id',
    action: 'action',
    entity_type: 'entity_type',
    entity_id: 'entity_id',
    metadata: 'metadata',
    created_at: 'created_at'
  };

  export type Platform_audit_logsScalarFieldEnum = (typeof Platform_audit_logsScalarFieldEnum)[keyof typeof Platform_audit_logsScalarFieldEnum]


  export const Platform_settingsScalarFieldEnum: {
    id: 'id',
    tenant_base_domain: 'tenant_base_domain',
    alert_email: 'alert_email',
    rollup_schedule: 'rollup_schedule',
    smtp_host: 'smtp_host',
    smtp_port: 'smtp_port',
    smtp_user: 'smtp_user',
    updated_at: 'updated_at'
  };

  export type Platform_settingsScalarFieldEnum = (typeof Platform_settingsScalarFieldEnum)[keyof typeof Platform_settingsScalarFieldEnum]


  export const Tenant_daily_rollupsScalarFieldEnum: {
    id: 'id',
    operator_id: 'operator_id',
    date: 'date',
    gross_sales: 'gross_sales',
    tax_collected: 'tax_collected',
    orders_count: 'orders_count',
    active_raffles: 'active_raffles',
    failed_gra_events: 'failed_gra_events',
    created_at: 'created_at'
  };

  export type Tenant_daily_rollupsScalarFieldEnum = (typeof Tenant_daily_rollupsScalarFieldEnum)[keyof typeof Tenant_daily_rollupsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'operator_status'
   */
  export type Enumoperator_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'operator_status'>
    


  /**
   * Reference to a field of type 'operator_status[]'
   */
  export type ListEnumoperator_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'operator_status[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'tenant_database_status'
   */
  export type Enumtenant_database_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'tenant_database_status'>
    


  /**
   * Reference to a field of type 'tenant_database_status[]'
   */
  export type ListEnumtenant_database_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'tenant_database_status[]'>
    


  /**
   * Reference to a field of type 'domain_type'
   */
  export type Enumdomain_typeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'domain_type'>
    


  /**
   * Reference to a field of type 'domain_type[]'
   */
  export type ListEnumdomain_typeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'domain_type[]'>
    


  /**
   * Reference to a field of type 'domain_verification_status'
   */
  export type Enumdomain_verification_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'domain_verification_status'>
    


  /**
   * Reference to a field of type 'domain_verification_status[]'
   */
  export type ListEnumdomain_verification_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'domain_verification_status[]'>
    


  /**
   * Reference to a field of type 'ssl_status'
   */
  export type Enumssl_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ssl_status'>
    


  /**
   * Reference to a field of type 'ssl_status[]'
   */
  export type ListEnumssl_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ssl_status[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'gra_application_status'
   */
  export type Enumgra_application_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'gra_application_status'>
    


  /**
   * Reference to a field of type 'gra_application_status[]'
   */
  export type ListEnumgra_application_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'gra_application_status[]'>
    


  /**
   * Reference to a field of type 'platform_role'
   */
  export type Enumplatform_roleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'platform_role'>
    


  /**
   * Reference to a field of type 'platform_role[]'
   */
  export type ListEnumplatform_roleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'platform_role[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type operatorsWhereInput = {
    AND?: operatorsWhereInput | operatorsWhereInput[]
    OR?: operatorsWhereInput[]
    NOT?: operatorsWhereInput | operatorsWhereInput[]
    id?: UuidFilter<"operators"> | string
    gra_registry_id?: StringFilter<"operators"> | string
    name?: StringFilter<"operators"> | string
    slug?: StringFilter<"operators"> | string
    status?: Enumoperator_statusFilter<"operators"> | $Enums.operator_status
    licence_number?: StringNullableFilter<"operators"> | string | null
    default_tax_rate?: DecimalFilter<"operators"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"operators"> | Date | string
    updated_at?: DateTimeFilter<"operators"> | Date | string
    tenant_database?: XOR<Tenant_databasesNullableScalarRelationFilter, tenant_databasesWhereInput> | null
    domains?: Operator_domainsListRelationFilter
    settings?: XOR<Operator_settingsNullableScalarRelationFilter, operator_settingsWhereInput> | null
    audit_logs?: Platform_audit_logsListRelationFilter
    rollups?: Tenant_daily_rollupsListRelationFilter
  }

  export type operatorsOrderByWithRelationInput = {
    id?: SortOrder
    gra_registry_id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    licence_number?: SortOrderInput | SortOrder
    default_tax_rate?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant_database?: tenant_databasesOrderByWithRelationInput
    domains?: operator_domainsOrderByRelationAggregateInput
    settings?: operator_settingsOrderByWithRelationInput
    audit_logs?: platform_audit_logsOrderByRelationAggregateInput
    rollups?: tenant_daily_rollupsOrderByRelationAggregateInput
  }

  export type operatorsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    gra_registry_id?: string
    slug?: string
    AND?: operatorsWhereInput | operatorsWhereInput[]
    OR?: operatorsWhereInput[]
    NOT?: operatorsWhereInput | operatorsWhereInput[]
    name?: StringFilter<"operators"> | string
    status?: Enumoperator_statusFilter<"operators"> | $Enums.operator_status
    licence_number?: StringNullableFilter<"operators"> | string | null
    default_tax_rate?: DecimalFilter<"operators"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"operators"> | Date | string
    updated_at?: DateTimeFilter<"operators"> | Date | string
    tenant_database?: XOR<Tenant_databasesNullableScalarRelationFilter, tenant_databasesWhereInput> | null
    domains?: Operator_domainsListRelationFilter
    settings?: XOR<Operator_settingsNullableScalarRelationFilter, operator_settingsWhereInput> | null
    audit_logs?: Platform_audit_logsListRelationFilter
    rollups?: Tenant_daily_rollupsListRelationFilter
  }, "id" | "gra_registry_id" | "slug">

  export type operatorsOrderByWithAggregationInput = {
    id?: SortOrder
    gra_registry_id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    licence_number?: SortOrderInput | SortOrder
    default_tax_rate?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: operatorsCountOrderByAggregateInput
    _avg?: operatorsAvgOrderByAggregateInput
    _max?: operatorsMaxOrderByAggregateInput
    _min?: operatorsMinOrderByAggregateInput
    _sum?: operatorsSumOrderByAggregateInput
  }

  export type operatorsScalarWhereWithAggregatesInput = {
    AND?: operatorsScalarWhereWithAggregatesInput | operatorsScalarWhereWithAggregatesInput[]
    OR?: operatorsScalarWhereWithAggregatesInput[]
    NOT?: operatorsScalarWhereWithAggregatesInput | operatorsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"operators"> | string
    gra_registry_id?: StringWithAggregatesFilter<"operators"> | string
    name?: StringWithAggregatesFilter<"operators"> | string
    slug?: StringWithAggregatesFilter<"operators"> | string
    status?: Enumoperator_statusWithAggregatesFilter<"operators"> | $Enums.operator_status
    licence_number?: StringNullableWithAggregatesFilter<"operators"> | string | null
    default_tax_rate?: DecimalWithAggregatesFilter<"operators"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"operators"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"operators"> | Date | string
  }

  export type tenant_databasesWhereInput = {
    AND?: tenant_databasesWhereInput | tenant_databasesWhereInput[]
    OR?: tenant_databasesWhereInput[]
    NOT?: tenant_databasesWhereInput | tenant_databasesWhereInput[]
    id?: UuidFilter<"tenant_databases"> | string
    operator_id?: UuidFilter<"tenant_databases"> | string
    database_name?: StringFilter<"tenant_databases"> | string
    database_host?: StringFilter<"tenant_databases"> | string
    database_port?: IntFilter<"tenant_databases"> | number
    database_user?: StringFilter<"tenant_databases"> | string
    database_password_encrypted?: StringFilter<"tenant_databases"> | string
    connection_url_encrypted?: StringFilter<"tenant_databases"> | string
    schema_version?: StringFilter<"tenant_databases"> | string
    provisioned_at?: DateTimeNullableFilter<"tenant_databases"> | Date | string | null
    provision_error?: StringNullableFilter<"tenant_databases"> | string | null
    status?: Enumtenant_database_statusFilter<"tenant_databases"> | $Enums.tenant_database_status
    created_at?: DateTimeFilter<"tenant_databases"> | Date | string
    updated_at?: DateTimeFilter<"tenant_databases"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }

  export type tenant_databasesOrderByWithRelationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    database_name?: SortOrder
    database_host?: SortOrder
    database_port?: SortOrder
    database_user?: SortOrder
    database_password_encrypted?: SortOrder
    connection_url_encrypted?: SortOrder
    schema_version?: SortOrder
    provisioned_at?: SortOrderInput | SortOrder
    provision_error?: SortOrderInput | SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    operator?: operatorsOrderByWithRelationInput
  }

  export type tenant_databasesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    operator_id?: string
    AND?: tenant_databasesWhereInput | tenant_databasesWhereInput[]
    OR?: tenant_databasesWhereInput[]
    NOT?: tenant_databasesWhereInput | tenant_databasesWhereInput[]
    database_name?: StringFilter<"tenant_databases"> | string
    database_host?: StringFilter<"tenant_databases"> | string
    database_port?: IntFilter<"tenant_databases"> | number
    database_user?: StringFilter<"tenant_databases"> | string
    database_password_encrypted?: StringFilter<"tenant_databases"> | string
    connection_url_encrypted?: StringFilter<"tenant_databases"> | string
    schema_version?: StringFilter<"tenant_databases"> | string
    provisioned_at?: DateTimeNullableFilter<"tenant_databases"> | Date | string | null
    provision_error?: StringNullableFilter<"tenant_databases"> | string | null
    status?: Enumtenant_database_statusFilter<"tenant_databases"> | $Enums.tenant_database_status
    created_at?: DateTimeFilter<"tenant_databases"> | Date | string
    updated_at?: DateTimeFilter<"tenant_databases"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }, "id" | "operator_id">

  export type tenant_databasesOrderByWithAggregationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    database_name?: SortOrder
    database_host?: SortOrder
    database_port?: SortOrder
    database_user?: SortOrder
    database_password_encrypted?: SortOrder
    connection_url_encrypted?: SortOrder
    schema_version?: SortOrder
    provisioned_at?: SortOrderInput | SortOrder
    provision_error?: SortOrderInput | SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: tenant_databasesCountOrderByAggregateInput
    _avg?: tenant_databasesAvgOrderByAggregateInput
    _max?: tenant_databasesMaxOrderByAggregateInput
    _min?: tenant_databasesMinOrderByAggregateInput
    _sum?: tenant_databasesSumOrderByAggregateInput
  }

  export type tenant_databasesScalarWhereWithAggregatesInput = {
    AND?: tenant_databasesScalarWhereWithAggregatesInput | tenant_databasesScalarWhereWithAggregatesInput[]
    OR?: tenant_databasesScalarWhereWithAggregatesInput[]
    NOT?: tenant_databasesScalarWhereWithAggregatesInput | tenant_databasesScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"tenant_databases"> | string
    operator_id?: UuidWithAggregatesFilter<"tenant_databases"> | string
    database_name?: StringWithAggregatesFilter<"tenant_databases"> | string
    database_host?: StringWithAggregatesFilter<"tenant_databases"> | string
    database_port?: IntWithAggregatesFilter<"tenant_databases"> | number
    database_user?: StringWithAggregatesFilter<"tenant_databases"> | string
    database_password_encrypted?: StringWithAggregatesFilter<"tenant_databases"> | string
    connection_url_encrypted?: StringWithAggregatesFilter<"tenant_databases"> | string
    schema_version?: StringWithAggregatesFilter<"tenant_databases"> | string
    provisioned_at?: DateTimeNullableWithAggregatesFilter<"tenant_databases"> | Date | string | null
    provision_error?: StringNullableWithAggregatesFilter<"tenant_databases"> | string | null
    status?: Enumtenant_database_statusWithAggregatesFilter<"tenant_databases"> | $Enums.tenant_database_status
    created_at?: DateTimeWithAggregatesFilter<"tenant_databases"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"tenant_databases"> | Date | string
  }

  export type operator_domainsWhereInput = {
    AND?: operator_domainsWhereInput | operator_domainsWhereInput[]
    OR?: operator_domainsWhereInput[]
    NOT?: operator_domainsWhereInput | operator_domainsWhereInput[]
    id?: UuidFilter<"operator_domains"> | string
    operator_id?: UuidFilter<"operator_domains"> | string
    hostname?: StringFilter<"operator_domains"> | string
    domain_type?: Enumdomain_typeFilter<"operator_domains"> | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFilter<"operator_domains"> | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFilter<"operator_domains"> | $Enums.ssl_status
    is_primary?: BoolFilter<"operator_domains"> | boolean
    created_at?: DateTimeFilter<"operator_domains"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }

  export type operator_domainsOrderByWithRelationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    hostname?: SortOrder
    domain_type?: SortOrder
    verification_status?: SortOrder
    ssl_status?: SortOrder
    is_primary?: SortOrder
    created_at?: SortOrder
    operator?: operatorsOrderByWithRelationInput
  }

  export type operator_domainsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    hostname?: string
    AND?: operator_domainsWhereInput | operator_domainsWhereInput[]
    OR?: operator_domainsWhereInput[]
    NOT?: operator_domainsWhereInput | operator_domainsWhereInput[]
    operator_id?: UuidFilter<"operator_domains"> | string
    domain_type?: Enumdomain_typeFilter<"operator_domains"> | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFilter<"operator_domains"> | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFilter<"operator_domains"> | $Enums.ssl_status
    is_primary?: BoolFilter<"operator_domains"> | boolean
    created_at?: DateTimeFilter<"operator_domains"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }, "id" | "hostname">

  export type operator_domainsOrderByWithAggregationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    hostname?: SortOrder
    domain_type?: SortOrder
    verification_status?: SortOrder
    ssl_status?: SortOrder
    is_primary?: SortOrder
    created_at?: SortOrder
    _count?: operator_domainsCountOrderByAggregateInput
    _max?: operator_domainsMaxOrderByAggregateInput
    _min?: operator_domainsMinOrderByAggregateInput
  }

  export type operator_domainsScalarWhereWithAggregatesInput = {
    AND?: operator_domainsScalarWhereWithAggregatesInput | operator_domainsScalarWhereWithAggregatesInput[]
    OR?: operator_domainsScalarWhereWithAggregatesInput[]
    NOT?: operator_domainsScalarWhereWithAggregatesInput | operator_domainsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"operator_domains"> | string
    operator_id?: UuidWithAggregatesFilter<"operator_domains"> | string
    hostname?: StringWithAggregatesFilter<"operator_domains"> | string
    domain_type?: Enumdomain_typeWithAggregatesFilter<"operator_domains"> | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusWithAggregatesFilter<"operator_domains"> | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusWithAggregatesFilter<"operator_domains"> | $Enums.ssl_status
    is_primary?: BoolWithAggregatesFilter<"operator_domains"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"operator_domains"> | Date | string
  }

  export type operator_settingsWhereInput = {
    AND?: operator_settingsWhereInput | operator_settingsWhereInput[]
    OR?: operator_settingsWhereInput[]
    NOT?: operator_settingsWhereInput | operator_settingsWhereInput[]
    id?: UuidFilter<"operator_settings"> | string
    operator_id?: UuidFilter<"operator_settings"> | string
    logo_url?: StringNullableFilter<"operator_settings"> | string | null
    primary_color?: StringNullableFilter<"operator_settings"> | string | null
    support_email?: StringNullableFilter<"operator_settings"> | string | null
    footer_licence_text?: StringNullableFilter<"operator_settings"> | string | null
    social_links?: JsonNullableFilter<"operator_settings">
    gra_api_key_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    gra_hmac_secret_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    gra_last_heartbeat_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_last_heartbeat_status?: StringNullableFilter<"operator_settings"> | string | null
    gra_last_heartbeat_error?: StringNullableFilter<"operator_settings"> | string | null
    payment_merchant_ref_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    feature_flags?: JsonFilter<"operator_settings">
    ga4_measurement_id?: StringNullableFilter<"operator_settings"> | string | null
    facebook_pixel_id?: StringNullableFilter<"operator_settings"> | string | null
    analytics_enabled?: BoolFilter<"operator_settings"> | boolean
    faq_text?: StringNullableFilter<"operator_settings"> | string | null
    terms_text?: StringNullableFilter<"operator_settings"> | string | null
    privacy_text?: StringNullableFilter<"operator_settings"> | string | null
    legal_name?: StringNullableFilter<"operator_settings"> | string | null
    trading_name?: StringNullableFilter<"operator_settings"> | string | null
    registration_number?: StringNullableFilter<"operator_settings"> | string | null
    kra_pin?: StringNullableFilter<"operator_settings"> | string | null
    beneficial_owner?: StringNullableFilter<"operator_settings"> | string | null
    business_email?: StringNullableFilter<"operator_settings"> | string | null
    business_phone?: StringNullableFilter<"operator_settings"> | string | null
    county?: StringNullableFilter<"operator_settings"> | string | null
    region?: StringNullableFilter<"operator_settings"> | string | null
    website?: StringNullableFilter<"operator_settings"> | string | null
    legal_profile_locked_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_application_status?: Enumgra_application_statusFilter<"operator_settings"> | $Enums.gra_application_status
    gra_application_id?: UuidNullableFilter<"operator_settings"> | string | null
    gra_application_submitted_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_approved_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_rejection_reason?: StringNullableFilter<"operator_settings"> | string | null
    provision_owner_email?: StringNullableFilter<"operator_settings"> | string | null
    provision_owner_password_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    created_at?: DateTimeFilter<"operator_settings"> | Date | string
    updated_at?: DateTimeFilter<"operator_settings"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }

  export type operator_settingsOrderByWithRelationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    logo_url?: SortOrderInput | SortOrder
    primary_color?: SortOrderInput | SortOrder
    support_email?: SortOrderInput | SortOrder
    footer_licence_text?: SortOrderInput | SortOrder
    social_links?: SortOrderInput | SortOrder
    gra_api_key_encrypted?: SortOrderInput | SortOrder
    gra_hmac_secret_encrypted?: SortOrderInput | SortOrder
    gra_last_heartbeat_at?: SortOrderInput | SortOrder
    gra_last_heartbeat_status?: SortOrderInput | SortOrder
    gra_last_heartbeat_error?: SortOrderInput | SortOrder
    payment_merchant_ref_encrypted?: SortOrderInput | SortOrder
    feature_flags?: SortOrder
    ga4_measurement_id?: SortOrderInput | SortOrder
    facebook_pixel_id?: SortOrderInput | SortOrder
    analytics_enabled?: SortOrder
    faq_text?: SortOrderInput | SortOrder
    terms_text?: SortOrderInput | SortOrder
    privacy_text?: SortOrderInput | SortOrder
    legal_name?: SortOrderInput | SortOrder
    trading_name?: SortOrderInput | SortOrder
    registration_number?: SortOrderInput | SortOrder
    kra_pin?: SortOrderInput | SortOrder
    beneficial_owner?: SortOrderInput | SortOrder
    business_email?: SortOrderInput | SortOrder
    business_phone?: SortOrderInput | SortOrder
    county?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    legal_profile_locked_at?: SortOrderInput | SortOrder
    gra_application_status?: SortOrder
    gra_application_id?: SortOrderInput | SortOrder
    gra_application_submitted_at?: SortOrderInput | SortOrder
    gra_approved_at?: SortOrderInput | SortOrder
    gra_rejection_reason?: SortOrderInput | SortOrder
    provision_owner_email?: SortOrderInput | SortOrder
    provision_owner_password_encrypted?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    operator?: operatorsOrderByWithRelationInput
  }

  export type operator_settingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    operator_id?: string
    AND?: operator_settingsWhereInput | operator_settingsWhereInput[]
    OR?: operator_settingsWhereInput[]
    NOT?: operator_settingsWhereInput | operator_settingsWhereInput[]
    logo_url?: StringNullableFilter<"operator_settings"> | string | null
    primary_color?: StringNullableFilter<"operator_settings"> | string | null
    support_email?: StringNullableFilter<"operator_settings"> | string | null
    footer_licence_text?: StringNullableFilter<"operator_settings"> | string | null
    social_links?: JsonNullableFilter<"operator_settings">
    gra_api_key_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    gra_hmac_secret_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    gra_last_heartbeat_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_last_heartbeat_status?: StringNullableFilter<"operator_settings"> | string | null
    gra_last_heartbeat_error?: StringNullableFilter<"operator_settings"> | string | null
    payment_merchant_ref_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    feature_flags?: JsonFilter<"operator_settings">
    ga4_measurement_id?: StringNullableFilter<"operator_settings"> | string | null
    facebook_pixel_id?: StringNullableFilter<"operator_settings"> | string | null
    analytics_enabled?: BoolFilter<"operator_settings"> | boolean
    faq_text?: StringNullableFilter<"operator_settings"> | string | null
    terms_text?: StringNullableFilter<"operator_settings"> | string | null
    privacy_text?: StringNullableFilter<"operator_settings"> | string | null
    legal_name?: StringNullableFilter<"operator_settings"> | string | null
    trading_name?: StringNullableFilter<"operator_settings"> | string | null
    registration_number?: StringNullableFilter<"operator_settings"> | string | null
    kra_pin?: StringNullableFilter<"operator_settings"> | string | null
    beneficial_owner?: StringNullableFilter<"operator_settings"> | string | null
    business_email?: StringNullableFilter<"operator_settings"> | string | null
    business_phone?: StringNullableFilter<"operator_settings"> | string | null
    county?: StringNullableFilter<"operator_settings"> | string | null
    region?: StringNullableFilter<"operator_settings"> | string | null
    website?: StringNullableFilter<"operator_settings"> | string | null
    legal_profile_locked_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_application_status?: Enumgra_application_statusFilter<"operator_settings"> | $Enums.gra_application_status
    gra_application_id?: UuidNullableFilter<"operator_settings"> | string | null
    gra_application_submitted_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_approved_at?: DateTimeNullableFilter<"operator_settings"> | Date | string | null
    gra_rejection_reason?: StringNullableFilter<"operator_settings"> | string | null
    provision_owner_email?: StringNullableFilter<"operator_settings"> | string | null
    provision_owner_password_encrypted?: StringNullableFilter<"operator_settings"> | string | null
    created_at?: DateTimeFilter<"operator_settings"> | Date | string
    updated_at?: DateTimeFilter<"operator_settings"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }, "id" | "operator_id">

  export type operator_settingsOrderByWithAggregationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    logo_url?: SortOrderInput | SortOrder
    primary_color?: SortOrderInput | SortOrder
    support_email?: SortOrderInput | SortOrder
    footer_licence_text?: SortOrderInput | SortOrder
    social_links?: SortOrderInput | SortOrder
    gra_api_key_encrypted?: SortOrderInput | SortOrder
    gra_hmac_secret_encrypted?: SortOrderInput | SortOrder
    gra_last_heartbeat_at?: SortOrderInput | SortOrder
    gra_last_heartbeat_status?: SortOrderInput | SortOrder
    gra_last_heartbeat_error?: SortOrderInput | SortOrder
    payment_merchant_ref_encrypted?: SortOrderInput | SortOrder
    feature_flags?: SortOrder
    ga4_measurement_id?: SortOrderInput | SortOrder
    facebook_pixel_id?: SortOrderInput | SortOrder
    analytics_enabled?: SortOrder
    faq_text?: SortOrderInput | SortOrder
    terms_text?: SortOrderInput | SortOrder
    privacy_text?: SortOrderInput | SortOrder
    legal_name?: SortOrderInput | SortOrder
    trading_name?: SortOrderInput | SortOrder
    registration_number?: SortOrderInput | SortOrder
    kra_pin?: SortOrderInput | SortOrder
    beneficial_owner?: SortOrderInput | SortOrder
    business_email?: SortOrderInput | SortOrder
    business_phone?: SortOrderInput | SortOrder
    county?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    legal_profile_locked_at?: SortOrderInput | SortOrder
    gra_application_status?: SortOrder
    gra_application_id?: SortOrderInput | SortOrder
    gra_application_submitted_at?: SortOrderInput | SortOrder
    gra_approved_at?: SortOrderInput | SortOrder
    gra_rejection_reason?: SortOrderInput | SortOrder
    provision_owner_email?: SortOrderInput | SortOrder
    provision_owner_password_encrypted?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: operator_settingsCountOrderByAggregateInput
    _max?: operator_settingsMaxOrderByAggregateInput
    _min?: operator_settingsMinOrderByAggregateInput
  }

  export type operator_settingsScalarWhereWithAggregatesInput = {
    AND?: operator_settingsScalarWhereWithAggregatesInput | operator_settingsScalarWhereWithAggregatesInput[]
    OR?: operator_settingsScalarWhereWithAggregatesInput[]
    NOT?: operator_settingsScalarWhereWithAggregatesInput | operator_settingsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"operator_settings"> | string
    operator_id?: UuidWithAggregatesFilter<"operator_settings"> | string
    logo_url?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    primary_color?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    support_email?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    footer_licence_text?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    social_links?: JsonNullableWithAggregatesFilter<"operator_settings">
    gra_api_key_encrypted?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    gra_hmac_secret_encrypted?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    gra_last_heartbeat_at?: DateTimeNullableWithAggregatesFilter<"operator_settings"> | Date | string | null
    gra_last_heartbeat_status?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    gra_last_heartbeat_error?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    payment_merchant_ref_encrypted?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    feature_flags?: JsonWithAggregatesFilter<"operator_settings">
    ga4_measurement_id?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    facebook_pixel_id?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    analytics_enabled?: BoolWithAggregatesFilter<"operator_settings"> | boolean
    faq_text?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    terms_text?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    privacy_text?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    legal_name?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    trading_name?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    registration_number?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    kra_pin?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    beneficial_owner?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    business_email?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    business_phone?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    county?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    region?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    website?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    legal_profile_locked_at?: DateTimeNullableWithAggregatesFilter<"operator_settings"> | Date | string | null
    gra_application_status?: Enumgra_application_statusWithAggregatesFilter<"operator_settings"> | $Enums.gra_application_status
    gra_application_id?: UuidNullableWithAggregatesFilter<"operator_settings"> | string | null
    gra_application_submitted_at?: DateTimeNullableWithAggregatesFilter<"operator_settings"> | Date | string | null
    gra_approved_at?: DateTimeNullableWithAggregatesFilter<"operator_settings"> | Date | string | null
    gra_rejection_reason?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    provision_owner_email?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    provision_owner_password_encrypted?: StringNullableWithAggregatesFilter<"operator_settings"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"operator_settings"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"operator_settings"> | Date | string
  }

  export type platform_usersWhereInput = {
    AND?: platform_usersWhereInput | platform_usersWhereInput[]
    OR?: platform_usersWhereInput[]
    NOT?: platform_usersWhereInput | platform_usersWhereInput[]
    id?: UuidFilter<"platform_users"> | string
    email?: StringFilter<"platform_users"> | string
    password_hash?: StringFilter<"platform_users"> | string
    role?: Enumplatform_roleFilter<"platform_users"> | $Enums.platform_role
    mfa_enabled?: BoolFilter<"platform_users"> | boolean
    mfa_secret_encrypted?: StringNullableFilter<"platform_users"> | string | null
    last_login_at?: DateTimeNullableFilter<"platform_users"> | Date | string | null
    created_at?: DateTimeFilter<"platform_users"> | Date | string
    updated_at?: DateTimeFilter<"platform_users"> | Date | string
    audit_logs?: Platform_audit_logsListRelationFilter
  }

  export type platform_usersOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    mfa_enabled?: SortOrder
    mfa_secret_encrypted?: SortOrderInput | SortOrder
    last_login_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    audit_logs?: platform_audit_logsOrderByRelationAggregateInput
  }

  export type platform_usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: platform_usersWhereInput | platform_usersWhereInput[]
    OR?: platform_usersWhereInput[]
    NOT?: platform_usersWhereInput | platform_usersWhereInput[]
    password_hash?: StringFilter<"platform_users"> | string
    role?: Enumplatform_roleFilter<"platform_users"> | $Enums.platform_role
    mfa_enabled?: BoolFilter<"platform_users"> | boolean
    mfa_secret_encrypted?: StringNullableFilter<"platform_users"> | string | null
    last_login_at?: DateTimeNullableFilter<"platform_users"> | Date | string | null
    created_at?: DateTimeFilter<"platform_users"> | Date | string
    updated_at?: DateTimeFilter<"platform_users"> | Date | string
    audit_logs?: Platform_audit_logsListRelationFilter
  }, "id" | "email">

  export type platform_usersOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    mfa_enabled?: SortOrder
    mfa_secret_encrypted?: SortOrderInput | SortOrder
    last_login_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: platform_usersCountOrderByAggregateInput
    _max?: platform_usersMaxOrderByAggregateInput
    _min?: platform_usersMinOrderByAggregateInput
  }

  export type platform_usersScalarWhereWithAggregatesInput = {
    AND?: platform_usersScalarWhereWithAggregatesInput | platform_usersScalarWhereWithAggregatesInput[]
    OR?: platform_usersScalarWhereWithAggregatesInput[]
    NOT?: platform_usersScalarWhereWithAggregatesInput | platform_usersScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"platform_users"> | string
    email?: StringWithAggregatesFilter<"platform_users"> | string
    password_hash?: StringWithAggregatesFilter<"platform_users"> | string
    role?: Enumplatform_roleWithAggregatesFilter<"platform_users"> | $Enums.platform_role
    mfa_enabled?: BoolWithAggregatesFilter<"platform_users"> | boolean
    mfa_secret_encrypted?: StringNullableWithAggregatesFilter<"platform_users"> | string | null
    last_login_at?: DateTimeNullableWithAggregatesFilter<"platform_users"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"platform_users"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"platform_users"> | Date | string
  }

  export type platform_audit_logsWhereInput = {
    AND?: platform_audit_logsWhereInput | platform_audit_logsWhereInput[]
    OR?: platform_audit_logsWhereInput[]
    NOT?: platform_audit_logsWhereInput | platform_audit_logsWhereInput[]
    id?: UuidFilter<"platform_audit_logs"> | string
    platform_user_id?: UuidNullableFilter<"platform_audit_logs"> | string | null
    operator_id?: UuidNullableFilter<"platform_audit_logs"> | string | null
    action?: StringFilter<"platform_audit_logs"> | string
    entity_type?: StringFilter<"platform_audit_logs"> | string
    entity_id?: StringNullableFilter<"platform_audit_logs"> | string | null
    metadata?: JsonNullableFilter<"platform_audit_logs">
    created_at?: DateTimeFilter<"platform_audit_logs"> | Date | string
    platform_user?: XOR<Platform_usersNullableScalarRelationFilter, platform_usersWhereInput> | null
    operator?: XOR<OperatorsNullableScalarRelationFilter, operatorsWhereInput> | null
  }

  export type platform_audit_logsOrderByWithRelationInput = {
    id?: SortOrder
    platform_user_id?: SortOrderInput | SortOrder
    operator_id?: SortOrderInput | SortOrder
    action?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    platform_user?: platform_usersOrderByWithRelationInput
    operator?: operatorsOrderByWithRelationInput
  }

  export type platform_audit_logsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: platform_audit_logsWhereInput | platform_audit_logsWhereInput[]
    OR?: platform_audit_logsWhereInput[]
    NOT?: platform_audit_logsWhereInput | platform_audit_logsWhereInput[]
    platform_user_id?: UuidNullableFilter<"platform_audit_logs"> | string | null
    operator_id?: UuidNullableFilter<"platform_audit_logs"> | string | null
    action?: StringFilter<"platform_audit_logs"> | string
    entity_type?: StringFilter<"platform_audit_logs"> | string
    entity_id?: StringNullableFilter<"platform_audit_logs"> | string | null
    metadata?: JsonNullableFilter<"platform_audit_logs">
    created_at?: DateTimeFilter<"platform_audit_logs"> | Date | string
    platform_user?: XOR<Platform_usersNullableScalarRelationFilter, platform_usersWhereInput> | null
    operator?: XOR<OperatorsNullableScalarRelationFilter, operatorsWhereInput> | null
  }, "id">

  export type platform_audit_logsOrderByWithAggregationInput = {
    id?: SortOrder
    platform_user_id?: SortOrderInput | SortOrder
    operator_id?: SortOrderInput | SortOrder
    action?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: platform_audit_logsCountOrderByAggregateInput
    _max?: platform_audit_logsMaxOrderByAggregateInput
    _min?: platform_audit_logsMinOrderByAggregateInput
  }

  export type platform_audit_logsScalarWhereWithAggregatesInput = {
    AND?: platform_audit_logsScalarWhereWithAggregatesInput | platform_audit_logsScalarWhereWithAggregatesInput[]
    OR?: platform_audit_logsScalarWhereWithAggregatesInput[]
    NOT?: platform_audit_logsScalarWhereWithAggregatesInput | platform_audit_logsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"platform_audit_logs"> | string
    platform_user_id?: UuidNullableWithAggregatesFilter<"platform_audit_logs"> | string | null
    operator_id?: UuidNullableWithAggregatesFilter<"platform_audit_logs"> | string | null
    action?: StringWithAggregatesFilter<"platform_audit_logs"> | string
    entity_type?: StringWithAggregatesFilter<"platform_audit_logs"> | string
    entity_id?: StringNullableWithAggregatesFilter<"platform_audit_logs"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"platform_audit_logs">
    created_at?: DateTimeWithAggregatesFilter<"platform_audit_logs"> | Date | string
  }

  export type platform_settingsWhereInput = {
    AND?: platform_settingsWhereInput | platform_settingsWhereInput[]
    OR?: platform_settingsWhereInput[]
    NOT?: platform_settingsWhereInput | platform_settingsWhereInput[]
    id?: StringFilter<"platform_settings"> | string
    tenant_base_domain?: StringFilter<"platform_settings"> | string
    alert_email?: StringNullableFilter<"platform_settings"> | string | null
    rollup_schedule?: StringFilter<"platform_settings"> | string
    smtp_host?: StringNullableFilter<"platform_settings"> | string | null
    smtp_port?: IntNullableFilter<"platform_settings"> | number | null
    smtp_user?: StringNullableFilter<"platform_settings"> | string | null
    updated_at?: DateTimeFilter<"platform_settings"> | Date | string
  }

  export type platform_settingsOrderByWithRelationInput = {
    id?: SortOrder
    tenant_base_domain?: SortOrder
    alert_email?: SortOrderInput | SortOrder
    rollup_schedule?: SortOrder
    smtp_host?: SortOrderInput | SortOrder
    smtp_port?: SortOrderInput | SortOrder
    smtp_user?: SortOrderInput | SortOrder
    updated_at?: SortOrder
  }

  export type platform_settingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: platform_settingsWhereInput | platform_settingsWhereInput[]
    OR?: platform_settingsWhereInput[]
    NOT?: platform_settingsWhereInput | platform_settingsWhereInput[]
    tenant_base_domain?: StringFilter<"platform_settings"> | string
    alert_email?: StringNullableFilter<"platform_settings"> | string | null
    rollup_schedule?: StringFilter<"platform_settings"> | string
    smtp_host?: StringNullableFilter<"platform_settings"> | string | null
    smtp_port?: IntNullableFilter<"platform_settings"> | number | null
    smtp_user?: StringNullableFilter<"platform_settings"> | string | null
    updated_at?: DateTimeFilter<"platform_settings"> | Date | string
  }, "id">

  export type platform_settingsOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_base_domain?: SortOrder
    alert_email?: SortOrderInput | SortOrder
    rollup_schedule?: SortOrder
    smtp_host?: SortOrderInput | SortOrder
    smtp_port?: SortOrderInput | SortOrder
    smtp_user?: SortOrderInput | SortOrder
    updated_at?: SortOrder
    _count?: platform_settingsCountOrderByAggregateInput
    _avg?: platform_settingsAvgOrderByAggregateInput
    _max?: platform_settingsMaxOrderByAggregateInput
    _min?: platform_settingsMinOrderByAggregateInput
    _sum?: platform_settingsSumOrderByAggregateInput
  }

  export type platform_settingsScalarWhereWithAggregatesInput = {
    AND?: platform_settingsScalarWhereWithAggregatesInput | platform_settingsScalarWhereWithAggregatesInput[]
    OR?: platform_settingsScalarWhereWithAggregatesInput[]
    NOT?: platform_settingsScalarWhereWithAggregatesInput | platform_settingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"platform_settings"> | string
    tenant_base_domain?: StringWithAggregatesFilter<"platform_settings"> | string
    alert_email?: StringNullableWithAggregatesFilter<"platform_settings"> | string | null
    rollup_schedule?: StringWithAggregatesFilter<"platform_settings"> | string
    smtp_host?: StringNullableWithAggregatesFilter<"platform_settings"> | string | null
    smtp_port?: IntNullableWithAggregatesFilter<"platform_settings"> | number | null
    smtp_user?: StringNullableWithAggregatesFilter<"platform_settings"> | string | null
    updated_at?: DateTimeWithAggregatesFilter<"platform_settings"> | Date | string
  }

  export type tenant_daily_rollupsWhereInput = {
    AND?: tenant_daily_rollupsWhereInput | tenant_daily_rollupsWhereInput[]
    OR?: tenant_daily_rollupsWhereInput[]
    NOT?: tenant_daily_rollupsWhereInput | tenant_daily_rollupsWhereInput[]
    id?: UuidFilter<"tenant_daily_rollups"> | string
    operator_id?: UuidFilter<"tenant_daily_rollups"> | string
    date?: DateTimeFilter<"tenant_daily_rollups"> | Date | string
    gross_sales?: DecimalFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    orders_count?: IntFilter<"tenant_daily_rollups"> | number
    active_raffles?: IntFilter<"tenant_daily_rollups"> | number
    failed_gra_events?: IntFilter<"tenant_daily_rollups"> | number
    created_at?: DateTimeFilter<"tenant_daily_rollups"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }

  export type tenant_daily_rollupsOrderByWithRelationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    date?: SortOrder
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
    created_at?: SortOrder
    operator?: operatorsOrderByWithRelationInput
  }

  export type tenant_daily_rollupsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    operator_id_date?: tenant_daily_rollupsOperator_idDateCompoundUniqueInput
    AND?: tenant_daily_rollupsWhereInput | tenant_daily_rollupsWhereInput[]
    OR?: tenant_daily_rollupsWhereInput[]
    NOT?: tenant_daily_rollupsWhereInput | tenant_daily_rollupsWhereInput[]
    operator_id?: UuidFilter<"tenant_daily_rollups"> | string
    date?: DateTimeFilter<"tenant_daily_rollups"> | Date | string
    gross_sales?: DecimalFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    orders_count?: IntFilter<"tenant_daily_rollups"> | number
    active_raffles?: IntFilter<"tenant_daily_rollups"> | number
    failed_gra_events?: IntFilter<"tenant_daily_rollups"> | number
    created_at?: DateTimeFilter<"tenant_daily_rollups"> | Date | string
    operator?: XOR<OperatorsScalarRelationFilter, operatorsWhereInput>
  }, "id" | "operator_id_date">

  export type tenant_daily_rollupsOrderByWithAggregationInput = {
    id?: SortOrder
    operator_id?: SortOrder
    date?: SortOrder
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
    created_at?: SortOrder
    _count?: tenant_daily_rollupsCountOrderByAggregateInput
    _avg?: tenant_daily_rollupsAvgOrderByAggregateInput
    _max?: tenant_daily_rollupsMaxOrderByAggregateInput
    _min?: tenant_daily_rollupsMinOrderByAggregateInput
    _sum?: tenant_daily_rollupsSumOrderByAggregateInput
  }

  export type tenant_daily_rollupsScalarWhereWithAggregatesInput = {
    AND?: tenant_daily_rollupsScalarWhereWithAggregatesInput | tenant_daily_rollupsScalarWhereWithAggregatesInput[]
    OR?: tenant_daily_rollupsScalarWhereWithAggregatesInput[]
    NOT?: tenant_daily_rollupsScalarWhereWithAggregatesInput | tenant_daily_rollupsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"tenant_daily_rollups"> | string
    operator_id?: UuidWithAggregatesFilter<"tenant_daily_rollups"> | string
    date?: DateTimeWithAggregatesFilter<"tenant_daily_rollups"> | Date | string
    gross_sales?: DecimalWithAggregatesFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalWithAggregatesFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    orders_count?: IntWithAggregatesFilter<"tenant_daily_rollups"> | number
    active_raffles?: IntWithAggregatesFilter<"tenant_daily_rollups"> | number
    failed_gra_events?: IntWithAggregatesFilter<"tenant_daily_rollups"> | number
    created_at?: DateTimeWithAggregatesFilter<"tenant_daily_rollups"> | Date | string
  }

  export type operatorsCreateInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUncheckedCreateInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesUncheckedCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsUncheckedCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsUncheckedCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsUncheckedCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsUncheckedCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUncheckedUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUncheckedUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUncheckedUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUncheckedUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsCreateManyInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type operatorsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operatorsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_databasesCreateInput = {
    id?: string
    database_name: string
    database_host: string
    database_port: number
    database_user: string
    database_password_encrypted: string
    connection_url_encrypted: string
    schema_version?: string
    provisioned_at?: Date | string | null
    provision_error?: string | null
    status?: $Enums.tenant_database_status
    created_at?: Date | string
    updated_at?: Date | string
    operator: operatorsCreateNestedOneWithoutTenant_databaseInput
  }

  export type tenant_databasesUncheckedCreateInput = {
    id?: string
    operator_id: string
    database_name: string
    database_host: string
    database_port: number
    database_user: string
    database_password_encrypted: string
    connection_url_encrypted: string
    schema_version?: string
    provisioned_at?: Date | string | null
    provision_error?: string | null
    status?: $Enums.tenant_database_status
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tenant_databasesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    database_name?: StringFieldUpdateOperationsInput | string
    database_host?: StringFieldUpdateOperationsInput | string
    database_port?: IntFieldUpdateOperationsInput | number
    database_user?: StringFieldUpdateOperationsInput | string
    database_password_encrypted?: StringFieldUpdateOperationsInput | string
    connection_url_encrypted?: StringFieldUpdateOperationsInput | string
    schema_version?: StringFieldUpdateOperationsInput | string
    provisioned_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    provision_error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: Enumtenant_database_statusFieldUpdateOperationsInput | $Enums.tenant_database_status
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    operator?: operatorsUpdateOneRequiredWithoutTenant_databaseNestedInput
  }

  export type tenant_databasesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    database_name?: StringFieldUpdateOperationsInput | string
    database_host?: StringFieldUpdateOperationsInput | string
    database_port?: IntFieldUpdateOperationsInput | number
    database_user?: StringFieldUpdateOperationsInput | string
    database_password_encrypted?: StringFieldUpdateOperationsInput | string
    connection_url_encrypted?: StringFieldUpdateOperationsInput | string
    schema_version?: StringFieldUpdateOperationsInput | string
    provisioned_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    provision_error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: Enumtenant_database_statusFieldUpdateOperationsInput | $Enums.tenant_database_status
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_databasesCreateManyInput = {
    id?: string
    operator_id: string
    database_name: string
    database_host: string
    database_port: number
    database_user: string
    database_password_encrypted: string
    connection_url_encrypted: string
    schema_version?: string
    provisioned_at?: Date | string | null
    provision_error?: string | null
    status?: $Enums.tenant_database_status
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tenant_databasesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    database_name?: StringFieldUpdateOperationsInput | string
    database_host?: StringFieldUpdateOperationsInput | string
    database_port?: IntFieldUpdateOperationsInput | number
    database_user?: StringFieldUpdateOperationsInput | string
    database_password_encrypted?: StringFieldUpdateOperationsInput | string
    connection_url_encrypted?: StringFieldUpdateOperationsInput | string
    schema_version?: StringFieldUpdateOperationsInput | string
    provisioned_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    provision_error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: Enumtenant_database_statusFieldUpdateOperationsInput | $Enums.tenant_database_status
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_databasesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    database_name?: StringFieldUpdateOperationsInput | string
    database_host?: StringFieldUpdateOperationsInput | string
    database_port?: IntFieldUpdateOperationsInput | number
    database_user?: StringFieldUpdateOperationsInput | string
    database_password_encrypted?: StringFieldUpdateOperationsInput | string
    connection_url_encrypted?: StringFieldUpdateOperationsInput | string
    schema_version?: StringFieldUpdateOperationsInput | string
    provisioned_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    provision_error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: Enumtenant_database_statusFieldUpdateOperationsInput | $Enums.tenant_database_status
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_domainsCreateInput = {
    id?: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status?: $Enums.domain_verification_status
    ssl_status?: $Enums.ssl_status
    is_primary?: boolean
    created_at?: Date | string
    operator: operatorsCreateNestedOneWithoutDomainsInput
  }

  export type operator_domainsUncheckedCreateInput = {
    id?: string
    operator_id: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status?: $Enums.domain_verification_status
    ssl_status?: $Enums.ssl_status
    is_primary?: boolean
    created_at?: Date | string
  }

  export type operator_domainsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    operator?: operatorsUpdateOneRequiredWithoutDomainsNestedInput
  }

  export type operator_domainsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_domainsCreateManyInput = {
    id?: string
    operator_id: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status?: $Enums.domain_verification_status
    ssl_status?: $Enums.ssl_status
    is_primary?: boolean
    created_at?: Date | string
  }

  export type operator_domainsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_domainsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_settingsCreateInput = {
    id?: string
    logo_url?: string | null
    primary_color?: string | null
    support_email?: string | null
    footer_licence_text?: string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: string | null
    gra_hmac_secret_encrypted?: string | null
    gra_last_heartbeat_at?: Date | string | null
    gra_last_heartbeat_status?: string | null
    gra_last_heartbeat_error?: string | null
    payment_merchant_ref_encrypted?: string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: string | null
    facebook_pixel_id?: string | null
    analytics_enabled?: boolean
    faq_text?: string | null
    terms_text?: string | null
    privacy_text?: string | null
    legal_name?: string | null
    trading_name?: string | null
    registration_number?: string | null
    kra_pin?: string | null
    beneficial_owner?: string | null
    business_email?: string | null
    business_phone?: string | null
    county?: string | null
    region?: string | null
    website?: string | null
    legal_profile_locked_at?: Date | string | null
    gra_application_status?: $Enums.gra_application_status
    gra_application_id?: string | null
    gra_application_submitted_at?: Date | string | null
    gra_approved_at?: Date | string | null
    gra_rejection_reason?: string | null
    provision_owner_email?: string | null
    provision_owner_password_encrypted?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    operator: operatorsCreateNestedOneWithoutSettingsInput
  }

  export type operator_settingsUncheckedCreateInput = {
    id?: string
    operator_id: string
    logo_url?: string | null
    primary_color?: string | null
    support_email?: string | null
    footer_licence_text?: string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: string | null
    gra_hmac_secret_encrypted?: string | null
    gra_last_heartbeat_at?: Date | string | null
    gra_last_heartbeat_status?: string | null
    gra_last_heartbeat_error?: string | null
    payment_merchant_ref_encrypted?: string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: string | null
    facebook_pixel_id?: string | null
    analytics_enabled?: boolean
    faq_text?: string | null
    terms_text?: string | null
    privacy_text?: string | null
    legal_name?: string | null
    trading_name?: string | null
    registration_number?: string | null
    kra_pin?: string | null
    beneficial_owner?: string | null
    business_email?: string | null
    business_phone?: string | null
    county?: string | null
    region?: string | null
    website?: string | null
    legal_profile_locked_at?: Date | string | null
    gra_application_status?: $Enums.gra_application_status
    gra_application_id?: string | null
    gra_application_submitted_at?: Date | string | null
    gra_approved_at?: Date | string | null
    gra_rejection_reason?: string | null
    provision_owner_email?: string | null
    provision_owner_password_encrypted?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type operator_settingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    support_email?: NullableStringFieldUpdateOperationsInput | string | null
    footer_licence_text?: NullableStringFieldUpdateOperationsInput | string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_hmac_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_last_heartbeat_status?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_error?: NullableStringFieldUpdateOperationsInput | string | null
    payment_merchant_ref_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: NullableStringFieldUpdateOperationsInput | string | null
    facebook_pixel_id?: NullableStringFieldUpdateOperationsInput | string | null
    analytics_enabled?: BoolFieldUpdateOperationsInput | boolean
    faq_text?: NullableStringFieldUpdateOperationsInput | string | null
    terms_text?: NullableStringFieldUpdateOperationsInput | string | null
    privacy_text?: NullableStringFieldUpdateOperationsInput | string | null
    legal_name?: NullableStringFieldUpdateOperationsInput | string | null
    trading_name?: NullableStringFieldUpdateOperationsInput | string | null
    registration_number?: NullableStringFieldUpdateOperationsInput | string | null
    kra_pin?: NullableStringFieldUpdateOperationsInput | string | null
    beneficial_owner?: NullableStringFieldUpdateOperationsInput | string | null
    business_email?: NullableStringFieldUpdateOperationsInput | string | null
    business_phone?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    legal_profile_locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_application_status?: Enumgra_application_statusFieldUpdateOperationsInput | $Enums.gra_application_status
    gra_application_id?: NullableStringFieldUpdateOperationsInput | string | null
    gra_application_submitted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_approved_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_rejection_reason?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_email?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_password_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    operator?: operatorsUpdateOneRequiredWithoutSettingsNestedInput
  }

  export type operator_settingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    support_email?: NullableStringFieldUpdateOperationsInput | string | null
    footer_licence_text?: NullableStringFieldUpdateOperationsInput | string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_hmac_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_last_heartbeat_status?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_error?: NullableStringFieldUpdateOperationsInput | string | null
    payment_merchant_ref_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: NullableStringFieldUpdateOperationsInput | string | null
    facebook_pixel_id?: NullableStringFieldUpdateOperationsInput | string | null
    analytics_enabled?: BoolFieldUpdateOperationsInput | boolean
    faq_text?: NullableStringFieldUpdateOperationsInput | string | null
    terms_text?: NullableStringFieldUpdateOperationsInput | string | null
    privacy_text?: NullableStringFieldUpdateOperationsInput | string | null
    legal_name?: NullableStringFieldUpdateOperationsInput | string | null
    trading_name?: NullableStringFieldUpdateOperationsInput | string | null
    registration_number?: NullableStringFieldUpdateOperationsInput | string | null
    kra_pin?: NullableStringFieldUpdateOperationsInput | string | null
    beneficial_owner?: NullableStringFieldUpdateOperationsInput | string | null
    business_email?: NullableStringFieldUpdateOperationsInput | string | null
    business_phone?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    legal_profile_locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_application_status?: Enumgra_application_statusFieldUpdateOperationsInput | $Enums.gra_application_status
    gra_application_id?: NullableStringFieldUpdateOperationsInput | string | null
    gra_application_submitted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_approved_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_rejection_reason?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_email?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_password_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_settingsCreateManyInput = {
    id?: string
    operator_id: string
    logo_url?: string | null
    primary_color?: string | null
    support_email?: string | null
    footer_licence_text?: string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: string | null
    gra_hmac_secret_encrypted?: string | null
    gra_last_heartbeat_at?: Date | string | null
    gra_last_heartbeat_status?: string | null
    gra_last_heartbeat_error?: string | null
    payment_merchant_ref_encrypted?: string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: string | null
    facebook_pixel_id?: string | null
    analytics_enabled?: boolean
    faq_text?: string | null
    terms_text?: string | null
    privacy_text?: string | null
    legal_name?: string | null
    trading_name?: string | null
    registration_number?: string | null
    kra_pin?: string | null
    beneficial_owner?: string | null
    business_email?: string | null
    business_phone?: string | null
    county?: string | null
    region?: string | null
    website?: string | null
    legal_profile_locked_at?: Date | string | null
    gra_application_status?: $Enums.gra_application_status
    gra_application_id?: string | null
    gra_application_submitted_at?: Date | string | null
    gra_approved_at?: Date | string | null
    gra_rejection_reason?: string | null
    provision_owner_email?: string | null
    provision_owner_password_encrypted?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type operator_settingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    support_email?: NullableStringFieldUpdateOperationsInput | string | null
    footer_licence_text?: NullableStringFieldUpdateOperationsInput | string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_hmac_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_last_heartbeat_status?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_error?: NullableStringFieldUpdateOperationsInput | string | null
    payment_merchant_ref_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: NullableStringFieldUpdateOperationsInput | string | null
    facebook_pixel_id?: NullableStringFieldUpdateOperationsInput | string | null
    analytics_enabled?: BoolFieldUpdateOperationsInput | boolean
    faq_text?: NullableStringFieldUpdateOperationsInput | string | null
    terms_text?: NullableStringFieldUpdateOperationsInput | string | null
    privacy_text?: NullableStringFieldUpdateOperationsInput | string | null
    legal_name?: NullableStringFieldUpdateOperationsInput | string | null
    trading_name?: NullableStringFieldUpdateOperationsInput | string | null
    registration_number?: NullableStringFieldUpdateOperationsInput | string | null
    kra_pin?: NullableStringFieldUpdateOperationsInput | string | null
    beneficial_owner?: NullableStringFieldUpdateOperationsInput | string | null
    business_email?: NullableStringFieldUpdateOperationsInput | string | null
    business_phone?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    legal_profile_locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_application_status?: Enumgra_application_statusFieldUpdateOperationsInput | $Enums.gra_application_status
    gra_application_id?: NullableStringFieldUpdateOperationsInput | string | null
    gra_application_submitted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_approved_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_rejection_reason?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_email?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_password_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_settingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    support_email?: NullableStringFieldUpdateOperationsInput | string | null
    footer_licence_text?: NullableStringFieldUpdateOperationsInput | string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_hmac_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_last_heartbeat_status?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_error?: NullableStringFieldUpdateOperationsInput | string | null
    payment_merchant_ref_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: NullableStringFieldUpdateOperationsInput | string | null
    facebook_pixel_id?: NullableStringFieldUpdateOperationsInput | string | null
    analytics_enabled?: BoolFieldUpdateOperationsInput | boolean
    faq_text?: NullableStringFieldUpdateOperationsInput | string | null
    terms_text?: NullableStringFieldUpdateOperationsInput | string | null
    privacy_text?: NullableStringFieldUpdateOperationsInput | string | null
    legal_name?: NullableStringFieldUpdateOperationsInput | string | null
    trading_name?: NullableStringFieldUpdateOperationsInput | string | null
    registration_number?: NullableStringFieldUpdateOperationsInput | string | null
    kra_pin?: NullableStringFieldUpdateOperationsInput | string | null
    beneficial_owner?: NullableStringFieldUpdateOperationsInput | string | null
    business_email?: NullableStringFieldUpdateOperationsInput | string | null
    business_phone?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    legal_profile_locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_application_status?: Enumgra_application_statusFieldUpdateOperationsInput | $Enums.gra_application_status
    gra_application_id?: NullableStringFieldUpdateOperationsInput | string | null
    gra_application_submitted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_approved_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_rejection_reason?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_email?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_password_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_usersCreateInput = {
    id?: string
    email: string
    password_hash: string
    role?: $Enums.platform_role
    mfa_enabled?: boolean
    mfa_secret_encrypted?: string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    audit_logs?: platform_audit_logsCreateNestedManyWithoutPlatform_userInput
  }

  export type platform_usersUncheckedCreateInput = {
    id?: string
    email: string
    password_hash: string
    role?: $Enums.platform_role
    mfa_enabled?: boolean
    mfa_secret_encrypted?: string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    audit_logs?: platform_audit_logsUncheckedCreateNestedManyWithoutPlatform_userInput
  }

  export type platform_usersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: Enumplatform_roleFieldUpdateOperationsInput | $Enums.platform_role
    mfa_enabled?: BoolFieldUpdateOperationsInput | boolean
    mfa_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    audit_logs?: platform_audit_logsUpdateManyWithoutPlatform_userNestedInput
  }

  export type platform_usersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: Enumplatform_roleFieldUpdateOperationsInput | $Enums.platform_role
    mfa_enabled?: BoolFieldUpdateOperationsInput | boolean
    mfa_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    audit_logs?: platform_audit_logsUncheckedUpdateManyWithoutPlatform_userNestedInput
  }

  export type platform_usersCreateManyInput = {
    id?: string
    email: string
    password_hash: string
    role?: $Enums.platform_role
    mfa_enabled?: boolean
    mfa_secret_encrypted?: string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type platform_usersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: Enumplatform_roleFieldUpdateOperationsInput | $Enums.platform_role
    mfa_enabled?: BoolFieldUpdateOperationsInput | boolean
    mfa_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_usersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: Enumplatform_roleFieldUpdateOperationsInput | $Enums.platform_role
    mfa_enabled?: BoolFieldUpdateOperationsInput | boolean
    mfa_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsCreateInput = {
    id?: string
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    platform_user?: platform_usersCreateNestedOneWithoutAudit_logsInput
    operator?: operatorsCreateNestedOneWithoutAudit_logsInput
  }

  export type platform_audit_logsUncheckedCreateInput = {
    id?: string
    platform_user_id?: string | null
    operator_id?: string | null
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type platform_audit_logsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    platform_user?: platform_usersUpdateOneWithoutAudit_logsNestedInput
    operator?: operatorsUpdateOneWithoutAudit_logsNestedInput
  }

  export type platform_audit_logsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform_user_id?: NullableStringFieldUpdateOperationsInput | string | null
    operator_id?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsCreateManyInput = {
    id?: string
    platform_user_id?: string | null
    operator_id?: string | null
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type platform_audit_logsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform_user_id?: NullableStringFieldUpdateOperationsInput | string | null
    operator_id?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_settingsCreateInput = {
    id?: string
    tenant_base_domain?: string
    alert_email?: string | null
    rollup_schedule?: string
    smtp_host?: string | null
    smtp_port?: number | null
    smtp_user?: string | null
    updated_at?: Date | string
  }

  export type platform_settingsUncheckedCreateInput = {
    id?: string
    tenant_base_domain?: string
    alert_email?: string | null
    rollup_schedule?: string
    smtp_host?: string | null
    smtp_port?: number | null
    smtp_user?: string | null
    updated_at?: Date | string
  }

  export type platform_settingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_base_domain?: StringFieldUpdateOperationsInput | string
    alert_email?: NullableStringFieldUpdateOperationsInput | string | null
    rollup_schedule?: StringFieldUpdateOperationsInput | string
    smtp_host?: NullableStringFieldUpdateOperationsInput | string | null
    smtp_port?: NullableIntFieldUpdateOperationsInput | number | null
    smtp_user?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_settingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_base_domain?: StringFieldUpdateOperationsInput | string
    alert_email?: NullableStringFieldUpdateOperationsInput | string | null
    rollup_schedule?: StringFieldUpdateOperationsInput | string
    smtp_host?: NullableStringFieldUpdateOperationsInput | string | null
    smtp_port?: NullableIntFieldUpdateOperationsInput | number | null
    smtp_user?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_settingsCreateManyInput = {
    id?: string
    tenant_base_domain?: string
    alert_email?: string | null
    rollup_schedule?: string
    smtp_host?: string | null
    smtp_port?: number | null
    smtp_user?: string | null
    updated_at?: Date | string
  }

  export type platform_settingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_base_domain?: StringFieldUpdateOperationsInput | string
    alert_email?: NullableStringFieldUpdateOperationsInput | string | null
    rollup_schedule?: StringFieldUpdateOperationsInput | string
    smtp_host?: NullableStringFieldUpdateOperationsInput | string | null
    smtp_port?: NullableIntFieldUpdateOperationsInput | number | null
    smtp_user?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_settingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_base_domain?: StringFieldUpdateOperationsInput | string
    alert_email?: NullableStringFieldUpdateOperationsInput | string | null
    rollup_schedule?: StringFieldUpdateOperationsInput | string
    smtp_host?: NullableStringFieldUpdateOperationsInput | string | null
    smtp_port?: NullableIntFieldUpdateOperationsInput | number | null
    smtp_user?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_daily_rollupsCreateInput = {
    id?: string
    date: Date | string
    gross_sales?: Decimal | DecimalJsLike | number | string
    tax_collected?: Decimal | DecimalJsLike | number | string
    orders_count?: number
    active_raffles?: number
    failed_gra_events?: number
    created_at?: Date | string
    operator: operatorsCreateNestedOneWithoutRollupsInput
  }

  export type tenant_daily_rollupsUncheckedCreateInput = {
    id?: string
    operator_id: string
    date: Date | string
    gross_sales?: Decimal | DecimalJsLike | number | string
    tax_collected?: Decimal | DecimalJsLike | number | string
    orders_count?: number
    active_raffles?: number
    failed_gra_events?: number
    created_at?: Date | string
  }

  export type tenant_daily_rollupsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    operator?: operatorsUpdateOneRequiredWithoutRollupsNestedInput
  }

  export type tenant_daily_rollupsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_daily_rollupsCreateManyInput = {
    id?: string
    operator_id: string
    date: Date | string
    gross_sales?: Decimal | DecimalJsLike | number | string
    tax_collected?: Decimal | DecimalJsLike | number | string
    orders_count?: number
    active_raffles?: number
    failed_gra_events?: number
    created_at?: Date | string
  }

  export type tenant_daily_rollupsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_daily_rollupsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type Enumoperator_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.operator_status | Enumoperator_statusFieldRefInput<$PrismaModel>
    in?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumoperator_statusFilter<$PrismaModel> | $Enums.operator_status
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type Tenant_databasesNullableScalarRelationFilter = {
    is?: tenant_databasesWhereInput | null
    isNot?: tenant_databasesWhereInput | null
  }

  export type Operator_domainsListRelationFilter = {
    every?: operator_domainsWhereInput
    some?: operator_domainsWhereInput
    none?: operator_domainsWhereInput
  }

  export type Operator_settingsNullableScalarRelationFilter = {
    is?: operator_settingsWhereInput | null
    isNot?: operator_settingsWhereInput | null
  }

  export type Platform_audit_logsListRelationFilter = {
    every?: platform_audit_logsWhereInput
    some?: platform_audit_logsWhereInput
    none?: platform_audit_logsWhereInput
  }

  export type Tenant_daily_rollupsListRelationFilter = {
    every?: tenant_daily_rollupsWhereInput
    some?: tenant_daily_rollupsWhereInput
    none?: tenant_daily_rollupsWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type operator_domainsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type platform_audit_logsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type tenant_daily_rollupsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type operatorsCountOrderByAggregateInput = {
    id?: SortOrder
    gra_registry_id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    licence_number?: SortOrder
    default_tax_rate?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type operatorsAvgOrderByAggregateInput = {
    default_tax_rate?: SortOrder
  }

  export type operatorsMaxOrderByAggregateInput = {
    id?: SortOrder
    gra_registry_id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    licence_number?: SortOrder
    default_tax_rate?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type operatorsMinOrderByAggregateInput = {
    id?: SortOrder
    gra_registry_id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    licence_number?: SortOrder
    default_tax_rate?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type operatorsSumOrderByAggregateInput = {
    default_tax_rate?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type Enumoperator_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.operator_status | Enumoperator_statusFieldRefInput<$PrismaModel>
    in?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumoperator_statusWithAggregatesFilter<$PrismaModel> | $Enums.operator_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumoperator_statusFilter<$PrismaModel>
    _max?: NestedEnumoperator_statusFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type Enumtenant_database_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.tenant_database_status | Enumtenant_database_statusFieldRefInput<$PrismaModel>
    in?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumtenant_database_statusFilter<$PrismaModel> | $Enums.tenant_database_status
  }

  export type OperatorsScalarRelationFilter = {
    is?: operatorsWhereInput
    isNot?: operatorsWhereInput
  }

  export type tenant_databasesCountOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    database_name?: SortOrder
    database_host?: SortOrder
    database_port?: SortOrder
    database_user?: SortOrder
    database_password_encrypted?: SortOrder
    connection_url_encrypted?: SortOrder
    schema_version?: SortOrder
    provisioned_at?: SortOrder
    provision_error?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type tenant_databasesAvgOrderByAggregateInput = {
    database_port?: SortOrder
  }

  export type tenant_databasesMaxOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    database_name?: SortOrder
    database_host?: SortOrder
    database_port?: SortOrder
    database_user?: SortOrder
    database_password_encrypted?: SortOrder
    connection_url_encrypted?: SortOrder
    schema_version?: SortOrder
    provisioned_at?: SortOrder
    provision_error?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type tenant_databasesMinOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    database_name?: SortOrder
    database_host?: SortOrder
    database_port?: SortOrder
    database_user?: SortOrder
    database_password_encrypted?: SortOrder
    connection_url_encrypted?: SortOrder
    schema_version?: SortOrder
    provisioned_at?: SortOrder
    provision_error?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type tenant_databasesSumOrderByAggregateInput = {
    database_port?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type Enumtenant_database_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.tenant_database_status | Enumtenant_database_statusFieldRefInput<$PrismaModel>
    in?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumtenant_database_statusWithAggregatesFilter<$PrismaModel> | $Enums.tenant_database_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumtenant_database_statusFilter<$PrismaModel>
    _max?: NestedEnumtenant_database_statusFilter<$PrismaModel>
  }

  export type Enumdomain_typeFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_type | Enumdomain_typeFieldRefInput<$PrismaModel>
    in?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_typeFilter<$PrismaModel> | $Enums.domain_type
  }

  export type Enumdomain_verification_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_verification_status | Enumdomain_verification_statusFieldRefInput<$PrismaModel>
    in?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_verification_statusFilter<$PrismaModel> | $Enums.domain_verification_status
  }

  export type Enumssl_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.ssl_status | Enumssl_statusFieldRefInput<$PrismaModel>
    in?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumssl_statusFilter<$PrismaModel> | $Enums.ssl_status
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type operator_domainsCountOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    hostname?: SortOrder
    domain_type?: SortOrder
    verification_status?: SortOrder
    ssl_status?: SortOrder
    is_primary?: SortOrder
    created_at?: SortOrder
  }

  export type operator_domainsMaxOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    hostname?: SortOrder
    domain_type?: SortOrder
    verification_status?: SortOrder
    ssl_status?: SortOrder
    is_primary?: SortOrder
    created_at?: SortOrder
  }

  export type operator_domainsMinOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    hostname?: SortOrder
    domain_type?: SortOrder
    verification_status?: SortOrder
    ssl_status?: SortOrder
    is_primary?: SortOrder
    created_at?: SortOrder
  }

  export type Enumdomain_typeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_type | Enumdomain_typeFieldRefInput<$PrismaModel>
    in?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_typeWithAggregatesFilter<$PrismaModel> | $Enums.domain_type
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumdomain_typeFilter<$PrismaModel>
    _max?: NestedEnumdomain_typeFilter<$PrismaModel>
  }

  export type Enumdomain_verification_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_verification_status | Enumdomain_verification_statusFieldRefInput<$PrismaModel>
    in?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_verification_statusWithAggregatesFilter<$PrismaModel> | $Enums.domain_verification_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumdomain_verification_statusFilter<$PrismaModel>
    _max?: NestedEnumdomain_verification_statusFilter<$PrismaModel>
  }

  export type Enumssl_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ssl_status | Enumssl_statusFieldRefInput<$PrismaModel>
    in?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumssl_statusWithAggregatesFilter<$PrismaModel> | $Enums.ssl_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumssl_statusFilter<$PrismaModel>
    _max?: NestedEnumssl_statusFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type Enumgra_application_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.gra_application_status | Enumgra_application_statusFieldRefInput<$PrismaModel>
    in?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumgra_application_statusFilter<$PrismaModel> | $Enums.gra_application_status
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type operator_settingsCountOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    logo_url?: SortOrder
    primary_color?: SortOrder
    support_email?: SortOrder
    footer_licence_text?: SortOrder
    social_links?: SortOrder
    gra_api_key_encrypted?: SortOrder
    gra_hmac_secret_encrypted?: SortOrder
    gra_last_heartbeat_at?: SortOrder
    gra_last_heartbeat_status?: SortOrder
    gra_last_heartbeat_error?: SortOrder
    payment_merchant_ref_encrypted?: SortOrder
    feature_flags?: SortOrder
    ga4_measurement_id?: SortOrder
    facebook_pixel_id?: SortOrder
    analytics_enabled?: SortOrder
    faq_text?: SortOrder
    terms_text?: SortOrder
    privacy_text?: SortOrder
    legal_name?: SortOrder
    trading_name?: SortOrder
    registration_number?: SortOrder
    kra_pin?: SortOrder
    beneficial_owner?: SortOrder
    business_email?: SortOrder
    business_phone?: SortOrder
    county?: SortOrder
    region?: SortOrder
    website?: SortOrder
    legal_profile_locked_at?: SortOrder
    gra_application_status?: SortOrder
    gra_application_id?: SortOrder
    gra_application_submitted_at?: SortOrder
    gra_approved_at?: SortOrder
    gra_rejection_reason?: SortOrder
    provision_owner_email?: SortOrder
    provision_owner_password_encrypted?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type operator_settingsMaxOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    logo_url?: SortOrder
    primary_color?: SortOrder
    support_email?: SortOrder
    footer_licence_text?: SortOrder
    gra_api_key_encrypted?: SortOrder
    gra_hmac_secret_encrypted?: SortOrder
    gra_last_heartbeat_at?: SortOrder
    gra_last_heartbeat_status?: SortOrder
    gra_last_heartbeat_error?: SortOrder
    payment_merchant_ref_encrypted?: SortOrder
    ga4_measurement_id?: SortOrder
    facebook_pixel_id?: SortOrder
    analytics_enabled?: SortOrder
    faq_text?: SortOrder
    terms_text?: SortOrder
    privacy_text?: SortOrder
    legal_name?: SortOrder
    trading_name?: SortOrder
    registration_number?: SortOrder
    kra_pin?: SortOrder
    beneficial_owner?: SortOrder
    business_email?: SortOrder
    business_phone?: SortOrder
    county?: SortOrder
    region?: SortOrder
    website?: SortOrder
    legal_profile_locked_at?: SortOrder
    gra_application_status?: SortOrder
    gra_application_id?: SortOrder
    gra_application_submitted_at?: SortOrder
    gra_approved_at?: SortOrder
    gra_rejection_reason?: SortOrder
    provision_owner_email?: SortOrder
    provision_owner_password_encrypted?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type operator_settingsMinOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    logo_url?: SortOrder
    primary_color?: SortOrder
    support_email?: SortOrder
    footer_licence_text?: SortOrder
    gra_api_key_encrypted?: SortOrder
    gra_hmac_secret_encrypted?: SortOrder
    gra_last_heartbeat_at?: SortOrder
    gra_last_heartbeat_status?: SortOrder
    gra_last_heartbeat_error?: SortOrder
    payment_merchant_ref_encrypted?: SortOrder
    ga4_measurement_id?: SortOrder
    facebook_pixel_id?: SortOrder
    analytics_enabled?: SortOrder
    faq_text?: SortOrder
    terms_text?: SortOrder
    privacy_text?: SortOrder
    legal_name?: SortOrder
    trading_name?: SortOrder
    registration_number?: SortOrder
    kra_pin?: SortOrder
    beneficial_owner?: SortOrder
    business_email?: SortOrder
    business_phone?: SortOrder
    county?: SortOrder
    region?: SortOrder
    website?: SortOrder
    legal_profile_locked_at?: SortOrder
    gra_application_status?: SortOrder
    gra_application_id?: SortOrder
    gra_application_submitted_at?: SortOrder
    gra_approved_at?: SortOrder
    gra_rejection_reason?: SortOrder
    provision_owner_email?: SortOrder
    provision_owner_password_encrypted?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type Enumgra_application_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.gra_application_status | Enumgra_application_statusFieldRefInput<$PrismaModel>
    in?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumgra_application_statusWithAggregatesFilter<$PrismaModel> | $Enums.gra_application_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumgra_application_statusFilter<$PrismaModel>
    _max?: NestedEnumgra_application_statusFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type Enumplatform_roleFilter<$PrismaModel = never> = {
    equals?: $Enums.platform_role | Enumplatform_roleFieldRefInput<$PrismaModel>
    in?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumplatform_roleFilter<$PrismaModel> | $Enums.platform_role
  }

  export type platform_usersCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    mfa_enabled?: SortOrder
    mfa_secret_encrypted?: SortOrder
    last_login_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type platform_usersMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    mfa_enabled?: SortOrder
    mfa_secret_encrypted?: SortOrder
    last_login_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type platform_usersMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    mfa_enabled?: SortOrder
    mfa_secret_encrypted?: SortOrder
    last_login_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type Enumplatform_roleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.platform_role | Enumplatform_roleFieldRefInput<$PrismaModel>
    in?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumplatform_roleWithAggregatesFilter<$PrismaModel> | $Enums.platform_role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumplatform_roleFilter<$PrismaModel>
    _max?: NestedEnumplatform_roleFilter<$PrismaModel>
  }

  export type Platform_usersNullableScalarRelationFilter = {
    is?: platform_usersWhereInput | null
    isNot?: platform_usersWhereInput | null
  }

  export type OperatorsNullableScalarRelationFilter = {
    is?: operatorsWhereInput | null
    isNot?: operatorsWhereInput | null
  }

  export type platform_audit_logsCountOrderByAggregateInput = {
    id?: SortOrder
    platform_user_id?: SortOrder
    operator_id?: SortOrder
    action?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrder
    metadata?: SortOrder
    created_at?: SortOrder
  }

  export type platform_audit_logsMaxOrderByAggregateInput = {
    id?: SortOrder
    platform_user_id?: SortOrder
    operator_id?: SortOrder
    action?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrder
    created_at?: SortOrder
  }

  export type platform_audit_logsMinOrderByAggregateInput = {
    id?: SortOrder
    platform_user_id?: SortOrder
    operator_id?: SortOrder
    action?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrder
    created_at?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type platform_settingsCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_base_domain?: SortOrder
    alert_email?: SortOrder
    rollup_schedule?: SortOrder
    smtp_host?: SortOrder
    smtp_port?: SortOrder
    smtp_user?: SortOrder
    updated_at?: SortOrder
  }

  export type platform_settingsAvgOrderByAggregateInput = {
    smtp_port?: SortOrder
  }

  export type platform_settingsMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_base_domain?: SortOrder
    alert_email?: SortOrder
    rollup_schedule?: SortOrder
    smtp_host?: SortOrder
    smtp_port?: SortOrder
    smtp_user?: SortOrder
    updated_at?: SortOrder
  }

  export type platform_settingsMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_base_domain?: SortOrder
    alert_email?: SortOrder
    rollup_schedule?: SortOrder
    smtp_host?: SortOrder
    smtp_port?: SortOrder
    smtp_user?: SortOrder
    updated_at?: SortOrder
  }

  export type platform_settingsSumOrderByAggregateInput = {
    smtp_port?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type tenant_daily_rollupsOperator_idDateCompoundUniqueInput = {
    operator_id: string
    date: Date | string
  }

  export type tenant_daily_rollupsCountOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    date?: SortOrder
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
    created_at?: SortOrder
  }

  export type tenant_daily_rollupsAvgOrderByAggregateInput = {
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
  }

  export type tenant_daily_rollupsMaxOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    date?: SortOrder
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
    created_at?: SortOrder
  }

  export type tenant_daily_rollupsMinOrderByAggregateInput = {
    id?: SortOrder
    operator_id?: SortOrder
    date?: SortOrder
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
    created_at?: SortOrder
  }

  export type tenant_daily_rollupsSumOrderByAggregateInput = {
    gross_sales?: SortOrder
    tax_collected?: SortOrder
    orders_count?: SortOrder
    active_raffles?: SortOrder
    failed_gra_events?: SortOrder
  }

  export type tenant_databasesCreateNestedOneWithoutOperatorInput = {
    create?: XOR<tenant_databasesCreateWithoutOperatorInput, tenant_databasesUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: tenant_databasesCreateOrConnectWithoutOperatorInput
    connect?: tenant_databasesWhereUniqueInput
  }

  export type operator_domainsCreateNestedManyWithoutOperatorInput = {
    create?: XOR<operator_domainsCreateWithoutOperatorInput, operator_domainsUncheckedCreateWithoutOperatorInput> | operator_domainsCreateWithoutOperatorInput[] | operator_domainsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: operator_domainsCreateOrConnectWithoutOperatorInput | operator_domainsCreateOrConnectWithoutOperatorInput[]
    createMany?: operator_domainsCreateManyOperatorInputEnvelope
    connect?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
  }

  export type operator_settingsCreateNestedOneWithoutOperatorInput = {
    create?: XOR<operator_settingsCreateWithoutOperatorInput, operator_settingsUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: operator_settingsCreateOrConnectWithoutOperatorInput
    connect?: operator_settingsWhereUniqueInput
  }

  export type platform_audit_logsCreateNestedManyWithoutOperatorInput = {
    create?: XOR<platform_audit_logsCreateWithoutOperatorInput, platform_audit_logsUncheckedCreateWithoutOperatorInput> | platform_audit_logsCreateWithoutOperatorInput[] | platform_audit_logsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutOperatorInput | platform_audit_logsCreateOrConnectWithoutOperatorInput[]
    createMany?: platform_audit_logsCreateManyOperatorInputEnvelope
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
  }

  export type tenant_daily_rollupsCreateNestedManyWithoutOperatorInput = {
    create?: XOR<tenant_daily_rollupsCreateWithoutOperatorInput, tenant_daily_rollupsUncheckedCreateWithoutOperatorInput> | tenant_daily_rollupsCreateWithoutOperatorInput[] | tenant_daily_rollupsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: tenant_daily_rollupsCreateOrConnectWithoutOperatorInput | tenant_daily_rollupsCreateOrConnectWithoutOperatorInput[]
    createMany?: tenant_daily_rollupsCreateManyOperatorInputEnvelope
    connect?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
  }

  export type tenant_databasesUncheckedCreateNestedOneWithoutOperatorInput = {
    create?: XOR<tenant_databasesCreateWithoutOperatorInput, tenant_databasesUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: tenant_databasesCreateOrConnectWithoutOperatorInput
    connect?: tenant_databasesWhereUniqueInput
  }

  export type operator_domainsUncheckedCreateNestedManyWithoutOperatorInput = {
    create?: XOR<operator_domainsCreateWithoutOperatorInput, operator_domainsUncheckedCreateWithoutOperatorInput> | operator_domainsCreateWithoutOperatorInput[] | operator_domainsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: operator_domainsCreateOrConnectWithoutOperatorInput | operator_domainsCreateOrConnectWithoutOperatorInput[]
    createMany?: operator_domainsCreateManyOperatorInputEnvelope
    connect?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
  }

  export type operator_settingsUncheckedCreateNestedOneWithoutOperatorInput = {
    create?: XOR<operator_settingsCreateWithoutOperatorInput, operator_settingsUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: operator_settingsCreateOrConnectWithoutOperatorInput
    connect?: operator_settingsWhereUniqueInput
  }

  export type platform_audit_logsUncheckedCreateNestedManyWithoutOperatorInput = {
    create?: XOR<platform_audit_logsCreateWithoutOperatorInput, platform_audit_logsUncheckedCreateWithoutOperatorInput> | platform_audit_logsCreateWithoutOperatorInput[] | platform_audit_logsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutOperatorInput | platform_audit_logsCreateOrConnectWithoutOperatorInput[]
    createMany?: platform_audit_logsCreateManyOperatorInputEnvelope
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
  }

  export type tenant_daily_rollupsUncheckedCreateNestedManyWithoutOperatorInput = {
    create?: XOR<tenant_daily_rollupsCreateWithoutOperatorInput, tenant_daily_rollupsUncheckedCreateWithoutOperatorInput> | tenant_daily_rollupsCreateWithoutOperatorInput[] | tenant_daily_rollupsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: tenant_daily_rollupsCreateOrConnectWithoutOperatorInput | tenant_daily_rollupsCreateOrConnectWithoutOperatorInput[]
    createMany?: tenant_daily_rollupsCreateManyOperatorInputEnvelope
    connect?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type Enumoperator_statusFieldUpdateOperationsInput = {
    set?: $Enums.operator_status
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type tenant_databasesUpdateOneWithoutOperatorNestedInput = {
    create?: XOR<tenant_databasesCreateWithoutOperatorInput, tenant_databasesUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: tenant_databasesCreateOrConnectWithoutOperatorInput
    upsert?: tenant_databasesUpsertWithoutOperatorInput
    disconnect?: tenant_databasesWhereInput | boolean
    delete?: tenant_databasesWhereInput | boolean
    connect?: tenant_databasesWhereUniqueInput
    update?: XOR<XOR<tenant_databasesUpdateToOneWithWhereWithoutOperatorInput, tenant_databasesUpdateWithoutOperatorInput>, tenant_databasesUncheckedUpdateWithoutOperatorInput>
  }

  export type operator_domainsUpdateManyWithoutOperatorNestedInput = {
    create?: XOR<operator_domainsCreateWithoutOperatorInput, operator_domainsUncheckedCreateWithoutOperatorInput> | operator_domainsCreateWithoutOperatorInput[] | operator_domainsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: operator_domainsCreateOrConnectWithoutOperatorInput | operator_domainsCreateOrConnectWithoutOperatorInput[]
    upsert?: operator_domainsUpsertWithWhereUniqueWithoutOperatorInput | operator_domainsUpsertWithWhereUniqueWithoutOperatorInput[]
    createMany?: operator_domainsCreateManyOperatorInputEnvelope
    set?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    disconnect?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    delete?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    connect?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    update?: operator_domainsUpdateWithWhereUniqueWithoutOperatorInput | operator_domainsUpdateWithWhereUniqueWithoutOperatorInput[]
    updateMany?: operator_domainsUpdateManyWithWhereWithoutOperatorInput | operator_domainsUpdateManyWithWhereWithoutOperatorInput[]
    deleteMany?: operator_domainsScalarWhereInput | operator_domainsScalarWhereInput[]
  }

  export type operator_settingsUpdateOneWithoutOperatorNestedInput = {
    create?: XOR<operator_settingsCreateWithoutOperatorInput, operator_settingsUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: operator_settingsCreateOrConnectWithoutOperatorInput
    upsert?: operator_settingsUpsertWithoutOperatorInput
    disconnect?: operator_settingsWhereInput | boolean
    delete?: operator_settingsWhereInput | boolean
    connect?: operator_settingsWhereUniqueInput
    update?: XOR<XOR<operator_settingsUpdateToOneWithWhereWithoutOperatorInput, operator_settingsUpdateWithoutOperatorInput>, operator_settingsUncheckedUpdateWithoutOperatorInput>
  }

  export type platform_audit_logsUpdateManyWithoutOperatorNestedInput = {
    create?: XOR<platform_audit_logsCreateWithoutOperatorInput, platform_audit_logsUncheckedCreateWithoutOperatorInput> | platform_audit_logsCreateWithoutOperatorInput[] | platform_audit_logsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutOperatorInput | platform_audit_logsCreateOrConnectWithoutOperatorInput[]
    upsert?: platform_audit_logsUpsertWithWhereUniqueWithoutOperatorInput | platform_audit_logsUpsertWithWhereUniqueWithoutOperatorInput[]
    createMany?: platform_audit_logsCreateManyOperatorInputEnvelope
    set?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    disconnect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    delete?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    update?: platform_audit_logsUpdateWithWhereUniqueWithoutOperatorInput | platform_audit_logsUpdateWithWhereUniqueWithoutOperatorInput[]
    updateMany?: platform_audit_logsUpdateManyWithWhereWithoutOperatorInput | platform_audit_logsUpdateManyWithWhereWithoutOperatorInput[]
    deleteMany?: platform_audit_logsScalarWhereInput | platform_audit_logsScalarWhereInput[]
  }

  export type tenant_daily_rollupsUpdateManyWithoutOperatorNestedInput = {
    create?: XOR<tenant_daily_rollupsCreateWithoutOperatorInput, tenant_daily_rollupsUncheckedCreateWithoutOperatorInput> | tenant_daily_rollupsCreateWithoutOperatorInput[] | tenant_daily_rollupsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: tenant_daily_rollupsCreateOrConnectWithoutOperatorInput | tenant_daily_rollupsCreateOrConnectWithoutOperatorInput[]
    upsert?: tenant_daily_rollupsUpsertWithWhereUniqueWithoutOperatorInput | tenant_daily_rollupsUpsertWithWhereUniqueWithoutOperatorInput[]
    createMany?: tenant_daily_rollupsCreateManyOperatorInputEnvelope
    set?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    disconnect?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    delete?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    connect?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    update?: tenant_daily_rollupsUpdateWithWhereUniqueWithoutOperatorInput | tenant_daily_rollupsUpdateWithWhereUniqueWithoutOperatorInput[]
    updateMany?: tenant_daily_rollupsUpdateManyWithWhereWithoutOperatorInput | tenant_daily_rollupsUpdateManyWithWhereWithoutOperatorInput[]
    deleteMany?: tenant_daily_rollupsScalarWhereInput | tenant_daily_rollupsScalarWhereInput[]
  }

  export type tenant_databasesUncheckedUpdateOneWithoutOperatorNestedInput = {
    create?: XOR<tenant_databasesCreateWithoutOperatorInput, tenant_databasesUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: tenant_databasesCreateOrConnectWithoutOperatorInput
    upsert?: tenant_databasesUpsertWithoutOperatorInput
    disconnect?: tenant_databasesWhereInput | boolean
    delete?: tenant_databasesWhereInput | boolean
    connect?: tenant_databasesWhereUniqueInput
    update?: XOR<XOR<tenant_databasesUpdateToOneWithWhereWithoutOperatorInput, tenant_databasesUpdateWithoutOperatorInput>, tenant_databasesUncheckedUpdateWithoutOperatorInput>
  }

  export type operator_domainsUncheckedUpdateManyWithoutOperatorNestedInput = {
    create?: XOR<operator_domainsCreateWithoutOperatorInput, operator_domainsUncheckedCreateWithoutOperatorInput> | operator_domainsCreateWithoutOperatorInput[] | operator_domainsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: operator_domainsCreateOrConnectWithoutOperatorInput | operator_domainsCreateOrConnectWithoutOperatorInput[]
    upsert?: operator_domainsUpsertWithWhereUniqueWithoutOperatorInput | operator_domainsUpsertWithWhereUniqueWithoutOperatorInput[]
    createMany?: operator_domainsCreateManyOperatorInputEnvelope
    set?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    disconnect?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    delete?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    connect?: operator_domainsWhereUniqueInput | operator_domainsWhereUniqueInput[]
    update?: operator_domainsUpdateWithWhereUniqueWithoutOperatorInput | operator_domainsUpdateWithWhereUniqueWithoutOperatorInput[]
    updateMany?: operator_domainsUpdateManyWithWhereWithoutOperatorInput | operator_domainsUpdateManyWithWhereWithoutOperatorInput[]
    deleteMany?: operator_domainsScalarWhereInput | operator_domainsScalarWhereInput[]
  }

  export type operator_settingsUncheckedUpdateOneWithoutOperatorNestedInput = {
    create?: XOR<operator_settingsCreateWithoutOperatorInput, operator_settingsUncheckedCreateWithoutOperatorInput>
    connectOrCreate?: operator_settingsCreateOrConnectWithoutOperatorInput
    upsert?: operator_settingsUpsertWithoutOperatorInput
    disconnect?: operator_settingsWhereInput | boolean
    delete?: operator_settingsWhereInput | boolean
    connect?: operator_settingsWhereUniqueInput
    update?: XOR<XOR<operator_settingsUpdateToOneWithWhereWithoutOperatorInput, operator_settingsUpdateWithoutOperatorInput>, operator_settingsUncheckedUpdateWithoutOperatorInput>
  }

  export type platform_audit_logsUncheckedUpdateManyWithoutOperatorNestedInput = {
    create?: XOR<platform_audit_logsCreateWithoutOperatorInput, platform_audit_logsUncheckedCreateWithoutOperatorInput> | platform_audit_logsCreateWithoutOperatorInput[] | platform_audit_logsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutOperatorInput | platform_audit_logsCreateOrConnectWithoutOperatorInput[]
    upsert?: platform_audit_logsUpsertWithWhereUniqueWithoutOperatorInput | platform_audit_logsUpsertWithWhereUniqueWithoutOperatorInput[]
    createMany?: platform_audit_logsCreateManyOperatorInputEnvelope
    set?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    disconnect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    delete?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    update?: platform_audit_logsUpdateWithWhereUniqueWithoutOperatorInput | platform_audit_logsUpdateWithWhereUniqueWithoutOperatorInput[]
    updateMany?: platform_audit_logsUpdateManyWithWhereWithoutOperatorInput | platform_audit_logsUpdateManyWithWhereWithoutOperatorInput[]
    deleteMany?: platform_audit_logsScalarWhereInput | platform_audit_logsScalarWhereInput[]
  }

  export type tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorNestedInput = {
    create?: XOR<tenant_daily_rollupsCreateWithoutOperatorInput, tenant_daily_rollupsUncheckedCreateWithoutOperatorInput> | tenant_daily_rollupsCreateWithoutOperatorInput[] | tenant_daily_rollupsUncheckedCreateWithoutOperatorInput[]
    connectOrCreate?: tenant_daily_rollupsCreateOrConnectWithoutOperatorInput | tenant_daily_rollupsCreateOrConnectWithoutOperatorInput[]
    upsert?: tenant_daily_rollupsUpsertWithWhereUniqueWithoutOperatorInput | tenant_daily_rollupsUpsertWithWhereUniqueWithoutOperatorInput[]
    createMany?: tenant_daily_rollupsCreateManyOperatorInputEnvelope
    set?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    disconnect?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    delete?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    connect?: tenant_daily_rollupsWhereUniqueInput | tenant_daily_rollupsWhereUniqueInput[]
    update?: tenant_daily_rollupsUpdateWithWhereUniqueWithoutOperatorInput | tenant_daily_rollupsUpdateWithWhereUniqueWithoutOperatorInput[]
    updateMany?: tenant_daily_rollupsUpdateManyWithWhereWithoutOperatorInput | tenant_daily_rollupsUpdateManyWithWhereWithoutOperatorInput[]
    deleteMany?: tenant_daily_rollupsScalarWhereInput | tenant_daily_rollupsScalarWhereInput[]
  }

  export type operatorsCreateNestedOneWithoutTenant_databaseInput = {
    create?: XOR<operatorsCreateWithoutTenant_databaseInput, operatorsUncheckedCreateWithoutTenant_databaseInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutTenant_databaseInput
    connect?: operatorsWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type Enumtenant_database_statusFieldUpdateOperationsInput = {
    set?: $Enums.tenant_database_status
  }

  export type operatorsUpdateOneRequiredWithoutTenant_databaseNestedInput = {
    create?: XOR<operatorsCreateWithoutTenant_databaseInput, operatorsUncheckedCreateWithoutTenant_databaseInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutTenant_databaseInput
    upsert?: operatorsUpsertWithoutTenant_databaseInput
    connect?: operatorsWhereUniqueInput
    update?: XOR<XOR<operatorsUpdateToOneWithWhereWithoutTenant_databaseInput, operatorsUpdateWithoutTenant_databaseInput>, operatorsUncheckedUpdateWithoutTenant_databaseInput>
  }

  export type operatorsCreateNestedOneWithoutDomainsInput = {
    create?: XOR<operatorsCreateWithoutDomainsInput, operatorsUncheckedCreateWithoutDomainsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutDomainsInput
    connect?: operatorsWhereUniqueInput
  }

  export type Enumdomain_typeFieldUpdateOperationsInput = {
    set?: $Enums.domain_type
  }

  export type Enumdomain_verification_statusFieldUpdateOperationsInput = {
    set?: $Enums.domain_verification_status
  }

  export type Enumssl_statusFieldUpdateOperationsInput = {
    set?: $Enums.ssl_status
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type operatorsUpdateOneRequiredWithoutDomainsNestedInput = {
    create?: XOR<operatorsCreateWithoutDomainsInput, operatorsUncheckedCreateWithoutDomainsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutDomainsInput
    upsert?: operatorsUpsertWithoutDomainsInput
    connect?: operatorsWhereUniqueInput
    update?: XOR<XOR<operatorsUpdateToOneWithWhereWithoutDomainsInput, operatorsUpdateWithoutDomainsInput>, operatorsUncheckedUpdateWithoutDomainsInput>
  }

  export type operatorsCreateNestedOneWithoutSettingsInput = {
    create?: XOR<operatorsCreateWithoutSettingsInput, operatorsUncheckedCreateWithoutSettingsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutSettingsInput
    connect?: operatorsWhereUniqueInput
  }

  export type Enumgra_application_statusFieldUpdateOperationsInput = {
    set?: $Enums.gra_application_status
  }

  export type operatorsUpdateOneRequiredWithoutSettingsNestedInput = {
    create?: XOR<operatorsCreateWithoutSettingsInput, operatorsUncheckedCreateWithoutSettingsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutSettingsInput
    upsert?: operatorsUpsertWithoutSettingsInput
    connect?: operatorsWhereUniqueInput
    update?: XOR<XOR<operatorsUpdateToOneWithWhereWithoutSettingsInput, operatorsUpdateWithoutSettingsInput>, operatorsUncheckedUpdateWithoutSettingsInput>
  }

  export type platform_audit_logsCreateNestedManyWithoutPlatform_userInput = {
    create?: XOR<platform_audit_logsCreateWithoutPlatform_userInput, platform_audit_logsUncheckedCreateWithoutPlatform_userInput> | platform_audit_logsCreateWithoutPlatform_userInput[] | platform_audit_logsUncheckedCreateWithoutPlatform_userInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutPlatform_userInput | platform_audit_logsCreateOrConnectWithoutPlatform_userInput[]
    createMany?: platform_audit_logsCreateManyPlatform_userInputEnvelope
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
  }

  export type platform_audit_logsUncheckedCreateNestedManyWithoutPlatform_userInput = {
    create?: XOR<platform_audit_logsCreateWithoutPlatform_userInput, platform_audit_logsUncheckedCreateWithoutPlatform_userInput> | platform_audit_logsCreateWithoutPlatform_userInput[] | platform_audit_logsUncheckedCreateWithoutPlatform_userInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutPlatform_userInput | platform_audit_logsCreateOrConnectWithoutPlatform_userInput[]
    createMany?: platform_audit_logsCreateManyPlatform_userInputEnvelope
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
  }

  export type Enumplatform_roleFieldUpdateOperationsInput = {
    set?: $Enums.platform_role
  }

  export type platform_audit_logsUpdateManyWithoutPlatform_userNestedInput = {
    create?: XOR<platform_audit_logsCreateWithoutPlatform_userInput, platform_audit_logsUncheckedCreateWithoutPlatform_userInput> | platform_audit_logsCreateWithoutPlatform_userInput[] | platform_audit_logsUncheckedCreateWithoutPlatform_userInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutPlatform_userInput | platform_audit_logsCreateOrConnectWithoutPlatform_userInput[]
    upsert?: platform_audit_logsUpsertWithWhereUniqueWithoutPlatform_userInput | platform_audit_logsUpsertWithWhereUniqueWithoutPlatform_userInput[]
    createMany?: platform_audit_logsCreateManyPlatform_userInputEnvelope
    set?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    disconnect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    delete?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    update?: platform_audit_logsUpdateWithWhereUniqueWithoutPlatform_userInput | platform_audit_logsUpdateWithWhereUniqueWithoutPlatform_userInput[]
    updateMany?: platform_audit_logsUpdateManyWithWhereWithoutPlatform_userInput | platform_audit_logsUpdateManyWithWhereWithoutPlatform_userInput[]
    deleteMany?: platform_audit_logsScalarWhereInput | platform_audit_logsScalarWhereInput[]
  }

  export type platform_audit_logsUncheckedUpdateManyWithoutPlatform_userNestedInput = {
    create?: XOR<platform_audit_logsCreateWithoutPlatform_userInput, platform_audit_logsUncheckedCreateWithoutPlatform_userInput> | platform_audit_logsCreateWithoutPlatform_userInput[] | platform_audit_logsUncheckedCreateWithoutPlatform_userInput[]
    connectOrCreate?: platform_audit_logsCreateOrConnectWithoutPlatform_userInput | platform_audit_logsCreateOrConnectWithoutPlatform_userInput[]
    upsert?: platform_audit_logsUpsertWithWhereUniqueWithoutPlatform_userInput | platform_audit_logsUpsertWithWhereUniqueWithoutPlatform_userInput[]
    createMany?: platform_audit_logsCreateManyPlatform_userInputEnvelope
    set?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    disconnect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    delete?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    connect?: platform_audit_logsWhereUniqueInput | platform_audit_logsWhereUniqueInput[]
    update?: platform_audit_logsUpdateWithWhereUniqueWithoutPlatform_userInput | platform_audit_logsUpdateWithWhereUniqueWithoutPlatform_userInput[]
    updateMany?: platform_audit_logsUpdateManyWithWhereWithoutPlatform_userInput | platform_audit_logsUpdateManyWithWhereWithoutPlatform_userInput[]
    deleteMany?: platform_audit_logsScalarWhereInput | platform_audit_logsScalarWhereInput[]
  }

  export type platform_usersCreateNestedOneWithoutAudit_logsInput = {
    create?: XOR<platform_usersCreateWithoutAudit_logsInput, platform_usersUncheckedCreateWithoutAudit_logsInput>
    connectOrCreate?: platform_usersCreateOrConnectWithoutAudit_logsInput
    connect?: platform_usersWhereUniqueInput
  }

  export type operatorsCreateNestedOneWithoutAudit_logsInput = {
    create?: XOR<operatorsCreateWithoutAudit_logsInput, operatorsUncheckedCreateWithoutAudit_logsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutAudit_logsInput
    connect?: operatorsWhereUniqueInput
  }

  export type platform_usersUpdateOneWithoutAudit_logsNestedInput = {
    create?: XOR<platform_usersCreateWithoutAudit_logsInput, platform_usersUncheckedCreateWithoutAudit_logsInput>
    connectOrCreate?: platform_usersCreateOrConnectWithoutAudit_logsInput
    upsert?: platform_usersUpsertWithoutAudit_logsInput
    disconnect?: platform_usersWhereInput | boolean
    delete?: platform_usersWhereInput | boolean
    connect?: platform_usersWhereUniqueInput
    update?: XOR<XOR<platform_usersUpdateToOneWithWhereWithoutAudit_logsInput, platform_usersUpdateWithoutAudit_logsInput>, platform_usersUncheckedUpdateWithoutAudit_logsInput>
  }

  export type operatorsUpdateOneWithoutAudit_logsNestedInput = {
    create?: XOR<operatorsCreateWithoutAudit_logsInput, operatorsUncheckedCreateWithoutAudit_logsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutAudit_logsInput
    upsert?: operatorsUpsertWithoutAudit_logsInput
    disconnect?: operatorsWhereInput | boolean
    delete?: operatorsWhereInput | boolean
    connect?: operatorsWhereUniqueInput
    update?: XOR<XOR<operatorsUpdateToOneWithWhereWithoutAudit_logsInput, operatorsUpdateWithoutAudit_logsInput>, operatorsUncheckedUpdateWithoutAudit_logsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type operatorsCreateNestedOneWithoutRollupsInput = {
    create?: XOR<operatorsCreateWithoutRollupsInput, operatorsUncheckedCreateWithoutRollupsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutRollupsInput
    connect?: operatorsWhereUniqueInput
  }

  export type operatorsUpdateOneRequiredWithoutRollupsNestedInput = {
    create?: XOR<operatorsCreateWithoutRollupsInput, operatorsUncheckedCreateWithoutRollupsInput>
    connectOrCreate?: operatorsCreateOrConnectWithoutRollupsInput
    upsert?: operatorsUpsertWithoutRollupsInput
    connect?: operatorsWhereUniqueInput
    update?: XOR<XOR<operatorsUpdateToOneWithWhereWithoutRollupsInput, operatorsUpdateWithoutRollupsInput>, operatorsUncheckedUpdateWithoutRollupsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumoperator_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.operator_status | Enumoperator_statusFieldRefInput<$PrismaModel>
    in?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumoperator_statusFilter<$PrismaModel> | $Enums.operator_status
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumoperator_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.operator_status | Enumoperator_statusFieldRefInput<$PrismaModel>
    in?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.operator_status[] | ListEnumoperator_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumoperator_statusWithAggregatesFilter<$PrismaModel> | $Enums.operator_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumoperator_statusFilter<$PrismaModel>
    _max?: NestedEnumoperator_statusFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumtenant_database_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.tenant_database_status | Enumtenant_database_statusFieldRefInput<$PrismaModel>
    in?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumtenant_database_statusFilter<$PrismaModel> | $Enums.tenant_database_status
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumtenant_database_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.tenant_database_status | Enumtenant_database_statusFieldRefInput<$PrismaModel>
    in?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.tenant_database_status[] | ListEnumtenant_database_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumtenant_database_statusWithAggregatesFilter<$PrismaModel> | $Enums.tenant_database_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumtenant_database_statusFilter<$PrismaModel>
    _max?: NestedEnumtenant_database_statusFilter<$PrismaModel>
  }

  export type NestedEnumdomain_typeFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_type | Enumdomain_typeFieldRefInput<$PrismaModel>
    in?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_typeFilter<$PrismaModel> | $Enums.domain_type
  }

  export type NestedEnumdomain_verification_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_verification_status | Enumdomain_verification_statusFieldRefInput<$PrismaModel>
    in?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_verification_statusFilter<$PrismaModel> | $Enums.domain_verification_status
  }

  export type NestedEnumssl_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.ssl_status | Enumssl_statusFieldRefInput<$PrismaModel>
    in?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumssl_statusFilter<$PrismaModel> | $Enums.ssl_status
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumdomain_typeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_type | Enumdomain_typeFieldRefInput<$PrismaModel>
    in?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_type[] | ListEnumdomain_typeFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_typeWithAggregatesFilter<$PrismaModel> | $Enums.domain_type
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumdomain_typeFilter<$PrismaModel>
    _max?: NestedEnumdomain_typeFilter<$PrismaModel>
  }

  export type NestedEnumdomain_verification_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.domain_verification_status | Enumdomain_verification_statusFieldRefInput<$PrismaModel>
    in?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.domain_verification_status[] | ListEnumdomain_verification_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumdomain_verification_statusWithAggregatesFilter<$PrismaModel> | $Enums.domain_verification_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumdomain_verification_statusFilter<$PrismaModel>
    _max?: NestedEnumdomain_verification_statusFilter<$PrismaModel>
  }

  export type NestedEnumssl_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ssl_status | Enumssl_statusFieldRefInput<$PrismaModel>
    in?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ssl_status[] | ListEnumssl_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumssl_statusWithAggregatesFilter<$PrismaModel> | $Enums.ssl_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumssl_statusFilter<$PrismaModel>
    _max?: NestedEnumssl_statusFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumgra_application_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.gra_application_status | Enumgra_application_statusFieldRefInput<$PrismaModel>
    in?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumgra_application_statusFilter<$PrismaModel> | $Enums.gra_application_status
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumgra_application_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.gra_application_status | Enumgra_application_statusFieldRefInput<$PrismaModel>
    in?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    notIn?: $Enums.gra_application_status[] | ListEnumgra_application_statusFieldRefInput<$PrismaModel>
    not?: NestedEnumgra_application_statusWithAggregatesFilter<$PrismaModel> | $Enums.gra_application_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumgra_application_statusFilter<$PrismaModel>
    _max?: NestedEnumgra_application_statusFilter<$PrismaModel>
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumplatform_roleFilter<$PrismaModel = never> = {
    equals?: $Enums.platform_role | Enumplatform_roleFieldRefInput<$PrismaModel>
    in?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumplatform_roleFilter<$PrismaModel> | $Enums.platform_role
  }

  export type NestedEnumplatform_roleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.platform_role | Enumplatform_roleFieldRefInput<$PrismaModel>
    in?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.platform_role[] | ListEnumplatform_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumplatform_roleWithAggregatesFilter<$PrismaModel> | $Enums.platform_role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumplatform_roleFilter<$PrismaModel>
    _max?: NestedEnumplatform_roleFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type tenant_databasesCreateWithoutOperatorInput = {
    id?: string
    database_name: string
    database_host: string
    database_port: number
    database_user: string
    database_password_encrypted: string
    connection_url_encrypted: string
    schema_version?: string
    provisioned_at?: Date | string | null
    provision_error?: string | null
    status?: $Enums.tenant_database_status
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tenant_databasesUncheckedCreateWithoutOperatorInput = {
    id?: string
    database_name: string
    database_host: string
    database_port: number
    database_user: string
    database_password_encrypted: string
    connection_url_encrypted: string
    schema_version?: string
    provisioned_at?: Date | string | null
    provision_error?: string | null
    status?: $Enums.tenant_database_status
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tenant_databasesCreateOrConnectWithoutOperatorInput = {
    where: tenant_databasesWhereUniqueInput
    create: XOR<tenant_databasesCreateWithoutOperatorInput, tenant_databasesUncheckedCreateWithoutOperatorInput>
  }

  export type operator_domainsCreateWithoutOperatorInput = {
    id?: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status?: $Enums.domain_verification_status
    ssl_status?: $Enums.ssl_status
    is_primary?: boolean
    created_at?: Date | string
  }

  export type operator_domainsUncheckedCreateWithoutOperatorInput = {
    id?: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status?: $Enums.domain_verification_status
    ssl_status?: $Enums.ssl_status
    is_primary?: boolean
    created_at?: Date | string
  }

  export type operator_domainsCreateOrConnectWithoutOperatorInput = {
    where: operator_domainsWhereUniqueInput
    create: XOR<operator_domainsCreateWithoutOperatorInput, operator_domainsUncheckedCreateWithoutOperatorInput>
  }

  export type operator_domainsCreateManyOperatorInputEnvelope = {
    data: operator_domainsCreateManyOperatorInput | operator_domainsCreateManyOperatorInput[]
    skipDuplicates?: boolean
  }

  export type operator_settingsCreateWithoutOperatorInput = {
    id?: string
    logo_url?: string | null
    primary_color?: string | null
    support_email?: string | null
    footer_licence_text?: string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: string | null
    gra_hmac_secret_encrypted?: string | null
    gra_last_heartbeat_at?: Date | string | null
    gra_last_heartbeat_status?: string | null
    gra_last_heartbeat_error?: string | null
    payment_merchant_ref_encrypted?: string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: string | null
    facebook_pixel_id?: string | null
    analytics_enabled?: boolean
    faq_text?: string | null
    terms_text?: string | null
    privacy_text?: string | null
    legal_name?: string | null
    trading_name?: string | null
    registration_number?: string | null
    kra_pin?: string | null
    beneficial_owner?: string | null
    business_email?: string | null
    business_phone?: string | null
    county?: string | null
    region?: string | null
    website?: string | null
    legal_profile_locked_at?: Date | string | null
    gra_application_status?: $Enums.gra_application_status
    gra_application_id?: string | null
    gra_application_submitted_at?: Date | string | null
    gra_approved_at?: Date | string | null
    gra_rejection_reason?: string | null
    provision_owner_email?: string | null
    provision_owner_password_encrypted?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type operator_settingsUncheckedCreateWithoutOperatorInput = {
    id?: string
    logo_url?: string | null
    primary_color?: string | null
    support_email?: string | null
    footer_licence_text?: string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: string | null
    gra_hmac_secret_encrypted?: string | null
    gra_last_heartbeat_at?: Date | string | null
    gra_last_heartbeat_status?: string | null
    gra_last_heartbeat_error?: string | null
    payment_merchant_ref_encrypted?: string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: string | null
    facebook_pixel_id?: string | null
    analytics_enabled?: boolean
    faq_text?: string | null
    terms_text?: string | null
    privacy_text?: string | null
    legal_name?: string | null
    trading_name?: string | null
    registration_number?: string | null
    kra_pin?: string | null
    beneficial_owner?: string | null
    business_email?: string | null
    business_phone?: string | null
    county?: string | null
    region?: string | null
    website?: string | null
    legal_profile_locked_at?: Date | string | null
    gra_application_status?: $Enums.gra_application_status
    gra_application_id?: string | null
    gra_application_submitted_at?: Date | string | null
    gra_approved_at?: Date | string | null
    gra_rejection_reason?: string | null
    provision_owner_email?: string | null
    provision_owner_password_encrypted?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type operator_settingsCreateOrConnectWithoutOperatorInput = {
    where: operator_settingsWhereUniqueInput
    create: XOR<operator_settingsCreateWithoutOperatorInput, operator_settingsUncheckedCreateWithoutOperatorInput>
  }

  export type platform_audit_logsCreateWithoutOperatorInput = {
    id?: string
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    platform_user?: platform_usersCreateNestedOneWithoutAudit_logsInput
  }

  export type platform_audit_logsUncheckedCreateWithoutOperatorInput = {
    id?: string
    platform_user_id?: string | null
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type platform_audit_logsCreateOrConnectWithoutOperatorInput = {
    where: platform_audit_logsWhereUniqueInput
    create: XOR<platform_audit_logsCreateWithoutOperatorInput, platform_audit_logsUncheckedCreateWithoutOperatorInput>
  }

  export type platform_audit_logsCreateManyOperatorInputEnvelope = {
    data: platform_audit_logsCreateManyOperatorInput | platform_audit_logsCreateManyOperatorInput[]
    skipDuplicates?: boolean
  }

  export type tenant_daily_rollupsCreateWithoutOperatorInput = {
    id?: string
    date: Date | string
    gross_sales?: Decimal | DecimalJsLike | number | string
    tax_collected?: Decimal | DecimalJsLike | number | string
    orders_count?: number
    active_raffles?: number
    failed_gra_events?: number
    created_at?: Date | string
  }

  export type tenant_daily_rollupsUncheckedCreateWithoutOperatorInput = {
    id?: string
    date: Date | string
    gross_sales?: Decimal | DecimalJsLike | number | string
    tax_collected?: Decimal | DecimalJsLike | number | string
    orders_count?: number
    active_raffles?: number
    failed_gra_events?: number
    created_at?: Date | string
  }

  export type tenant_daily_rollupsCreateOrConnectWithoutOperatorInput = {
    where: tenant_daily_rollupsWhereUniqueInput
    create: XOR<tenant_daily_rollupsCreateWithoutOperatorInput, tenant_daily_rollupsUncheckedCreateWithoutOperatorInput>
  }

  export type tenant_daily_rollupsCreateManyOperatorInputEnvelope = {
    data: tenant_daily_rollupsCreateManyOperatorInput | tenant_daily_rollupsCreateManyOperatorInput[]
    skipDuplicates?: boolean
  }

  export type tenant_databasesUpsertWithoutOperatorInput = {
    update: XOR<tenant_databasesUpdateWithoutOperatorInput, tenant_databasesUncheckedUpdateWithoutOperatorInput>
    create: XOR<tenant_databasesCreateWithoutOperatorInput, tenant_databasesUncheckedCreateWithoutOperatorInput>
    where?: tenant_databasesWhereInput
  }

  export type tenant_databasesUpdateToOneWithWhereWithoutOperatorInput = {
    where?: tenant_databasesWhereInput
    data: XOR<tenant_databasesUpdateWithoutOperatorInput, tenant_databasesUncheckedUpdateWithoutOperatorInput>
  }

  export type tenant_databasesUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    database_name?: StringFieldUpdateOperationsInput | string
    database_host?: StringFieldUpdateOperationsInput | string
    database_port?: IntFieldUpdateOperationsInput | number
    database_user?: StringFieldUpdateOperationsInput | string
    database_password_encrypted?: StringFieldUpdateOperationsInput | string
    connection_url_encrypted?: StringFieldUpdateOperationsInput | string
    schema_version?: StringFieldUpdateOperationsInput | string
    provisioned_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    provision_error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: Enumtenant_database_statusFieldUpdateOperationsInput | $Enums.tenant_database_status
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_databasesUncheckedUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    database_name?: StringFieldUpdateOperationsInput | string
    database_host?: StringFieldUpdateOperationsInput | string
    database_port?: IntFieldUpdateOperationsInput | number
    database_user?: StringFieldUpdateOperationsInput | string
    database_password_encrypted?: StringFieldUpdateOperationsInput | string
    connection_url_encrypted?: StringFieldUpdateOperationsInput | string
    schema_version?: StringFieldUpdateOperationsInput | string
    provisioned_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    provision_error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: Enumtenant_database_statusFieldUpdateOperationsInput | $Enums.tenant_database_status
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_domainsUpsertWithWhereUniqueWithoutOperatorInput = {
    where: operator_domainsWhereUniqueInput
    update: XOR<operator_domainsUpdateWithoutOperatorInput, operator_domainsUncheckedUpdateWithoutOperatorInput>
    create: XOR<operator_domainsCreateWithoutOperatorInput, operator_domainsUncheckedCreateWithoutOperatorInput>
  }

  export type operator_domainsUpdateWithWhereUniqueWithoutOperatorInput = {
    where: operator_domainsWhereUniqueInput
    data: XOR<operator_domainsUpdateWithoutOperatorInput, operator_domainsUncheckedUpdateWithoutOperatorInput>
  }

  export type operator_domainsUpdateManyWithWhereWithoutOperatorInput = {
    where: operator_domainsScalarWhereInput
    data: XOR<operator_domainsUpdateManyMutationInput, operator_domainsUncheckedUpdateManyWithoutOperatorInput>
  }

  export type operator_domainsScalarWhereInput = {
    AND?: operator_domainsScalarWhereInput | operator_domainsScalarWhereInput[]
    OR?: operator_domainsScalarWhereInput[]
    NOT?: operator_domainsScalarWhereInput | operator_domainsScalarWhereInput[]
    id?: UuidFilter<"operator_domains"> | string
    operator_id?: UuidFilter<"operator_domains"> | string
    hostname?: StringFilter<"operator_domains"> | string
    domain_type?: Enumdomain_typeFilter<"operator_domains"> | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFilter<"operator_domains"> | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFilter<"operator_domains"> | $Enums.ssl_status
    is_primary?: BoolFilter<"operator_domains"> | boolean
    created_at?: DateTimeFilter<"operator_domains"> | Date | string
  }

  export type operator_settingsUpsertWithoutOperatorInput = {
    update: XOR<operator_settingsUpdateWithoutOperatorInput, operator_settingsUncheckedUpdateWithoutOperatorInput>
    create: XOR<operator_settingsCreateWithoutOperatorInput, operator_settingsUncheckedCreateWithoutOperatorInput>
    where?: operator_settingsWhereInput
  }

  export type operator_settingsUpdateToOneWithWhereWithoutOperatorInput = {
    where?: operator_settingsWhereInput
    data: XOR<operator_settingsUpdateWithoutOperatorInput, operator_settingsUncheckedUpdateWithoutOperatorInput>
  }

  export type operator_settingsUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    support_email?: NullableStringFieldUpdateOperationsInput | string | null
    footer_licence_text?: NullableStringFieldUpdateOperationsInput | string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_hmac_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_last_heartbeat_status?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_error?: NullableStringFieldUpdateOperationsInput | string | null
    payment_merchant_ref_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: NullableStringFieldUpdateOperationsInput | string | null
    facebook_pixel_id?: NullableStringFieldUpdateOperationsInput | string | null
    analytics_enabled?: BoolFieldUpdateOperationsInput | boolean
    faq_text?: NullableStringFieldUpdateOperationsInput | string | null
    terms_text?: NullableStringFieldUpdateOperationsInput | string | null
    privacy_text?: NullableStringFieldUpdateOperationsInput | string | null
    legal_name?: NullableStringFieldUpdateOperationsInput | string | null
    trading_name?: NullableStringFieldUpdateOperationsInput | string | null
    registration_number?: NullableStringFieldUpdateOperationsInput | string | null
    kra_pin?: NullableStringFieldUpdateOperationsInput | string | null
    beneficial_owner?: NullableStringFieldUpdateOperationsInput | string | null
    business_email?: NullableStringFieldUpdateOperationsInput | string | null
    business_phone?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    legal_profile_locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_application_status?: Enumgra_application_statusFieldUpdateOperationsInput | $Enums.gra_application_status
    gra_application_id?: NullableStringFieldUpdateOperationsInput | string | null
    gra_application_submitted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_approved_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_rejection_reason?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_email?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_password_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_settingsUncheckedUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    support_email?: NullableStringFieldUpdateOperationsInput | string | null
    footer_licence_text?: NullableStringFieldUpdateOperationsInput | string | null
    social_links?: NullableJsonNullValueInput | InputJsonValue
    gra_api_key_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_hmac_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_last_heartbeat_status?: NullableStringFieldUpdateOperationsInput | string | null
    gra_last_heartbeat_error?: NullableStringFieldUpdateOperationsInput | string | null
    payment_merchant_ref_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    feature_flags?: JsonNullValueInput | InputJsonValue
    ga4_measurement_id?: NullableStringFieldUpdateOperationsInput | string | null
    facebook_pixel_id?: NullableStringFieldUpdateOperationsInput | string | null
    analytics_enabled?: BoolFieldUpdateOperationsInput | boolean
    faq_text?: NullableStringFieldUpdateOperationsInput | string | null
    terms_text?: NullableStringFieldUpdateOperationsInput | string | null
    privacy_text?: NullableStringFieldUpdateOperationsInput | string | null
    legal_name?: NullableStringFieldUpdateOperationsInput | string | null
    trading_name?: NullableStringFieldUpdateOperationsInput | string | null
    registration_number?: NullableStringFieldUpdateOperationsInput | string | null
    kra_pin?: NullableStringFieldUpdateOperationsInput | string | null
    beneficial_owner?: NullableStringFieldUpdateOperationsInput | string | null
    business_email?: NullableStringFieldUpdateOperationsInput | string | null
    business_phone?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    legal_profile_locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_application_status?: Enumgra_application_statusFieldUpdateOperationsInput | $Enums.gra_application_status
    gra_application_id?: NullableStringFieldUpdateOperationsInput | string | null
    gra_application_submitted_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_approved_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    gra_rejection_reason?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_email?: NullableStringFieldUpdateOperationsInput | string | null
    provision_owner_password_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsUpsertWithWhereUniqueWithoutOperatorInput = {
    where: platform_audit_logsWhereUniqueInput
    update: XOR<platform_audit_logsUpdateWithoutOperatorInput, platform_audit_logsUncheckedUpdateWithoutOperatorInput>
    create: XOR<platform_audit_logsCreateWithoutOperatorInput, platform_audit_logsUncheckedCreateWithoutOperatorInput>
  }

  export type platform_audit_logsUpdateWithWhereUniqueWithoutOperatorInput = {
    where: platform_audit_logsWhereUniqueInput
    data: XOR<platform_audit_logsUpdateWithoutOperatorInput, platform_audit_logsUncheckedUpdateWithoutOperatorInput>
  }

  export type platform_audit_logsUpdateManyWithWhereWithoutOperatorInput = {
    where: platform_audit_logsScalarWhereInput
    data: XOR<platform_audit_logsUpdateManyMutationInput, platform_audit_logsUncheckedUpdateManyWithoutOperatorInput>
  }

  export type platform_audit_logsScalarWhereInput = {
    AND?: platform_audit_logsScalarWhereInput | platform_audit_logsScalarWhereInput[]
    OR?: platform_audit_logsScalarWhereInput[]
    NOT?: platform_audit_logsScalarWhereInput | platform_audit_logsScalarWhereInput[]
    id?: UuidFilter<"platform_audit_logs"> | string
    platform_user_id?: UuidNullableFilter<"platform_audit_logs"> | string | null
    operator_id?: UuidNullableFilter<"platform_audit_logs"> | string | null
    action?: StringFilter<"platform_audit_logs"> | string
    entity_type?: StringFilter<"platform_audit_logs"> | string
    entity_id?: StringNullableFilter<"platform_audit_logs"> | string | null
    metadata?: JsonNullableFilter<"platform_audit_logs">
    created_at?: DateTimeFilter<"platform_audit_logs"> | Date | string
  }

  export type tenant_daily_rollupsUpsertWithWhereUniqueWithoutOperatorInput = {
    where: tenant_daily_rollupsWhereUniqueInput
    update: XOR<tenant_daily_rollupsUpdateWithoutOperatorInput, tenant_daily_rollupsUncheckedUpdateWithoutOperatorInput>
    create: XOR<tenant_daily_rollupsCreateWithoutOperatorInput, tenant_daily_rollupsUncheckedCreateWithoutOperatorInput>
  }

  export type tenant_daily_rollupsUpdateWithWhereUniqueWithoutOperatorInput = {
    where: tenant_daily_rollupsWhereUniqueInput
    data: XOR<tenant_daily_rollupsUpdateWithoutOperatorInput, tenant_daily_rollupsUncheckedUpdateWithoutOperatorInput>
  }

  export type tenant_daily_rollupsUpdateManyWithWhereWithoutOperatorInput = {
    where: tenant_daily_rollupsScalarWhereInput
    data: XOR<tenant_daily_rollupsUpdateManyMutationInput, tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorInput>
  }

  export type tenant_daily_rollupsScalarWhereInput = {
    AND?: tenant_daily_rollupsScalarWhereInput | tenant_daily_rollupsScalarWhereInput[]
    OR?: tenant_daily_rollupsScalarWhereInput[]
    NOT?: tenant_daily_rollupsScalarWhereInput | tenant_daily_rollupsScalarWhereInput[]
    id?: UuidFilter<"tenant_daily_rollups"> | string
    operator_id?: UuidFilter<"tenant_daily_rollups"> | string
    date?: DateTimeFilter<"tenant_daily_rollups"> | Date | string
    gross_sales?: DecimalFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFilter<"tenant_daily_rollups"> | Decimal | DecimalJsLike | number | string
    orders_count?: IntFilter<"tenant_daily_rollups"> | number
    active_raffles?: IntFilter<"tenant_daily_rollups"> | number
    failed_gra_events?: IntFilter<"tenant_daily_rollups"> | number
    created_at?: DateTimeFilter<"tenant_daily_rollups"> | Date | string
  }

  export type operatorsCreateWithoutTenant_databaseInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    domains?: operator_domainsCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUncheckedCreateWithoutTenant_databaseInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    domains?: operator_domainsUncheckedCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsUncheckedCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsUncheckedCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsUncheckedCreateNestedManyWithoutOperatorInput
  }

  export type operatorsCreateOrConnectWithoutTenant_databaseInput = {
    where: operatorsWhereUniqueInput
    create: XOR<operatorsCreateWithoutTenant_databaseInput, operatorsUncheckedCreateWithoutTenant_databaseInput>
  }

  export type operatorsUpsertWithoutTenant_databaseInput = {
    update: XOR<operatorsUpdateWithoutTenant_databaseInput, operatorsUncheckedUpdateWithoutTenant_databaseInput>
    create: XOR<operatorsCreateWithoutTenant_databaseInput, operatorsUncheckedCreateWithoutTenant_databaseInput>
    where?: operatorsWhereInput
  }

  export type operatorsUpdateToOneWithWhereWithoutTenant_databaseInput = {
    where?: operatorsWhereInput
    data: XOR<operatorsUpdateWithoutTenant_databaseInput, operatorsUncheckedUpdateWithoutTenant_databaseInput>
  }

  export type operatorsUpdateWithoutTenant_databaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    domains?: operator_domainsUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsUncheckedUpdateWithoutTenant_databaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    domains?: operator_domainsUncheckedUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUncheckedUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUncheckedUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsCreateWithoutDomainsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesCreateNestedOneWithoutOperatorInput
    settings?: operator_settingsCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUncheckedCreateWithoutDomainsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesUncheckedCreateNestedOneWithoutOperatorInput
    settings?: operator_settingsUncheckedCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsUncheckedCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsUncheckedCreateNestedManyWithoutOperatorInput
  }

  export type operatorsCreateOrConnectWithoutDomainsInput = {
    where: operatorsWhereUniqueInput
    create: XOR<operatorsCreateWithoutDomainsInput, operatorsUncheckedCreateWithoutDomainsInput>
  }

  export type operatorsUpsertWithoutDomainsInput = {
    update: XOR<operatorsUpdateWithoutDomainsInput, operatorsUncheckedUpdateWithoutDomainsInput>
    create: XOR<operatorsCreateWithoutDomainsInput, operatorsUncheckedCreateWithoutDomainsInput>
    where?: operatorsWhereInput
  }

  export type operatorsUpdateToOneWithWhereWithoutDomainsInput = {
    where?: operatorsWhereInput
    data: XOR<operatorsUpdateWithoutDomainsInput, operatorsUncheckedUpdateWithoutDomainsInput>
  }

  export type operatorsUpdateWithoutDomainsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUpdateOneWithoutOperatorNestedInput
    settings?: operator_settingsUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsUncheckedUpdateWithoutDomainsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUncheckedUpdateOneWithoutOperatorNestedInput
    settings?: operator_settingsUncheckedUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUncheckedUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsCreateWithoutSettingsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsCreateNestedManyWithoutOperatorInput
    audit_logs?: platform_audit_logsCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUncheckedCreateWithoutSettingsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesUncheckedCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsUncheckedCreateNestedManyWithoutOperatorInput
    audit_logs?: platform_audit_logsUncheckedCreateNestedManyWithoutOperatorInput
    rollups?: tenant_daily_rollupsUncheckedCreateNestedManyWithoutOperatorInput
  }

  export type operatorsCreateOrConnectWithoutSettingsInput = {
    where: operatorsWhereUniqueInput
    create: XOR<operatorsCreateWithoutSettingsInput, operatorsUncheckedCreateWithoutSettingsInput>
  }

  export type operatorsUpsertWithoutSettingsInput = {
    update: XOR<operatorsUpdateWithoutSettingsInput, operatorsUncheckedUpdateWithoutSettingsInput>
    create: XOR<operatorsCreateWithoutSettingsInput, operatorsUncheckedCreateWithoutSettingsInput>
    where?: operatorsWhereInput
  }

  export type operatorsUpdateToOneWithWhereWithoutSettingsInput = {
    where?: operatorsWhereInput
    data: XOR<operatorsUpdateWithoutSettingsInput, operatorsUncheckedUpdateWithoutSettingsInput>
  }

  export type operatorsUpdateWithoutSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUpdateManyWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsUncheckedUpdateWithoutSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUncheckedUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUncheckedUpdateManyWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUncheckedUpdateManyWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorNestedInput
  }

  export type platform_audit_logsCreateWithoutPlatform_userInput = {
    id?: string
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    operator?: operatorsCreateNestedOneWithoutAudit_logsInput
  }

  export type platform_audit_logsUncheckedCreateWithoutPlatform_userInput = {
    id?: string
    operator_id?: string | null
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type platform_audit_logsCreateOrConnectWithoutPlatform_userInput = {
    where: platform_audit_logsWhereUniqueInput
    create: XOR<platform_audit_logsCreateWithoutPlatform_userInput, platform_audit_logsUncheckedCreateWithoutPlatform_userInput>
  }

  export type platform_audit_logsCreateManyPlatform_userInputEnvelope = {
    data: platform_audit_logsCreateManyPlatform_userInput | platform_audit_logsCreateManyPlatform_userInput[]
    skipDuplicates?: boolean
  }

  export type platform_audit_logsUpsertWithWhereUniqueWithoutPlatform_userInput = {
    where: platform_audit_logsWhereUniqueInput
    update: XOR<platform_audit_logsUpdateWithoutPlatform_userInput, platform_audit_logsUncheckedUpdateWithoutPlatform_userInput>
    create: XOR<platform_audit_logsCreateWithoutPlatform_userInput, platform_audit_logsUncheckedCreateWithoutPlatform_userInput>
  }

  export type platform_audit_logsUpdateWithWhereUniqueWithoutPlatform_userInput = {
    where: platform_audit_logsWhereUniqueInput
    data: XOR<platform_audit_logsUpdateWithoutPlatform_userInput, platform_audit_logsUncheckedUpdateWithoutPlatform_userInput>
  }

  export type platform_audit_logsUpdateManyWithWhereWithoutPlatform_userInput = {
    where: platform_audit_logsScalarWhereInput
    data: XOR<platform_audit_logsUpdateManyMutationInput, platform_audit_logsUncheckedUpdateManyWithoutPlatform_userInput>
  }

  export type platform_usersCreateWithoutAudit_logsInput = {
    id?: string
    email: string
    password_hash: string
    role?: $Enums.platform_role
    mfa_enabled?: boolean
    mfa_secret_encrypted?: string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type platform_usersUncheckedCreateWithoutAudit_logsInput = {
    id?: string
    email: string
    password_hash: string
    role?: $Enums.platform_role
    mfa_enabled?: boolean
    mfa_secret_encrypted?: string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type platform_usersCreateOrConnectWithoutAudit_logsInput = {
    where: platform_usersWhereUniqueInput
    create: XOR<platform_usersCreateWithoutAudit_logsInput, platform_usersUncheckedCreateWithoutAudit_logsInput>
  }

  export type operatorsCreateWithoutAudit_logsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsCreateNestedOneWithoutOperatorInput
    rollups?: tenant_daily_rollupsCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUncheckedCreateWithoutAudit_logsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesUncheckedCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsUncheckedCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsUncheckedCreateNestedOneWithoutOperatorInput
    rollups?: tenant_daily_rollupsUncheckedCreateNestedManyWithoutOperatorInput
  }

  export type operatorsCreateOrConnectWithoutAudit_logsInput = {
    where: operatorsWhereUniqueInput
    create: XOR<operatorsCreateWithoutAudit_logsInput, operatorsUncheckedCreateWithoutAudit_logsInput>
  }

  export type platform_usersUpsertWithoutAudit_logsInput = {
    update: XOR<platform_usersUpdateWithoutAudit_logsInput, platform_usersUncheckedUpdateWithoutAudit_logsInput>
    create: XOR<platform_usersCreateWithoutAudit_logsInput, platform_usersUncheckedCreateWithoutAudit_logsInput>
    where?: platform_usersWhereInput
  }

  export type platform_usersUpdateToOneWithWhereWithoutAudit_logsInput = {
    where?: platform_usersWhereInput
    data: XOR<platform_usersUpdateWithoutAudit_logsInput, platform_usersUncheckedUpdateWithoutAudit_logsInput>
  }

  export type platform_usersUpdateWithoutAudit_logsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: Enumplatform_roleFieldUpdateOperationsInput | $Enums.platform_role
    mfa_enabled?: BoolFieldUpdateOperationsInput | boolean
    mfa_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_usersUncheckedUpdateWithoutAudit_logsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: Enumplatform_roleFieldUpdateOperationsInput | $Enums.platform_role
    mfa_enabled?: BoolFieldUpdateOperationsInput | boolean
    mfa_secret_encrypted?: NullableStringFieldUpdateOperationsInput | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operatorsUpsertWithoutAudit_logsInput = {
    update: XOR<operatorsUpdateWithoutAudit_logsInput, operatorsUncheckedUpdateWithoutAudit_logsInput>
    create: XOR<operatorsCreateWithoutAudit_logsInput, operatorsUncheckedCreateWithoutAudit_logsInput>
    where?: operatorsWhereInput
  }

  export type operatorsUpdateToOneWithWhereWithoutAudit_logsInput = {
    where?: operatorsWhereInput
    data: XOR<operatorsUpdateWithoutAudit_logsInput, operatorsUncheckedUpdateWithoutAudit_logsInput>
  }

  export type operatorsUpdateWithoutAudit_logsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUpdateOneWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsUncheckedUpdateWithoutAudit_logsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUncheckedUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUncheckedUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUncheckedUpdateOneWithoutOperatorNestedInput
    rollups?: tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsCreateWithoutRollupsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsCreateNestedManyWithoutOperatorInput
  }

  export type operatorsUncheckedCreateWithoutRollupsInput = {
    id?: string
    gra_registry_id: string
    name: string
    slug: string
    status?: $Enums.operator_status
    licence_number?: string | null
    default_tax_rate?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    tenant_database?: tenant_databasesUncheckedCreateNestedOneWithoutOperatorInput
    domains?: operator_domainsUncheckedCreateNestedManyWithoutOperatorInput
    settings?: operator_settingsUncheckedCreateNestedOneWithoutOperatorInput
    audit_logs?: platform_audit_logsUncheckedCreateNestedManyWithoutOperatorInput
  }

  export type operatorsCreateOrConnectWithoutRollupsInput = {
    where: operatorsWhereUniqueInput
    create: XOR<operatorsCreateWithoutRollupsInput, operatorsUncheckedCreateWithoutRollupsInput>
  }

  export type operatorsUpsertWithoutRollupsInput = {
    update: XOR<operatorsUpdateWithoutRollupsInput, operatorsUncheckedUpdateWithoutRollupsInput>
    create: XOR<operatorsCreateWithoutRollupsInput, operatorsUncheckedCreateWithoutRollupsInput>
    where?: operatorsWhereInput
  }

  export type operatorsUpdateToOneWithWhereWithoutRollupsInput = {
    where?: operatorsWhereInput
    data: XOR<operatorsUpdateWithoutRollupsInput, operatorsUncheckedUpdateWithoutRollupsInput>
  }

  export type operatorsUpdateWithoutRollupsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUpdateManyWithoutOperatorNestedInput
  }

  export type operatorsUncheckedUpdateWithoutRollupsInput = {
    id?: StringFieldUpdateOperationsInput | string
    gra_registry_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: Enumoperator_statusFieldUpdateOperationsInput | $Enums.operator_status
    licence_number?: NullableStringFieldUpdateOperationsInput | string | null
    default_tax_rate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant_database?: tenant_databasesUncheckedUpdateOneWithoutOperatorNestedInput
    domains?: operator_domainsUncheckedUpdateManyWithoutOperatorNestedInput
    settings?: operator_settingsUncheckedUpdateOneWithoutOperatorNestedInput
    audit_logs?: platform_audit_logsUncheckedUpdateManyWithoutOperatorNestedInput
  }

  export type operator_domainsCreateManyOperatorInput = {
    id?: string
    hostname: string
    domain_type: $Enums.domain_type
    verification_status?: $Enums.domain_verification_status
    ssl_status?: $Enums.ssl_status
    is_primary?: boolean
    created_at?: Date | string
  }

  export type platform_audit_logsCreateManyOperatorInput = {
    id?: string
    platform_user_id?: string | null
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type tenant_daily_rollupsCreateManyOperatorInput = {
    id?: string
    date: Date | string
    gross_sales?: Decimal | DecimalJsLike | number | string
    tax_collected?: Decimal | DecimalJsLike | number | string
    orders_count?: number
    active_raffles?: number
    failed_gra_events?: number
    created_at?: Date | string
  }

  export type operator_domainsUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_domainsUncheckedUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type operator_domainsUncheckedUpdateManyWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    hostname?: StringFieldUpdateOperationsInput | string
    domain_type?: Enumdomain_typeFieldUpdateOperationsInput | $Enums.domain_type
    verification_status?: Enumdomain_verification_statusFieldUpdateOperationsInput | $Enums.domain_verification_status
    ssl_status?: Enumssl_statusFieldUpdateOperationsInput | $Enums.ssl_status
    is_primary?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    platform_user?: platform_usersUpdateOneWithoutAudit_logsNestedInput
  }

  export type platform_audit_logsUncheckedUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform_user_id?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsUncheckedUpdateManyWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform_user_id?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_daily_rollupsUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_daily_rollupsUncheckedUpdateWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tenant_daily_rollupsUncheckedUpdateManyWithoutOperatorInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    gross_sales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax_collected?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orders_count?: IntFieldUpdateOperationsInput | number
    active_raffles?: IntFieldUpdateOperationsInput | number
    failed_gra_events?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsCreateManyPlatform_userInput = {
    id?: string
    operator_id?: string | null
    action: string
    entity_type: string
    entity_id?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type platform_audit_logsUpdateWithoutPlatform_userInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    operator?: operatorsUpdateOneWithoutAudit_logsNestedInput
  }

  export type platform_audit_logsUncheckedUpdateWithoutPlatform_userInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type platform_audit_logsUncheckedUpdateManyWithoutPlatform_userInput = {
    id?: StringFieldUpdateOperationsInput | string
    operator_id?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}