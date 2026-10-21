import { Token, TokenType } from "./lexer.ts";

export interface CallExpression {
    type: 'CallExpression';
    name: string;
    arguments: Token[];
}

export default function parse(tokens: Token[]): CallExpression[] {
    const ast: CallExpression[] = [];
    let pos = 0;

    function peek(): Token | undefined {
        return tokens[pos];
    }

    function consume(type: TokenType): Token {
        const token = tokens[pos];

        if (!token || token.type !== type) {
            throw new Error(
                `Expected ${TokenType[type]}, got ${
                    token ? TokenType[token.type] : 'EOF'
                } at token index ${pos}`
            );
        }

        pos++;
        return token;
    }

    while (pos < tokens.length) {
        const name = consume(TokenType.IDENTIFIER).raw;

        consume(TokenType.LPAREN);

        const args: Token[] = [];

        while (peek() && peek()!.type !== TokenType.RPAREN) {
            const token = peek()!;

            if (token.type === TokenType.STRING || token.type === TokenType.IDENTIFIER) {
                args.push(token);
                pos++; continue;
            } else {
                throw new Error(
                    `Unexpected token ${JSON.stringify(token.raw)} at index ${pos}`
                );
            }
        }

        consume(TokenType.RPAREN);

        if (peek()?.type === TokenType.SEMICOLON) {
            consume(TokenType.SEMICOLON);
        }

        ast.push({
            type: 'CallExpression',
            name,
            arguments: args
        });
    }

    return ast;
}
