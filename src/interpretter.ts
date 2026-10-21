import getDebianPackages from "./distrubutions/debian.ts";
import { resolveDependencies } from "./distrubutions/debian-resolver.ts";
import {
  createUsrMergeLayout,
  downloadDeb,
  extractDeb,
} from "./distrubutions/debian-extract.ts";
import { Token, TokenType } from "./lexer.ts";
import { CallExpression } from "./parser.ts";

export default class Interpretter {
    private distro?: string;
    private repo?: string;
    private targetPath?: string;
    private initFile?: string;
    private packages: string[] = [];
    private architectures: { utopia: string; packages: string }[] = [];

    private functions: {
        name: string;
        arguments: TokenType[];
        execute(self: Interpretter, args: Token[]): unknown;
    }[] = [
        {
            name: "SetPackagesDistribution", arguments: [ TokenType.STRING ],
            execute(self: Interpretter, args) {
                const distro = args[0].raw;

                if (!['debian'].includes(distro))
                    throw new Error("No such Linux distribution supported.");

                self.distro = distro;

                console.log(`fsstrap: used ${distro} linux distribution as source for packages`);
            },
        },
        {
            name: "SetPackagesRepo", arguments: [ TokenType.STRING ],
            execute(self, args) {
                if (!self.distro)
                    throw new Error('Desired Linux distribution must be set before calling SetPackagesRepo()');

                self.repo = args[0].raw;

                console.log(`fsstrap: used ${self.repo} package repository`);
            },
        },
        {
            name: "SetTargetPath", arguments: [ TokenType.STRING ],
            execute(self, args) {
                self.targetPath = args[0].raw;

                while (self.targetPath.endsWith('/'))
                    self.targetPath = self.targetPath.slice(0, -1);

                console.log(`fsstrap: target path set to ${self.targetPath}`);
            },
        },
        {
            name: "SetInitFile", arguments: [ TokenType.STRING ],
            execute(self, args) {
                self.initFile = args[0].raw;

                console.log(`fsstrap: initramfs-relative init file path set to ${self.initFile}`);
            },
        },
        {
            name: "AddPackage", arguments: [ TokenType.STRING ],
            execute(self, args) {
                self.packages.push(args[0].raw);

                console.log(`fsstrap: added package: ${args[0].raw}`);
            },
        },
        {
            name: "AddArchitecture", arguments: [ TokenType.STRING, TokenType.STRING ],
            execute(self, args) {
                self.architectures.push({ utopia: args[0].raw, packages: args[1].raw });

                console.log(`fsstrap: added architecture definition: ${args[0].raw} (utopia), ${args[1].raw} (packages)`);
            },
        },
        {
            name: "Build", arguments: [],
            async execute(self) {
                if (
                    self.architectures.length == 0 || self.packages.length == 0
                )
                    throw new Error("No architectures or no packages. There is nothing to do.");

                const { initFile, targetPath, distro, repo } = self;

                if (!initFile || !targetPath || !distro || !repo)
                    throw new Error("You have to set init file path, target path, desired distribution and desired repository in order to start building.");

                console.log(`fsstrap: pre-build validation passed`);

                for (const arch of self.architectures) {
                    console.log(`fsstrap: \x1b[95mstarting build for architecture ${arch.utopia}\x1b[0m`);

                    const archTargetPath = `${targetPath}/internal.${arch.utopia}.${arch.packages}`;
                    Deno.mkdirSync(archTargetPath, {
                        recursive: true
                    });

                    console.log(`fsstrap: getting package list`);

                    const packageList = await getDebianPackages(archTargetPath, repo, arch.packages);

                    console.log(`fsstrap: resolving dependencies`);

                    const resolved = resolveDependencies(packageList, self.packages);

                    console.log(`fsstrap: ${resolved.length} packages to install (${self.packages.length} requested)`);

                    const debsDir = `${archTargetPath}/debs`;
                    const initramfsPath = `${targetPath}/initramfses/initramfs-${arch.utopia}`;

                    Deno.mkdirSync(debsDir, { recursive: true });

                    // clean tree so stale files don't leak between builds
                    try { Deno.removeSync(initramfsPath, { recursive: true }); } catch { /* didn't exist */ }
                    Deno.mkdirSync(initramfsPath, { recursive: true });

                    createUsrMergeLayout(initramfsPath);

                    for (const pkg of resolved) {
                        console.log(`fsstrap: installing ${pkg.package} ${pkg.version}`);

                        const debPath = await downloadDeb(pkg, debsDir);
                        await extractDeb(debPath, initramfsPath);
                    }

                    const initPath = `${initramfsPath}/${initFile.replace(/^\/+/, "")}`;
                    try {
                        Deno.statSync(initPath);
                    } catch {
                        throw new Error(`init file ${initFile} not found in ${initramfsPath} after installing packages`);
                    }

                    console.log(`fsstrap: \x1b[95mfinished ${arch.utopia}\x1b[0m -> ${initramfsPath}`);
                }
            },
        }
    ];

    constructor(private exprs: CallExpression[]) {}

    async execute() {
        for (const expr of this.exprs) {
            const fn = this.functions.find((f) => f.name == expr.name);

            if (!fn)
                throw new Error(`${expr.name}: no such function`);

            if (fn.arguments.length != expr.arguments.length)
                throw new Error(`${expr.name}: expected ${fn.arguments.length} arguments, found ${expr.arguments.length}`);

            for (let i = 0; i < fn.arguments.length; i++) {
                const argType = fn.arguments[i];

                if (argType != expr.arguments[i]?.type)
                    throw new Error(`${expr.name}: argument type mismatch: expected ${TokenType[argType]}`);
            }

            await fn.execute(this, expr.arguments);
        }

        console.log(`fsstrap: \x1b[92;1mdone.\x1b[0m`);
    }
}
