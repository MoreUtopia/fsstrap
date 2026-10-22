import Interpretter from "./interpretter.ts";
import performLexing from "./lexer.ts";
import parse from "./parser.ts";

async function evaluate() {
    await new Interpretter(parse(performLexing(
        Deno.readTextFileSync('./Fsstrapfile')
    ))).execute();
}

try {
    if (Deno.args.length != 1)
        throw new Error('expected exactly one subcommand argument');

    switch (Deno.args[0]) {
    case 'help': case 'version':
        console.log([
            "Fsstrap - an actually good build-system for bootstraping Utopia-based", 
            "initramfses using Debian's packages.",
            "",
            "\x1b[1mversion:\x1b[0m 1.0.0",
            "\x1b[1mgithub:\x1b[0m https://github.com/MoreUtopia/fsstrap"
        ].join('\n')); break;
    case 'eval': case 'build':
        await evaluate(); break;
    default:
        throw new Error('unknown subcommand');
    }
} catch (e: unknown) {
    if (typeof e !== 'object') throw e;
    if (!(e instanceof Error)) throw e;
    
    console.error(`fsstrap: \x1b[91;1m${e.message}\x1b[0m\nfsstrap: unrecoverable error.`);
}
