import Interpretter from "./interpretter.ts";
import parse from "./parser.ts";

export enum TokenType {
    LPAREN,
    RPAREN,
    IDENTIFIER,
    SEMICOLON,
    COLON,
    STRING,
    UNKNOWN
}

export interface Token {
    type: TokenType;
    raw: string;
}

export default function performLexing(module: string): Token[] {
    const output: Token[] = [];
    let currentToken = '';

    let inString = false;
    let ignoreLine = false;
    let escaped = false;

    function pushIdentifier() {
        if (!currentToken)
            return;

        output.push({
            type: TokenType.IDENTIFIER,
            raw: currentToken
        });

        currentToken = '';
    }

    for (let i = 0; i < module.length; i++) {
        const char = module[i];

        if (ignoreLine) {
            if (char === '\n')
                ignoreLine = false;
            continue;
        }

        if (inString) {
            currentToken += char;

            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                output.push({
                    type: TokenType.STRING,
                    raw: currentToken.slice(1, -1)
                });

                currentToken = '';
                inString = false;
            }

            continue;
        }

        if (char === '#') {
            pushIdentifier();
            ignoreLine = true;
            continue;
        }

        if (char === '"') {
            pushIdentifier();
            currentToken = '"';
            inString = true;
            continue;
        }

        if (/[a-zA-Z0-9_]/.test(char)) {
            currentToken += char;
            continue;
        }

        pushIdentifier();

        switch (char) {
        case ' ': case '\n': case '\r': case '\t':
            break;

        case '(':
            output.push({ type: TokenType.LPAREN, raw: char });
            break;

        case ')':
            output.push({ type: TokenType.RPAREN, raw: char });
            break;

        case ';':
            output.push({ type: TokenType.SEMICOLON, raw: char });
            break;

        case ',':
            output.push({ type: TokenType.COLON, raw: char });
            break;

        default:
            output.push({ type: TokenType.UNKNOWN, raw: char });
            break;
        }
    }

    pushIdentifier();

    return output;
}

new Interpretter(parse(performLexing(
`# This is a comment!

SetPackagesDistribution("debian");
SetPackagesRepo("stable");

SetTargetPath("scratchspace/target");

AddPackage("bash");

AddArchitecture("x86_64", "amd64");

SetInitFile("/usr/bin/bash");

Build();
`
))).execute();
