import { TokenType } from "./lexer.ts";
import { CallExpression } from "./parser.ts";

export default class Interpretter {
    private functions: {
        name: string;
        arguments: TokenType[]
    }[] = [];

    constructor(private exprs: CallExpression[]) {}

    execute() {
        for (const expr of this.exprs) {
            const fn = this.functions.find((f) => f.name == expr.name);
            
            if (!fn) 
                throw new Error(`${expr.name}: no such function`);
        }
    }
}
