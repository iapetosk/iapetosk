export type Override<type, override> = Pick<type, Exclude<keyof type, keyof override>> & override;
