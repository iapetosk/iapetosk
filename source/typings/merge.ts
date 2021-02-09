declare type Merge<Type_1st, Type_2nd> = Omit<Type_1st, keyof Type_2nd> & Type_2nd;
