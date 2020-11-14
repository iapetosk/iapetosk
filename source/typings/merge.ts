declare type Merge<type_1st, type_2nd> = Omit<type_1st, keyof type_2nd> & type_2nd;
