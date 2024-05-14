type JavascriptRepresentation = string;
type InvalidType = JavascriptRepresentation | 'null' | 'undefined';
type Nullable<T> = T | null;
type Undefinable<T> = T | undefined;
type OptionalValue<T> = Undefinable<T> | Nullable<T>;
